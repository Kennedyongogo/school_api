const { Op } = require("sequelize");
const {
  Student,
  Parent,
  FeeStructure,
  FeeInvoice,
  FeePayment,
  Curriculum,
  CurriculumClass,
  CurriculumClassLevel,
} = require("../models");

const EXAM_FEE_MODES = ["none", "first_half_paid", "full_fee_paid", "custom_minimum"];

function money(n) {
  return Math.round(Number(n || 0) * 100) / 100;
}

function phaseAmount(breakdown, phase) {
  const list = Array.isArray(breakdown) ? breakdown : [];
  const row = list.find((p) => String(p?.phase || "") === phase);
  return money(row?.amount || 0);
}

function buildFeeSnapshot(feeStructure) {
  const breakdown = feeStructure.payment_breakdown || [];
  return {
    fee_structure_id: feeStructure.id,
    curriculum_id: feeStructure.curriculum_id,
    curriculum_class_id: feeStructure.curriculum_class_id,
    curriculum_class_level_id: feeStructure.curriculum_class_level_id,
    term_fee_amount: money(feeStructure.term_fee_amount),
    payment_breakdown: breakdown,
    first_half_amount: phaseAmount(breakdown, "first_half"),
    second_half_amount: phaseAmount(breakdown, "second_half"),
  };
}

async function resolveFeeStructureForStudent(student) {
  if (!student?.curriculum_id || !student?.curriculum_class_id || !student?.curriculum_class_level_id) {
    return null;
  }
  return FeeStructure.findOne({
    where: {
      curriculum_id: student.curriculum_id,
      curriculum_class_id: student.curriculum_class_id,
      curriculum_class_level_id: student.curriculum_class_level_id,
    },
    include: [
      { model: Curriculum, as: "curriculum", attributes: ["id", "name"], required: false },
      { model: CurriculumClass, as: "curriculum_class", attributes: ["id", "name", "code"], required: false },
      { model: CurriculumClassLevel, as: "curriculum_class_level", attributes: ["id", "name"], required: false },
    ],
  });
}

async function findParentForStudent(studentId) {
  const parents = await Parent.findAll({ attributes: ["id", "student_ids", "user_id"] });
  for (const p of parents) {
    const ids = Array.isArray(p.student_ids) ? p.student_ids : [];
    if (ids.map(String).includes(String(studentId))) return p;
  }
  return null;
}

async function sumPaymentsForStudentLevel(studentId, curriculumClassLevelId) {
  const where = { student_id: studentId };
  if (curriculumClassLevelId) where.curriculum_class_level_id = curriculumClassLevelId;
  const rows = await FeePayment.findAll({ where, attributes: ["amount"] });
  return money(rows.reduce((s, r) => s + Number(r.amount || 0), 0));
}

async function getPaymentAllocation(studentId, curriculumClassLevelId, snapshot) {
  const totalPaid = await sumPaymentsForStudentLevel(studentId, curriculumClassLevelId);
  const firstHalf = money(snapshot?.first_half_amount ?? phaseAmount(snapshot?.payment_breakdown, "first_half"));
  const termTotal = money(snapshot?.term_fee_amount || 0);
  const firstHalfPaid = Math.min(totalPaid, firstHalf);
  const secondHalfPaid = Math.max(0, totalPaid - firstHalf);
  return {
    total_paid: totalPaid,
    first_half_amount: firstHalf,
    second_half_amount: money(snapshot?.second_half_amount ?? phaseAmount(snapshot?.payment_breakdown, "second_half")),
    term_total: termTotal,
    first_half_paid: firstHalfPaid,
    first_half_satisfied: firstHalf <= 0 || firstHalfPaid >= firstHalf - 0.01,
    full_fee_satisfied: termTotal <= 0 || totalPaid >= termTotal - 0.01,
    second_half_paid: secondHalfPaid,
  };
}

