const { AcademicYear } = require("../models");

exports.listAcademicYears = async (req, res) => {
  try {
    const rows = await AcademicYear.findAll({ order: [["start_date", "DESC"]] });
    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAcademicYear = async (req, res) => {
  try {
    const row = await AcademicYear.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Academic year not found" });
    return res.json({ success: true, data: row });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createAcademicYear = async (req, res) => {
  try {
    const row = await AcademicYear.create(req.body);
    return res.status(201).json({ success: true, data: row });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateAcademicYear = async (req, res) => {
  try {
    const row = await AcademicYear.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Academic year not found" });
    const allowed = ["name", "start_date", "end_date", "is_current", "status"];
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

exports.deleteAcademicYear = async (req, res) => {
  try {
    const row = await AcademicYear.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Academic year not found" });
    await row.destroy();
    return res.json({ success: true, message: "Academic year deleted" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
