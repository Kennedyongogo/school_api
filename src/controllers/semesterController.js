const { Semester } = require("../models");

exports.listSemesters = async (req, res) => {
  try {
    const where = {};
    if (req.query.academic_year_id) where.academic_year_id = req.query.academic_year_id;
    const rows = await Semester.findAll({
      where,
      order: [
        ["academic_year_id", "ASC"],
        ["term_number", "ASC"],
      ],
    });
    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSemester = async (req, res) => {
  try {
    const row = await Semester.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Semester not found" });
    return res.json({ success: true, data: row });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createSemester = async (req, res) => {
  try {
    const row = await Semester.create(req.body);
    return res.status(201).json({ success: true, data: row });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateSemester = async (req, res) => {
  try {
    const row = await Semester.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Semester not found" });
    const allowed = [
      "academic_year_id",
      "name",
      "term_number",
      "start_date",
      "end_date",
      "weight_percentage",
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

exports.deleteSemester = async (req, res) => {
  try {
    const row = await Semester.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Semester not found" });
    await row.destroy();
    return res.json({ success: true, message: "Semester deleted" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
