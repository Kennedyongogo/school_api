const { GradeFormula } = require("../models");

exports.listGradeFormulas = async (req, res) => {
  try {
    const where = {};
    if (req.query.grade_level_id) where.grade_level_id = req.query.grade_level_id;
    const rows = await GradeFormula.findAll({ where, order: [["name", "ASC"]] });
    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getGradeFormula = async (req, res) => {
  try {
    const row = await GradeFormula.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Grade formula not found" });
    return res.json({ success: true, data: row });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createGradeFormula = async (req, res) => {
  try {
    const row = await GradeFormula.create(req.body);
    return res.status(201).json({ success: true, data: row });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateGradeFormula = async (req, res) => {
  try {
    const row = await GradeFormula.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Grade formula not found" });
    const allowed = ["name", "grade_level_id", "grading_system_type", "formula_config", "calculation_method"];
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

exports.deleteGradeFormula = async (req, res) => {
  try {
    const row = await GradeFormula.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Grade formula not found" });
    await row.destroy();
    return res.json({ success: true, message: "Deleted" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
