const { Op } = require("sequelize");
const {
  sequelize,
  Student,
  User,
  Installment,
  StudentParent,
  AccountStatus,
  DeactivationLog,
} = require("../models");
const { sendReactivationNotification } = require("./deactivationNotifications");

async function getPrimaryParentId(studentId) {
  const link = await StudentParent.findOne({
    where: { student_id: studentId },
    order: [
      ["is_primary_contact", "DESC"],
      ["created_at", "ASC"],
    ],
  });
  return link?.parent_id ?? null;
}

async function sumOutstandingInstallments(studentId) {
  const sum = await Installment.sum("balance", {
    where: {
      student_id: studentId,
      balance: { [Op.gt]: 0 },
      status: { [Op.notIn]: ["cancelled"] },
    },
  });
  return Number(sum || 0);
}

async function tryAutoReactivateStudent(studentId) {
  const student = await Student.findByPk(studentId);
  if (!student || student.account_status !== "deactivated") {
    return { reactivated: false, reason: "not_deactivated" };
  }

  const owing = await sumOutstandingInstallments(studentId);
  if (owing > 0.02) {
    return { reactivated: false, reason: "balance_remaining", outstanding: owing };
  }

  const parentId = await getPrimaryParentId(studentId);

  await sequelize.transaction(async (t) => {
    await student.update(
      {
        account_status: "active",
        account_status_updated_at: new Date(),
        reactivation_required: false,
        last_deactivation_reason: null,
      },
      { transaction: t }
    );

    await User.update({ is_active: true }, { where: { id: student.user_id }, transaction: t });

    await AccountStatus.create(
      {
        student_id: student.id,
        status: "active",
        reason: "All installment balances cleared",
        triggered_by: "system",
        reactivated_at: new Date(),
        reactivation_required: false,
      },
      { transaction: t }
    );

    await DeactivationLog.create(
      {
        student_id: student.id,
        parent_id: parentId,
        action: "reactivated",
        reason: "All outstanding installments paid",
        outstanding_amount: 0,
        performed_by: null,
        metadata: { source: "auto_payment" },
      },
      { transaction: t }
    );
  });

  await sendReactivationNotification({ student_id: student.id, parent_id: parentId });
  return { reactivated: true };
}

async function reactivateStudentManually(studentId, { reason, performedByUserId, ipAddress, force }) {
  const student = await Student.findByPk(studentId);
  if (!student) throw new Error("Student not found");

  if (!force) {
    const owing = await sumOutstandingInstallments(studentId);
    if (owing > 0.02) {
      throw new Error(`Outstanding installment balance remains (${owing})`);
    }
  }

  const parentId = await getPrimaryParentId(studentId);

  await sequelize.transaction(async (t) => {
    await student.update(
      {
        account_status: "active",
        account_status_updated_at: new Date(),
        reactivation_required: false,
        last_deactivation_reason: null,
      },
      { transaction: t }
    );

    await User.update({ is_active: true }, { where: { id: student.user_id }, transaction: t });

    await AccountStatus.create(
      {
        student_id: student.id,
        status: "active",
        reason: reason || "Manual reactivation",
        triggered_by: "admin",
        reactivated_at: new Date(),
        reactivation_required: false,
      },
      { transaction: t }
    );

    await DeactivationLog.create(
      {
        student_id: student.id,
        parent_id: parentId,
        action: force ? "manual_override" : "reactivated",
        reason: reason || "Manual reactivation",
        performed_by: performedByUserId,
        ip_address: ipAddress,
        metadata: { manual: true, force: !!force },
      },
      { transaction: t }
    );
  });

  await sendReactivationNotification({ student_id: student.id, parent_id: parentId });
  return { success: true };
}

module.exports = {
  tryAutoReactivateStudent,
  reactivateStudentManually,
  sumOutstandingInstallments,
};
