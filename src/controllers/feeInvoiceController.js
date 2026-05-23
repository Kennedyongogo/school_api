const { Op } = require("sequelize");
const {
  FeeInvoice,
  FeePayment,
  Student,
  Parent,
  User,
  FeeStructure,
  Curriculum,
  CurriculumClass,
  CurriculumClassLevel,
} = require("../models");
const {
  generateInvoiceForStudent,
  recordPayment,
  formatInvoiceDocument,
  findParentForStudent,
} = require("../utils/feeBillingService");

const userSafe = { attributes: { exclude: ["password_hash"] } };

const invoiceIncludes = [
  {
    model: Student,
    as: "student",
    include: [{ model: User, as: "user", ...userSafe }],
  },
  {
    model: Parent,
    as: "parent",
    required: false,
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
      where,
      include: invoiceIncludes,
      order: [["created_at", "DESC"]],
      limit,
      offset,
    });

    return res.json({
      success: true,
      data: rows,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.max(1, Math.ceil(count / limit)),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

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
    return res.json({ success: true, data: row });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

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