async function recalcInvoiceTotals(invoice) {
  const payments = await FeePayment.findAll({
    where: { fee_invoice_id: invoice.id },
    attributes: ["amount"],
  });
  const amountPaid = money(payments.reduce((s, p) => s + Number(p.amount || 0), 0));
  const amountDue = money(invoice.amount_due);
  const balance = Math.max(0, money(amountDue - amountPaid));
  const creditBalance = Math.max(0, money(amountPaid - amountDue));
  let status = invoice.status;
  if (status !== "cancelled") {
    if (balance <= 0.01) status = "paid";
    else if (amountPaid > 0) status = "partial";
    else if (status === "paid") status = "sent";
    else if (!status || status === "draft") status = invoice.sent_at ? "sent" : "draft";
  }
  const snap = { ...(invoice.fee_snapshot_json || {}) };
  if (creditBalance > 0.01) {
    snap.credit_balance = creditBalance;
  } else if (snap.credit_balance != null) {
    delete snap.credit_balance;
  }
  await invoice.update({
    amount_paid: amountPaid,
    balance,
    status,
    fee_snapshot_json: snap,
  });
  return invoice.reload();
}

function buildCarryForwardMessage(creditBalance, allocation) {
  if (creditBalance <= 0.01) return null;
  const parts = [
    `KES ${creditBalance.toLocaleString()} is more than this invoice required.`,
    "That extra amount is kept as credit on your child's account for this term/level.",
  ];
  if (allocation?.full_fee_satisfied) {
    parts.push("The full level fee is already covered; the credit remains for school records and any later adjustments.");
  } else if (allocation?.first_half_satisfied && !allocation?.full_fee_satisfied) {
    parts.push("It will count toward the remaining installment (2nd half) on this invoice.");
  }
  return parts.join(" ");
}

function buildPaymentReceipt(invoice, payAmount, balanceBeforePayment) {
  const appliedToInvoice = Math.min(money(payAmount), money(balanceBeforePayment));
  const excessFromPayment = Math.max(0, money(payAmount - appliedToInvoice));
  const amountPaid = money(invoice.amount_paid);
  const amountDue = money(invoice.amount_due);
  const creditBalance = Math.max(0, money(amountPaid - amountDue));
  const snap = invoice.fee_snapshot_json || {};
  return {
    amount_submitted: money(payAmount),
    applied_to_invoice: appliedToInvoice,
    excess_from_payment: excessFromPayment,
    invoice_credit_balance: creditBalance,
    balance_remaining: money(invoice.balance),
    has_excess: excessFromPayment > 0.01 || creditBalance > 0.01,
    carry_forward_message: buildCarryForwardMessage(creditBalance, null),
  };
}

function invoiceNumber() {
  const t = Date.now().toString(36).toUpperCase();
  const r = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `INV-${t}-${r}`;
}

async function generateInvoiceForStudent({
  studentId,
  parentId = null,
  feeStructureId = null,
  curriculumClassLevelId = null,
  sendToParent = false,
  notes = null,
}) {
  const student = await Student.findByPk(studentId);
  if (!student) throw new Error("Student not found");

  const levelId = curriculumClassLevelId || student.curriculum_class_level_id;
  if (!levelId) {
    throw new Error(
      "Student has no curriculum Term/level set. Edit the student profile in Elimu Plus and select class and Term/level."
    );
  }

  let feeStructure = null;
  if (feeStructureId) {
    feeStructure = await FeeStructure.findByPk(feeStructureId);
  } else {
    feeStructure = await resolveFeeStructureForStudent(student);
  }
  if (!feeStructure) {
    throw new Error("No fee structure found for this student's class and level.");
  }

  const parent =
    parentId != null
      ? await Parent.findByPk(parentId)
      : await findParentForStudent(studentId);

  const snapshot = buildFeeSnapshot(feeStructure);
  const amountDue = money(snapshot.term_fee_amount);

  const existing = await FeeInvoice.findOne({
    where: {
      student_id: studentId,
      curriculum_class_level_id: levelId,
      status: { [Op.notIn]: ["cancelled"] },
    },
    order: [["created_at", "DESC"]],
  });
  if (existing) {
    await existing.update({
      parent_id: parent?.id || existing.parent_id,
      fee_structure_id: feeStructure.id,
      fee_snapshot_json: snapshot,
      amount_due: amountDue,
      balance: Math.max(0, money(amountDue - existing.amount_paid)),
      notes: notes != null ? notes : existing.notes,
      ...(sendToParent ? { status: "sent", sent_at: existing.sent_at || new Date() } : {}),
    });
    return recalcInvoiceTotals(existing);
  }

  const invoice = await FeeInvoice.create({
    invoice_number: invoiceNumber(),
    parent_id: parent?.id || null,
    student_id: studentId,
    fee_structure_id: feeStructure.id,
    curriculum_class_level_id: levelId,
    fee_snapshot_json: snapshot,
    amount_due: amountDue,
    amount_paid: 0,
    balance: amountDue,
    status: sendToParent ? "sent" : "draft",
    sent_at: sendToParent ? new Date() : null,
    notes,
  });
  return invoice;
}

