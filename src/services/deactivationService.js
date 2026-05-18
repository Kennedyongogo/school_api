const moment = require("moment");
const { Op } = require("sequelize");
const {
  sequelize,
  Student,
  User,
  Parent,
  Installment,
  PaymentGracePeriod,
  AccountStatus,
  DeactivationLog,
} = require("../models");
const { blockStudentAccess } = require("./studentAccessControl");
const {
  sendDeactivationNotification,
  sendWarningNotification,
} = require("./deactivationNotifications");

async function getPrimaryParentId(studentId) {
  const parent = await Parent.findOne({
    where: { student_ids: { [Op.contains]: [studentId] } },
    attributes: ["id"],
  });
  return parent?.id ?? null;
}

async function deactivateStudentForNonPayment(
  student,
  anchorInstallment,
  daysOverdue,
  graceDays,
  { performedByUserId = null, ipAddress = null } = {}
) {
  const parentId = await getPrimaryParentId(student.id);
  const outstanding = Number(anchorInstallment.balance || 0);
  const graceEnd = moment(anchorInstallment.due_date).add(graceDays, "days").format("YYYY-MM-DD");
  const reasonText = `Outstanding balance ${outstanding}; ${daysOverdue} days overdue (grace ${graceDays} days)`;

  await sequelize.transaction(async (t) => {
    await student.update(
      {
        account_status: "deactivated",
        account_status_updated_at: new Date(),
        last_deactivation_reason: reasonText,
        reactivation_required: true,
      },
      { transaction: t }
    );

    await User.update({ is_active: false }, { where: { id: student.user_id }, transaction: t });

    await AccountStatus.create(
      {
        student_id: student.id,
        status: "deactivated",
        reason: reasonText,
        triggered_by: performedByUserId ? "admin" : "system",
        deactivated_at: new Date(),
        outstanding_balance: outstanding,
        grace_period_end: graceEnd,
        notification_sent: false,
        reactivation_required: true,
      },
      { transaction: t }
    );

    await DeactivationLog.create(
      {
        student_id: student.id,
        parent_id: parentId,
        action: "deactivated",
        reason: reasonText,
        outstanding_amount: outstanding,
        installment_id: anchorInstallment.id,
        performed_by: performedByUserId,
        ip_address: ipAddress,
        metadata: {
          days_overdue: daysOverdue,
          grace_days: graceDays,
        },
      },
      { transaction: t }
    );
  });

  await blockStudentAccess(student.id);
  await sendDeactivationNotification({
    student_id: student.id,
    parent_id: parentId,
    installment_id: anchorInstallment.id,
    reason: reasonText,
  });
}

async function deactivateStudentManually(studentId, { reason, performedByUserId, ipAddress }) {
  const student = await Student.findByPk(studentId);
  if (!student) throw new Error("Student not found");

  const parentId = await getPrimaryParentId(student.id);

  await sequelize.transaction(async (t) => {
    await student.update(
      {
        account_status: "deactivated",
        account_status_updated_at: new Date(),
        last_deactivation_reason: reason,
        reactivation_required: true,
      },
      { transaction: t }
    );

    await User.update({ is_active: false }, { where: { id: student.user_id }, transaction: t });

    await AccountStatus.create(
      {
        student_id: student.id,
        status: "deactivated",
        reason,
        triggered_by: "admin",
        deactivated_at: new Date(),
        reactivation_required: true,
      },
      { transaction: t }
    );

    await DeactivationLog.create(
      {
        student_id: student.id,
        parent_id: parentId,
        action: "manual_override",
        reason,
        performed_by: performedByUserId,
        ip_address: ipAddress,
        metadata: { manual: true },
      },
      { transaction: t }
    );
  });

  await blockStudentAccess(student.id);
}

async function markStudentPendingPayment(studentId, anchorInstallment, daysOverdue, graceDays) {
  const student = await Student.findByPk(studentId);
  if (!student || ["deactivated", "expelled", "withdrawn"].includes(student.account_status)) {
    return;
  }

  const parentId = await getPrimaryParentId(studentId);

  const prev = student.account_status;
  await student.update({
    account_status: "pending_payment",
    account_status_updated_at: new Date(),
    last_deactivation_reason: `Payment overdue ${daysOverdue} day(s); grace ends in ${Math.max(
      0,
      graceDays - daysOverdue
    )} day(s)`,
  });

  if (prev !== "pending_payment") {
    const ever = await DeactivationLog.count({
      where: {
        student_id: studentId,
        installment_id: anchorInstallment.id,
        action: "grace_period_started",
      },
    });
    if (ever === 0) {
      await DeactivationLog.create({
        student_id: studentId,
        parent_id: parentId,
        action: "grace_period_started",
        reason: `Installment overdue ${daysOverdue} days (within ${graceDays}-day grace)`,
        outstanding_amount: anchorInstallment.balance,
        installment_id: anchorInstallment.id,
        metadata: { grace_days: graceDays },
      });
    }
  }
}

