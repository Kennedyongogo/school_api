const { GradingScale } = require("../models");

exports.listGradingScales = async (req, res) => {
  try {
    const where = {};
    if (req.query.system_type) where.system_type = req.query.system_type;
    if (req.query.is_active !== undefined) where.is_active = req.query.is_active === "true";
    const rows = await GradingScale.findAll({
      where,
      order: [
        ["system_type", "ASC"],
        ["min_percentage", "DESC"],
      ],
    });
    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getGradingScale = async (req, res) => {
  try {
    const row = await GradingScale.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Grading scale row not found" });
    return res.json({ success: true, data: row });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createGradingScale = async (req, res) => {
  try {
    const row = await GradingScale.create(req.body);
    return res.status(201).json({ success: true, data: row });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateGradingScale = async (req, res) => {
  try {
    const row = await GradingScale.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Grading scale row not found" });
    const allowed = [
      "name",
      "system_type",
      "grade_letter",
      "min_percentage",
      "max_percentage",
      "gpa_value",
      "ib_score",
      "description",
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

exports.deleteGradingScale = async (req, res) => {
  try {
    const row = await GradingScale.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Grading scale row not found" });
    await row.destroy();
    return res.json({ success: true, message: "Deleted" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