async function recordPayment({
  invoiceId,
  amount,
  parentId = null,
  recordedBy = null,
  paymentMethod = "manual",
  reference = null,
  notes = null,
  paidAt = null,
}) {
  const invoice = await FeeInvoice.findByPk(invoiceId);
  if (!invoice) throw new Error("Invoice not found");
  const payAmount = money(amount);
  if (payAmount <= 0) throw new Error("Payment amount must be greater than zero.");

  const balanceBefore = money(invoice.balance);

  const payment = await FeePayment.create({
    fee_invoice_id: invoice.id,
    parent_id: parentId || invoice.parent_id,
    student_id: invoice.student_id,
    curriculum_class_level_id: invoice.curriculum_class_level_id,
    amount: payAmount,
    payment_method: paymentMethod,
    reference,
    notes,
    recorded_by: recordedBy,
    paid_at: paidAt || new Date(),
  });

  const updated = await recalcInvoiceTotals(invoice);
  const reloaded = await FeeInvoice.findByPk(updated.id);
  const receipt = buildPaymentReceipt(reloaded, payAmount, balanceBefore);
  const allocation = await getPaymentAllocation(
    reloaded.student_id,
    reloaded.curriculum_class_level_id,
    reloaded.fee_snapshot_json || {}
  );
  receipt.allocation = allocation;
  receipt.carry_forward_message = buildCarryForwardMessage(receipt.invoice_credit_balance, allocation);

  return { payment, invoice: reloaded, payment_receipt: receipt };
}

/** Custom minimum uses only `exam_fee_minimum_amount` — not full fee or 1st-half rules. */
function requiredAmountForCustom(exam) {
  const explicitRaw = exam?.exam_fee_minimum_amount;
  const explicit =
    explicitRaw != null && String(explicitRaw).trim() !== "" ? money(explicitRaw) : null;
  if (explicit == null || explicit <= 0) {
    return {
      error:
        "This exam is set to custom minimum fee but no amount was configured. Ask the school to set the minimum amount (KES) on the exam.",
    };
  }
  return { amount: explicit };
}

function buildCustomMinimumFeeMessage(required, paid, shortfall) {
  return (
    `This exam requires a minimum fee of KES ${required.toLocaleString()} before you can open it. ` +
    `You have paid KES ${paid.toLocaleString()}. ` +
    (shortfall > 0.01
      ? `Please pay KES ${shortfall.toLocaleString()} more under School fees, then try again.`
      : "Your payments meet this requirement — refresh the page if the button is still disabled.")
  );
}

