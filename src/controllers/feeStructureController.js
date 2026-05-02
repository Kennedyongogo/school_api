const { FeeStructure } = require("../models");

exports.listFeeStructures = async (req, res) => {
  try {
    const where = {};
    if (req.query.academic_year_id) where.academic_year_id = req.query.academic_year_id;
    if (req.query.grade_level_id !== undefined) where.grade_level_id = req.query.grade_level_id || null;
    if (req.query.category) where.category = req.query.category;
    if (req.query.is_active !== undefined) where.is_active = req.query.is_active === "true";

    const rows = await FeeStructure.findAll({ where, order: [["category", "ASC"], ["name", "ASC"]] });
    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFeeStructure = async (req, res) => {
  try {
    const row = await FeeStructure.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, data: row });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createFeeStructure = async (req, res) => {
  try {
    const row = await FeeStructure.create(req.body);
    return res.status(201).json({ success: true, data: row });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateFeeStructure = async (req, res) => {
  try {
    const row = await FeeStructure.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Not found" });
    const allowed = [
      "name",
      "description",
      "category",
      "amount",
      "is_per_term",
      "is_mandatory",
      "grade_level_id",
      "academic_year_id",
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

exports.deleteFeeStructure = async (req, res) => {
  try {
    const row = await FeeStructure.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Not found" });
    await row.destroy();
    return res.json({ success: true, message: "Deleted" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
