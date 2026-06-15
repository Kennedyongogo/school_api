const { Op } = require("sequelize");
const {
<<<<<<< HEAD
  sequelize,
  FeeInvoice,
  FeePayment,
  StudentLevelFeeCredit,
=======
  FeeInvoice,
  FeePayment,
>>>>>>> dbf38d6042c6ec91a0dd55101879df2f1e151a96
  Student,
  Parent,
  User,
  FeeStructure,
  Curriculum,
  CurriculumClass,
  CurriculumClassLevel,
} = require("../models");
<<<<<<< HEAD
const { applyPayment, money: paymentMoney } = require("../services/feePaymentService");

const userExclude = { exclude: ["password_hash"] };
=======
const {
  generateInvoiceForStudent,
  recordPayment,
  formatInvoiceDocument,
  findParentForStudent,
} = require("../utils/feeBillingService");

const userSafe = { attributes: { exclude: ["password_hash"] } };
>>>>>>> dbf38d6042c6ec91a0dd55101879df2f1e151a96

const invoiceIncludes = [
  {
    model: Student,
    as: "student",
<<<<<<< HEAD
    include: [{ model: User, as: "user", attributes: userExclude }],
  },
  { model: CurriculumClassLevel, as: "curriculum_class_level", attributes: ["id", "name", "level_order"] },
  { model: FeeStructure, as: "fee_structure", attributes: ["id", "term_fee_amount", "payment_breakdown"], required: false },
];

const paymentIncludes = [
  {
    model: FeeInvoice,
    as: "fee_invoice",
    attributes: ["id", "invoice_number", "status", "amount_due", "amount_paid", "balance", "term_fee_amount"],
  },
  {
    model: Student,
    as: "student",
    include: [
      { model: User, as: "user", attributes: userExclude },
      {
        model: CurriculumClassLevel,
        as: "curriculum_class_level",
        attributes: ["id", "name"],
        required: false,
      },
    ],
=======
    include: [{ model: User, as: "user", ...userSafe }],
>>>>>>> dbf38d6042c6ec91a0dd55101879df2f1e151a96
  },
  {
    model: Parent,
    as: "parent",
    required: false,
<<<<<<< HEAD
    include: [{ model: User, as: "user", attributes: userExclude }],
  },
  { model: User, as: "recorded_by_user", attributes: userExclude, required: false },
];

function money(n) {
  return paymentMoney(n);
}

function serializeInvoice(row, creditBalance = 0) {
  const plain = row.get ? row.get({ plain: true }) : { ...row };
  const studentUser = plain.student?.user;
  return {
    ...plain,
    student: plain.student
      ? {
          ...plain.student,
          name: studentUser?.full_name || studentUser?.username || plain.student.admission_number,
        }
      : null,
    level_name: plain.curriculum_class_level?.name || null,
    credit_balance: money(creditBalance),
  };
}

async function getLevelCredit(studentId, levelId, transaction) {
  if (!studentId || !levelId) return 0;
  const row = await StudentLevelFeeCredit.findOne({
    where: { student_id: studentId, curriculum_class_level_id: levelId },
    transaction,
  });
  return row ? money(row.credit_balance) : 0;
}

async function addLevelCredit(studentId, levelId, delta, transaction) {
  if (!delta || delta <= 0) return money(await getLevelCredit(studentId, levelId, transaction));
  const [row] = await StudentLevelFeeCredit.findOrCreate({
    where: { student_id: studentId, curriculum_class_level_id: levelId },
    defaults: { credit_balance: 0 },
    transaction,
  });
  const next = money(Number(row.credit_balance) + delta);
  await row.update({ credit_balance: next }, { transaction });
  return next;
}

function buildInvoiceNumber() {
  const t = Date.now().toString(36).toUpperCase();
  return `INV-${t.slice(-8)}`;
}

async function findParentForStudent(studentId) {
  return Parent.findOne({
    where: { student_ids: { [Op.contains]: [studentId] } },
  });
}

/** Active or settled invoice for the same student + term/level (blocks duplicate billing). */
async function findTermLevelInvoice(studentId, levelId, transaction) {
  if (!studentId || !levelId) return null;
  return FeeInvoice.findOne({
    where: {
      student_id: studentId,
      curriculum_class_level_id: levelId,
      status: { [Op.ne]: "cancelled" },
    },
    order: [["created_at", "DESC"]],
    transaction,
  });
}

function duplicateInvoiceMessage(existing) {
  const inv = existing.invoice_number || existing.id;
  if (existing.status === "paid") {
    return `This student already has a paid invoice for this term/level (${inv}). Generate a new invoice only after they move to a new term/level or billing cycle.`;
  }
  const balance = Number(existing.balance || 0).toLocaleString();
  return `An invoice already exists for this student and term/level (${inv}, balance KES ${balance}). Use Record payment for installments or partial payments, or cancel that invoice if it was created in error.`;
}

