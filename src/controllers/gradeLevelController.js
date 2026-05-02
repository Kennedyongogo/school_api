const { GradeLevel } = require("../models");

exports.listGradeLevels = async (req, res) => {
  try {
    const rows = await GradeLevel.findAll({
      order: [["order_sequence", "ASC"]],
    });
    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getGradeLevel = async (req, res) => {
  try {
    const row = await GradeLevel.findByPk(req.params.id);
    if (!row) {
      return res.status(404).json({ success: false, message: "Grade level not found" });
    }
    return res.json({ success: true, data: row });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createGradeLevel = async (req, res) => {
  try {
    const row = await GradeLevel.create(req.body);
    return res.status(201).json({ success: true, data: row });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateGradeLevel = async (req, res) => {
  try {
    const row = await GradeLevel.findByPk(req.params.id);
    if (!row) {
      return res.status(404).json({ success: false, message: "Grade level not found" });
    }
    const allowed = ["name", "level_number", "description", "minimum_age", "maximum_age", "order_sequence"];
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

exports.deleteGradeLevel = async (req, res) => {
  try {
    const row = await GradeLevel.findByPk(req.params.id);
    if (!row) {
      return res.status(404).json({ success: false, message: "Grade level not found" });
    }
    await row.destroy();
    return res.json({ success: true, message: "Grade level deleted" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
