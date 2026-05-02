const { AssessmentExamType } = require("../models");

exports.listAssessmentExamTypes = async (req, res) => {
  try {
    const where = {};
    if (req.query.category) where.category = req.query.category;
    const rows = await AssessmentExamType.findAll({ where, order: [["name", "ASC"]] });
    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAssessmentExamType = async (req, res) => {
  try {
    const row = await AssessmentExamType.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Assessment type not found" });
    return res.json({ success: true, data: row });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createAssessmentExamType = async (req, res) => {
  try {
    const row = await AssessmentExamType.create(req.body);
    return res.status(201).json({ success: true, data: row });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateAssessmentExamType = async (req, res) => {
  try {
    const row = await AssessmentExamType.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Assessment type not found" });
    const allowed = ["name", "weight_percentage", "category"];
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

exports.deleteAssessmentExamType = async (req, res) => {
  try {
    const row = await AssessmentExamType.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Assessment type not found" });
    await row.destroy();
    return res.json({ success: true, message: "Deleted" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
