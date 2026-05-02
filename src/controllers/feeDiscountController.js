const { FeeDiscount } = require("../models");

exports.listFeeDiscounts = async (req, res) => {
  try {
    const where = {};
    if (req.query.student_id) where.student_id = req.query.student_id;
    if (req.query.academic_year_id) where.academic_year_id = req.query.academic_year_id;
    if (req.query.term_id !== undefined) {
      where.term_id = req.query.term_id === "" ? null : req.query.term_id;
    }
    if (req.query.is_active !== undefined) where.is_active = req.query.is_active === "true";

    const rows = await FeeDiscount.findAll({ where, order: [["created_at", "DESC"]] });
    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFeeDiscount = async (req, res) => {
  try {
    const row = await FeeDiscount.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, data: row });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createFeeDiscount = async (req, res) => {
  try {
    const row = await FeeDiscount.create(req.body);
    return res.status(201).json({ success: true, data: row });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateFeeDiscount = async (req, res) => {
  try {
    const row = await FeeDiscount.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Not found" });
    const allowed = [
      "student_id",
      "academic_year_id",
      "term_id",
      "discount_type",
      "percentage",
      "fixed_amount",
      "reason",
      "approved_by",
      "approved_at",
      "is_active",
    ];
    const patch = {};
    for (const k of allowed) {
      if (req.body[k] !== undefined) patch[k] = req.body[k];
    }
    await row.update(patch);
    return res.json({ success: true, data: row });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteFeeDiscount = async (req, res) => {
  try {
    const row = await FeeDiscount.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Not found" });
    await row.destroy();
    return res.json({ success: true, message: "Deleted" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
