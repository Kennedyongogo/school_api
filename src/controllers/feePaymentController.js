const { Op } = require("sequelize");
const {
  FeePayment,
  FeeInvoice,
  Student,
  Parent,
  User,
  CurriculumClassLevel,
} = require("../models");

const userSafe = { attributes: { exclude: ["password_hash"] } };

const paymentIncludes = [
  {
    model: FeeInvoice,
    as: "fee_invoice",
    attributes: [
      "id",
      "invoice_number",
      "amount_due",
      "amount_paid",
      "balance",
      "status",
      "curriculum_class_level_id",
    ],
    required: false,
  },
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
  {
    model: CurriculumClassLevel,
    as: "curriculum_class_level",
    attributes: ["id", "name"],
    required: false,
  },
  {
    model: User,
    as: "recorded_by_user",
    ...userSafe,
    required: false,
  },
];

exports.listFeePayments = async (req, res) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));
    const offset = (page - 1) * limit;
    const where = {};

    if (req.query.student_id) where.student_id = req.query.student_id;
    if (req.query.parent_id) where.parent_id = req.query.parent_id;
    if (req.query.fee_invoice_id) where.fee_invoice_id = req.query.fee_invoice_id;

    if (req.query.q) {
      const q = String(req.query.q).trim();
      if (q) {
        where[Op.or] = [
          { reference: { [Op.iLike]: `%${q}%` } },
          { notes: { [Op.iLike]: `%${q}%` } },
        ];
      }
    }

    const { count, rows } = await FeePayment.findAndCountAll({
      where,
      include: paymentIncludes,
      order: [["paid_at", "DESC"], ["created_at", "DESC"]],
      limit,
      offset,
      distinct: true,
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

exports.getFeePayment = async (req, res) => {
  try {
    const row = await FeePayment.findByPk(req.params.id, { include: paymentIncludes });
    if (!row) return res.status(404).json({ success: false, message: "Payment not found." });
    return res.json({ success: true, data: row });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