async function maybeSendWarning(studentId, installment, daysOverdue, graceDays, warningDays) {
  const normalized = Array.isArray(warningDays) ? warningDays : [3, 7, 10];
  const shouldWarn =
    normalized.includes(daysOverdue) || daysOverdue === 1 || daysOverdue === Math.floor(graceDays / 2);

  if (!shouldWarn) return;

  const todayStart = moment().startOf("day").toDate();
  const todayEnd = moment().endOf("day").toDate();

  const dup = await DeactivationLog.count({
    where: {
      student_id: studentId,
      installment_id: installment.id,
      action: "warning_sent",
      created_at: { [Op.between]: [todayStart, todayEnd] },
    },
  });

  if (dup > 0) return;

  const parentId = await getPrimaryParentId(studentId);

  await DeactivationLog.create({
    student_id: studentId,
    parent_id: parentId,
    action: "warning_sent",
    reason: `Payment overdue by ${daysOverdue} days`,
    outstanding_amount: installment.balance,
    installment_id: installment.id,
    metadata: {
      days_overdue: daysOverdue,
      grace_days_remaining: Math.max(0, graceDays - daysOverdue),
    },
  });

  await sendWarningNotification({
    student_id: studentId,
    installment_id: installment.id,
    days_overdue: daysOverdue,
    grace_days: graceDays,
  });
}

async function reconcileStudentPendingPayment(studentId) {
  const todayStr = moment().format("YYYY-MM-DD");
  const student = await Student.findByPk(studentId);
  if (!student || student.account_status !== "pending_payment") return;

  const still = await Installment.count({
    where: {
      student_id: studentId,
      balance: { [Op.gt]: 0 },
      due_date: { [Op.lt]: todayStr },
      status: { [Op.notIn]: ["cancelled", "paid"] },
    },
  });
  if (still === 0) {
    await student.update({
      account_status: "active",
      account_status_updated_at: new Date(),
      last_deactivation_reason: null,
    });
  }
}

async function reconcileStudentsPendingPayment() {
  const pendingStudents = await Student.findAll({
    where: { account_status: "pending_payment" },
    attributes: ["id"],
  });

  for (const s of pendingStudents) {
    await reconcileStudentPendingPayment(s.id);
  }
}

async function runOverduePaymentCheck() {
  const todayStr = moment().format("YYYY-MM-DD");

  const overdueRows = await Installment.findAll({
    where: {
      balance: { [Op.gt]: 0 },
      status: { [Op.in]: ["pending", "partial", "overdue"] },
      due_date: { [Op.lt]: todayStr },
    },
    include: [{ model: Student, as: "student", required: true }],
  });

  const byStudent = new Map();
  for (const row of overdueRows) {
    if (!byStudent.has(row.student_id)) byStudent.set(row.student_id, []);
    byStudent.get(row.student_id).push(row);
  }

  for (const [, installments] of byStudent) {
    installments.sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
    const anchor = installments[0];
    const student = anchor.student;

    if (!student || ["deactivated", "expelled", "withdrawn"].includes(student.account_status)) {
      continue;
    }

    const gp = await PaymentGracePeriod.findOne({
      where: {
        academic_year_id: anchor.academic_year_id,
        term_id: anchor.term_id,
        is_active: true,
      },
    });
    const graceDays = gp ? gp.grace_days : anchor.grace_days || 14;
    const warningDays = gp?.warning_days;

    const daysOverdue = Math.max(
      0,
      moment(todayStr).diff(moment(anchor.due_date).startOf("day"), "days")
    );

    await Installment.update(
      { status: "overdue" },
      {
        where: {
          id: { [Op.in]: installments.map((i) => i.id) },
          status: { [Op.in]: ["pending", "partial"] },
        },
      }
    );

    if (daysOverdue <= graceDays) {
      await markStudentPendingPayment(student.id, anchor, daysOverdue, graceDays);
      await maybeSendWarning(student.id, anchor, daysOverdue, graceDays, warningDays);
      continue;
    }

    await deactivateStudentForNonPayment(student, anchor, daysOverdue, graceDays);
  }

  await reconcileStudentsPendingPayment();
}

module.exports = {
  deactivateStudentForNonPayment,
  deactivateStudentManually,
  runOverduePaymentCheck,
  reconcileStudentPendingPayment,
  reconcileStudentsPendingPayment,
  getPrimaryParentId,
};
