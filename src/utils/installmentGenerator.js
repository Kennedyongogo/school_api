const { Op } = require("sequelize");
const {
  sequelize,
  FeeStructure,
  FeeDiscount,
  AcademicTerm,
  InstallmentPlan,
  Student,
  Enrollment,
  Section,
  StudentInstallmentPlan,
  Installment,
  InstallmentPayment,
} = require("../models");

function addDaysIso(dateOnlyStr, days) {
  const d = new Date(`${dateOnlyStr}T12:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function roundMoney(x) {
  return Math.round(Number(x) * 100) / 100;
}

async function resolveGradeLevelId(studentId) {
  const en = await Enrollment.findOne({
    where: { student_id: studentId, is_active: true },
    include: [{ model: Section, as: "section", attributes: ["grade_level_id"] }],
    order: [["enrollment_date", "DESC"]],
  });
  return en?.section?.grade_level_id ?? null;
}

async function computeTermFeesTotal(studentId, academicYearId, gradeLevelId) {
  const glCond =
    gradeLevelId != null
      ? {
          [Op.or]: [{ grade_level_id: gradeLevelId }, { grade_level_id: null }],
        }
      : { grade_level_id: null };

  const fees = await FeeStructure.findAll({
    where: {
      academic_year_id: academicYearId,
      is_active: true,
      ...glCond,
    },
  });

  let sum = 0;
  for (const fee of fees) {
    if (fee.is_per_term) sum += Number(fee.amount);
  }
  return roundMoney(sum);
}

async function applyDiscounts(totalIn, studentId, academicYearId, termId) {
  let total = totalIn;
  const discounts = await FeeDiscount.findAll({
    where: {
      student_id: studentId,
      academic_year_id: academicYearId,
      is_active: true,
      [Op.or]: [{ term_id: termId }, { term_id: null }],
    },
  });

  for (const d of discounts) {
    if (d.percentage != null && Number(d.percentage) > 0) {
      total *= 1 - Number(d.percentage) / 100;
    }
    if (d.fixed_amount != null && Number(d.fixed_amount) > 0) {
      total -= Number(d.fixed_amount);
    }
  }
  total = Math.max(0, roundMoney(total));
  return total;
}

/**
 * Generates StudentInstallmentPlan + Installment rows.
 * @param {object} opts
 * @param {boolean} opts.replaceExisting - destroy existing installments if none have payments
 */
async function generateInstallmentsForStudent(opts) {
  const {
    studentId,
    academicYearId,
    termId,
    installmentPlanId,
    gradeLevelId: gradeLevelIdInput,
    totalTermFeesOverride,
    replaceExisting = false,
  } = opts;

  const student = await Student.findByPk(studentId);
  if (!student) throw new Error("Student not found");

  const term = await AcademicTerm.findByPk(termId);
  if (!term || term.academic_year_id !== academicYearId) {
    throw new Error("Invalid term or academic year mismatch");
  }

  const plan = await InstallmentPlan.findByPk(installmentPlanId);
  if (!plan || plan.total_installments < 1) throw new Error("Invalid installment plan");

  const gradeLevelId =
    gradeLevelIdInput !== undefined && gradeLevelIdInput !== null
      ? gradeLevelIdInput
      : await resolveGradeLevelId(studentId);

  let discountedTotal =
    totalTermFeesOverride != null && totalTermFeesOverride !== ""
      ? roundMoney(Number(totalTermFeesOverride))
      : await computeTermFeesTotal(studentId, academicYearId, gradeLevelId);

  discountedTotal = await applyDiscounts(discountedTotal, studentId, academicYearId, termId);

  const n = plan.total_installments;
  const intervalDays = plan.installment_interval_days;

  const existingRows = await Installment.findAll({
    where: { student_id: studentId, academic_year_id: academicYearId, term_id: termId },
    attributes: ["id"],
  });
  if (existingRows.length && !replaceExisting) {
    throw new Error("Installments already exist for this student/term; pass replaceExisting=true to regenerate");
  }

  const base = roundMoney(Math.floor((discountedTotal * 100) / n) / 100);
  let allocated = roundMoney(base * (n - 1));
  let lastAmount = roundMoney(discountedTotal - allocated);

  const installments = [];

  await sequelize.transaction(async (t) => {
    if (existingRows.length && replaceExisting) {
      const ids = existingRows.map((r) => r.id);
      const paidLinks = await InstallmentPayment.count({
        where: { installment_id: { [Op.in]: ids }, status: "completed" },
        transaction: t,
      });
      if (paidLinks > 0) throw new Error("Cannot replace installments that already have completed payments");
      await Installment.destroy({ where: { id: { [Op.in]: ids } }, transaction: t });
    }

    const [sip, created] = await StudentInstallmentPlan.findOrCreate({
      where: {
        student_id: studentId,
        academic_year_id: academicYearId,
        term_id: termId,
      },
      defaults: {
        student_id: studentId,
        academic_year_id: academicYearId,
        term_id: termId,
        installment_plan_id: installmentPlanId,
        total_term_fees: discountedTotal,
        is_active: true,
      },
      transaction: t,
    });

    if (!created) {
      await sip.update(
        {
          installment_plan_id: installmentPlanId,
          total_term_fees: discountedTotal,
          is_active: true,
          selected_at: new Date(),
        },
        { transaction: t }
      );
    }

    for (let i = 0; i < n; i++) {
      const installmentNumber = i + 1;
      const amt = installmentNumber === n ? lastAmount : base;
      const dueDate = addDaysIso(term.start_date, i * intervalDays);

      const row = await Installment.create(
        {
          student_id: studentId,
          academic_year_id: academicYearId,
          term_id: termId,
          installment_number: installmentNumber,
          total_installments: n,
          amount: amt,
          due_date: dueDate,
          paid_amount: 0,
          balance: amt,
          status: "pending",
          grace_days: 7,
        },
        { transaction: t }
      );
      installments.push(row);
    }
  });

  return { studentInstallmentPlanTotal: discountedTotal, installments };
}

module.exports = {
  generateInstallmentsForStudent,
  resolveGradeLevelId,
  computeTermFeesTotal,
  applyDiscounts,
};