async function loadStudentForBilling(studentId) {
  return Student.findByPk(studentId, {
    include: [
      { model: User, as: "user", attributes: userExclude },
      { model: Curriculum, as: "curriculum", attributes: ["id", "name"], required: false },
      { model: CurriculumClass, as: "curriculum_class", attributes: ["id", "name", "curriculum_id"], required: false },
      { model: CurriculumClassLevel, as: "curriculum_class_level", attributes: ["id", "name", "curriculum_class_id"], required: false },
    ],
  });
}

exports.listInvoices = async (req, res) => {
  try {
    const limit = Math.min(200, Math.max(1, parseInt(req.query.limit, 10) || 50));
    const where = {};
    if (req.query.student_id) where.student_id = req.query.student_id;
    if (req.query.status) where.status = req.query.status;

    const rows = await FeeInvoice.findAll({
=======
    include: [{ model: User, as: "user", ...userSafe }],
  },
  { model: FeeStructure, as: "fee_structure", required: false },
  {
    model: CurriculumClassLevel,
    as: "curriculum_class_level",
    attributes: ["id", "name"],
    required: false,
  },
];

exports.listFeeInvoices = async (req, res) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));
    const offset = (page - 1) * limit;
    const where = {};
    if (req.query.student_id) where.student_id = req.query.student_id;
    if (req.query.status) where.status = String(req.query.status);
    if (req.query.parent_id) where.parent_id = req.query.parent_id;

    const { count, rows } = await FeeInvoice.findAndCountAll({
>>>>>>> dbf38d6042c6ec91a0dd55101879df2f1e151a96
      where,
      include: invoiceIncludes,
      order: [["created_at", "DESC"]],
      limit,
<<<<<<< HEAD
    });

    const data = await Promise.all(
      rows.map(async (row) => {
        const credit = await getLevelCredit(row.student_id, row.curriculum_class_level_id);
        return serializeInvoice(row, credit);
      })
    );

    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.listMyInvoices = async (req, res) => {
  try {
    const parent = await Parent.findOne({ where: { user_id: req.user.id } });
    if (!parent) {
      return res.status(404).json({ success: false, message: "Parent profile not found" });
    }
    const studentIds = Array.isArray(parent.student_ids) ? parent.student_ids.filter(Boolean) : [];
    if (!studentIds.length) {
      return res.json({ success: true, data: [] });
    }

    const rows = await FeeInvoice.findAll({
      where: {
        student_id: { [Op.in]: studentIds },
        status: { [Op.ne]: "cancelled" },
      },
      include: invoiceIncludes,
      order: [["created_at", "DESC"]],
    });

    const data = await Promise.all(
      rows.map(async (row) => {
        const credit = await getLevelCredit(row.student_id, row.curriculum_class_level_id);
        return serializeInvoice(row, credit);
      })
    );

    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.generateInvoice = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { student_id, send_to_parent, notes } = req.body || {};
    if (!student_id) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: "student_id is required" });
    }

    const student = await loadStudentForBilling(student_id);
    if (!student) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const levelId = student.curriculum_class_level_id;
    const classId = student.curriculum_class_id;
    const curriculumId = student.curriculum_id;

    if (!levelId || !classId || !curriculumId) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Student must have curriculum, class, and term/level set before generating an invoice.",
      });
    }

    const feeStructure = await FeeStructure.findOne({
      where: {
        curriculum_id: curriculumId,
        curriculum_class_id: classId,
        curriculum_class_level_id: levelId,
      },
      transaction,
    });

    if (!feeStructure) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "No fee structure found for this student's curriculum, class, and term/level.",
      });
    }

    const existing = await findTermLevelInvoice(student.id, levelId, transaction);
    if (existing) {
      await transaction.rollback();
      return res.status(409).json({
        success: false,
        message: duplicateInvoiceMessage(existing),
        existing_invoice_id: existing.id,
        existing_invoice_number: existing.invoice_number,
        existing_status: existing.status,
      });
    }

    const termFee = money(feeStructure.term_fee_amount);
    let parent = null;
    if (send_to_parent) {
      parent = await findParentForStudent(student.id);
    }

    const invoice = await FeeInvoice.create(
      {
        invoice_number: buildInvoiceNumber(),
        student_id: student.id,
        parent_id: parent?.id || null,
        curriculum_id: curriculumId,
        curriculum_class_id: classId,
        curriculum_class_level_id: levelId,
        fee_structure_id: feeStructure.id,
        term_fee_amount: termFee,
        amount_due: termFee,
        amount_paid: 0,
        balance: termFee,
        payment_breakdown: feeStructure.payment_breakdown,
        status: send_to_parent ? "sent" : "draft",
        notes: notes?.trim() || null,
        sent_at: send_to_parent ? new Date() : null,
      },
      { transaction }
    );

    await transaction.commit();

    const created = await FeeInvoice.findByPk(invoice.id, { include: invoiceIncludes });
    const credit = await getLevelCredit(created.student_id, created.curriculum_class_level_id);
    return res.status(201).json({ success: true, data: serializeInvoice(created, credit) });
  } catch (error) {
    await transaction.rollback();
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.cancelInvoice = async (req, res) => {
  try {
    const invoice = await FeeInvoice.findByPk(req.params.id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    }
    if (invoice.status === "cancelled") {
      return res.status(400).json({ success: false, message: "Invoice is already cancelled." });
    }
    if (invoice.status === "paid") {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel a fully paid invoice. The term/level has already been settled.",
      });
    }
    if (Number(invoice.amount_paid) > 0.01) {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel an invoice that already has payments recorded.",
      });
    }

    const reason = String(req.body?.reason || "").trim();
    const noteLine = reason ? `Cancelled: ${reason}` : "Cancelled by staff";
    const notes = invoice.notes ? `${invoice.notes}\n${noteLine}` : noteLine;

    await invoice.update({ status: "cancelled", notes });
    return res.json({ success: true, data: invoice });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.recordInvoicePayment = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const invoice = await FeeInvoice.findByPk(req.params.id, { transaction });
    if (!invoice) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: "Invoice not found" });
    }
    if (invoice.status === "cancelled") {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: "Cannot pay a cancelled invoice." });
    }
    if (invoice.status === "paid") {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: "Invoice is already fully paid." });
    }

    const result = await applyPayment({
      invoice,
      amount: req.body?.amount,
      paymentMethod: req.body?.payment_method || "manual",
      reference: req.body?.reference,
      notes: req.body?.notes,
      recordedByUserId: req.user.id,
      transaction,
    });

    await transaction.commit();
    return res.json({ success: true, data: result });
  } catch (error) {
    await transaction.rollback();
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.recordMyInvoicePayment = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const parent = await Parent.findOne({ where: { user_id: req.user.id }, transaction });
    if (!parent) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: "Parent profile not found" });
    }

    const invoice = await FeeInvoice.findByPk(req.params.id, { transaction });
    if (!invoice) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: "Invoice not found" });
    }

    const studentIds = Array.isArray(parent.student_ids) ? parent.student_ids.map(String) : [];
    if (!studentIds.includes(String(invoice.student_id))) {
      await transaction.rollback();
      return res.status(403).json({ success: false, message: "This invoice is not linked to your account." });
    }

    const result = await applyPayment({
      invoice,
      amount: req.body?.amount,
      paymentMethod: req.body?.payment_method || "portal",
      reference: req.body?.reference,
      notes: req.body?.notes,
      parentId: parent.id,
      transaction,
    });

    await transaction.commit();
    return res.json({ success: true, data: result });
  } catch (error) {
    await transaction.rollback();
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.listPayments = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const offset = (page - 1) * limit;

    const { count, rows } = await FeePayment.findAndCountAll({
      include: paymentIncludes,
      order: [["paid_at", "DESC"]],
      limit,
      offset,
      distinct: true,
=======
      offset,
>>>>>>> dbf38d6042c6ec91a0dd55101879df2f1e151a96
    });

    return res.json({
      success: true,
      data: rows,
      pagination: {
<<<<<<< HEAD
        total: count,
        page,
        limit,
=======
        page,
        limit,
        total: count,
>>>>>>> dbf38d6042c6ec91a0dd55101879df2f1e151a96
        totalPages: Math.max(1, Math.ceil(count / limit)),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

<<<<<<< HEAD
exports.getPayment = async (req, res) => {
  try {
    const row = await FeePayment.findByPk(req.params.id, { include: paymentIncludes });
    if (!row) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }
=======
exports.generateFeeInvoice = async (req, res) => {
  try {
    const { student_id, parent_id, fee_structure_id, curriculum_class_level_id, send_to_parent, notes } =
      req.body || {};
    if (!student_id) {
      return res.status(400).json({ success: false, message: "student_id is required." });
    }
    const invoice = await generateInvoiceForStudent({
      studentId: student_id,
      parentId: parent_id || null,
      feeStructureId: fee_structure_id || null,
      curriculumClassLevelId: curriculum_class_level_id || null,
      sendToParent: Boolean(send_to_parent),
      notes: notes || null,
    });
    const full = await FeeInvoice.findByPk(invoice.id, { include: invoiceIncludes });
    return res.status(201).json({ success: true, data: full });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.getFeeInvoice = async (req, res) => {
  try {
    const row = await FeeInvoice.findByPk(req.params.id, {
      include: [
        ...invoiceIncludes,
        { model: FeePayment, as: "payments", order: [["paid_at", "DESC"]] },
      ],
    });
    if (!row) return res.status(404).json({ success: false, message: "Invoice not found." });
>>>>>>> dbf38d6042c6ec91a0dd55101879df2f1e151a96
    return res.json({ success: true, data: row });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
<<<<<<< HEAD
=======

exports.postFeePayment = async (req, res) => {
  try {
    const amount = Number(req.body?.amount);
    const { reference, notes, payment_method } = req.body || {};
    const { payment, invoice, payment_receipt } = await recordPayment({
      invoiceId: req.params.id,
      amount,
      parentId: req.body?.parent_id || null,
      recordedBy: req.user?.id || null,
      paymentMethod: payment_method || "manual",
      reference: reference || null,
      notes: notes || null,
    });
    return res.status(201).json({ success: true, data: { payment, invoice, payment_receipt } });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.listMyParentInvoices = async (req, res) => {
  try {
    const parentRow = await Parent.findOne({ where: { user_id: req.user.id } });
    if (!parentRow) {
      return res.status(404).json({ success: false, message: "Parent profile not found." });
    }
    const studentIds = [...new Set((parentRow.student_ids || []).filter(Boolean))];
    if (!studentIds.length) return res.json({ success: true, data: [] });

    const rows = await FeeInvoice.findAll({
      where: {
        student_id: { [Op.in]: studentIds },
        status: { [Op.in]: ["sent", "partial", "paid"] },
      },
      include: invoiceIncludes,
      order: [["created_at", "DESC"]],
    });

    const data = rows.map((inv) => ({
      id: inv.id,
      ...formatInvoiceDocument(inv, inv.student, inv.parent?.user, inv.payments || []),
    }));
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyParentInvoice = async (req, res) => {
  try {
    const parentRow = await Parent.findOne({ where: { user_id: req.user.id } });
    if (!parentRow) {
      return res.status(404).json({ success: false, message: "Parent profile not found." });
    }
    const studentIds = (parentRow.student_ids || []).map(String);
    const row = await FeeInvoice.findByPk(req.params.id, {
      include: [...invoiceIncludes, { model: FeePayment, as: "payments" }],
    });
    if (!row || !studentIds.includes(String(row.student_id))) {
      return res.status(404).json({ success: false, message: "Invoice not found." });
    }
    if (row.status === "draft") {
      return res.status(403).json({ success: false, message: "This invoice is not available yet." });
    }
    const doc = formatInvoiceDocument(row, row.student, row.parent?.user, row.payments || []);
    return res.json({ success: true, data: { ...row.toJSON(), document: doc } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.postMyParentPayment = async (req, res) => {
  try {
    const parentRow = await Parent.findOne({ where: { user_id: req.user.id } });
    if (!parentRow) {
      return res.status(404).json({ success: false, message: "Parent profile not found." });
    }
    const studentIds = (parentRow.student_ids || []).map(String);
    const invoice = await FeeInvoice.findByPk(req.params.id);
    if (!invoice || !studentIds.includes(String(invoice.student_id))) {
      return res.status(404).json({ success: false, message: "Invoice not found." });
    }
    if (invoice.status === "draft") {
      return res.status(403).json({ success: false, message: "This invoice is not open for payment." });
    }
    const { payment, invoice: updated, payment_receipt } = await recordPayment({
      invoiceId: invoice.id,
      amount: Number(req.body?.amount),
      parentId: parentRow.id,
      recordedBy: req.user?.id || null,
      paymentMethod: "manual",
      reference: req.body?.reference || null,
      notes: req.body?.notes || null,
    });
    return res.status(201).json({ success: true, data: { payment, invoice: updated, payment_receipt } });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.getInvoiceTemplate = async (_req, res) => {
  return res.json({
    success: true,
    data: {
      title: "School fee invoice",
      currency: "KES",
      sections: [
        { key: "student", label: "Student" },
        { key: "level", label: "Curriculum level (Term)" },
        { key: "breakdown", label: "Fee breakdown (1st half / 2nd half)" },
        { key: "totals", label: "Amount due / paid / balance" },
        { key: "payments", label: "Payment history" },
      ],
    },
  });
};
>>>>>>> dbf38d6042c6ec91a0dd55101879df2f1e151a96
