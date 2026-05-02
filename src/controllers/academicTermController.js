const { AcademicTerm } = require("../models");

exports.listAcademicTerms = async (req, res) => {
  try {
    const where = {};
    if (req.query.academic_year_id) where.academic_year_id = req.query.academic_year_id;
    const rows = await AcademicTerm.findAll({
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

exports.getAcademicTerm = async (req, res) => {
  try {
    const row = await AcademicTerm.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, data: row });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createAcademicTerm = async (req, res) => {
  try {
    const row = await AcademicTerm.create(req.body);
    return res.status(201).json({ success: true, data: row });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateAcademicTerm = async (req, res) => {
  try {
    const row = await AcademicTerm.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Not found" });
    const allowed = ["academic_year_id", "term_name", "term_number", "start_date", "end_date", "is_active"];
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

exports.deleteAcademicTerm = async (req, res) => {
  try {
    const row = await AcademicTerm.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Not found" });
    await row.destroy();
    return res.json({ success: true, message: "Deleted" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