async function evaluateExamFeeAccess(student, exam) {
  const mode = String(exam?.exam_fee_access_mode || "none").trim();
  if (!EXAM_FEE_MODES.includes(mode) || mode === "none") {
    return { allowed: true, mode, message: null, allocation: null };
  }

  if (!student) {
    return { allowed: false, mode, message: "Student profile not found.", allocation: null };
  }

  const feeStructure = await resolveFeeStructureForStudent(student);
  if (!feeStructure) {
    return {
      allowed: false,
      mode,
      message: "No fee structure for your class and level. Contact the school.",
      allocation: null,
    };
  }

  const levelId = student.curriculum_class_level_id;
  const snapshot = buildFeeSnapshot(feeStructure);
  const allocation = await getPaymentAllocation(student.id, levelId, snapshot);

  if (mode === "first_half_paid") {
    if (allocation.first_half_satisfied) {
      return { allowed: true, mode, message: null, allocation };
    }
    const userMessage = `The first half of your term fee (KES ${allocation.first_half_amount.toLocaleString()}) must be paid before this exam. You have paid KES ${allocation.total_paid.toLocaleString()} so far.`;
    return {
      allowed: false,
      mode,
      message: userMessage,
      user_message: userMessage,
      allocation,
      required_amount: allocation.first_half_amount,
      amount_paid: allocation.total_paid,
      amount_shortfall: Math.max(0, money(allocation.first_half_amount - allocation.total_paid)),
    };
  }

  if (mode === "full_fee_paid") {
    if (allocation.full_fee_satisfied) {
      return { allowed: true, mode, message: null, allocation };
    }
    const userMessage = `The full term fee (KES ${allocation.term_total.toLocaleString()}) must be paid before this exam. You have paid KES ${allocation.total_paid.toLocaleString()} so far.`;
    return {
      allowed: false,
      mode,
      message: userMessage,
      user_message: userMessage,
      allocation,
      required_amount: allocation.term_total,
      amount_paid: allocation.total_paid,
      amount_shortfall: Math.max(0, money(allocation.term_total - allocation.total_paid)),
    };
  }

  if (mode === "custom_minimum") {
    const req = requiredAmountForCustom(exam);
    if (req.error) {
      return {
        allowed: false,
        mode,
        message: req.error,
        user_message: req.error,
        allocation,
      };
    }
    const required = req.amount;
    const paid = money(allocation.total_paid);
    const shortfall = Math.max(0, money(required - paid));
    if (paid >= required - 0.01) {
      return {
        allowed: true,
        mode,
        message: null,
        allocation,
        required_amount: required,
        amount_paid: paid,
        amount_shortfall: 0,
      };
    }
    const userMessage = buildCustomMinimumFeeMessage(required, paid, shortfall);
    return {
      allowed: false,
      mode,
      message: userMessage,
      user_message: userMessage,
      allocation,
      required_amount: required,
      amount_paid: paid,
      amount_shortfall: shortfall,
    };
  }

  return { allowed: true, mode, message: null, allocation };
}

function formatInvoiceDocument(invoice, student, parentUser, payments = []) {
  const snap = invoice.fee_snapshot_json || {};
  const breakdown = Array.isArray(snap.payment_breakdown) ? snap.payment_breakdown : [];
  return {
    invoice_number: invoice.invoice_number,
    status: invoice.status,
    sent_at: invoice.sent_at,
    student: student
      ? {
          id: student.id,
          admission_number: student.admission_number,
          name: student.user?.full_name || student.user?.username,
        }
      : null,
    parent: parentUser
      ? { name: parentUser.full_name || parentUser.username, email: parentUser.email }
      : null,
    curriculum_class_level_id: invoice.curriculum_class_level_id || snap.curriculum_class_level_id,
    level_name:
      invoice.curriculum_class_level?.name ||
      snap.level_name ||
      null,
    term_fee_amount: money(snap.term_fee_amount),
    amount_due: money(invoice.amount_due),
    amount_paid: money(invoice.amount_paid),
    balance: money(invoice.balance),
    credit_balance: money(
      snap.credit_balance != null ? snap.credit_balance : Math.max(0, Number(invoice.amount_paid || 0) - Number(invoice.amount_due || 0))
    ),
    payment_breakdown: breakdown,
    payments: payments.map((p) => ({
      id: p.id,
      amount: money(p.amount),
      paid_at: p.paid_at,
      payment_method: p.payment_method,
      reference: p.reference,
    })),
    notes: invoice.notes,
  };
}

module.exports = {
  EXAM_FEE_MODES,
  money,
  resolveFeeStructureForStudent,
  findParentForStudent,
  buildFeeSnapshot,
  generateInvoiceForStudent,
  recordPayment,
  recalcInvoiceTotals,
  getPaymentAllocation,
  evaluateExamFeeAccess,
  formatInvoiceDocument,
  sumPaymentsForStudentLevel,
  buildPaymentReceipt,
};
