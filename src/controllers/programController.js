const { Program, Curriculum, GradeLevel, FeeStructure } = require("../models");

exports.listPrograms = async (req, res) => {
  try {
    const where = {};
    if (req.query.curriculum_id) where.curriculum_id = req.query.curriculum_id;
    if (req.query.grade_level_id) where.grade_level_id = req.query.grade_level_id;
    if (req.query.is_active !== undefined) where.is_active = req.query.is_active === "true";

    const include =
      req.query.embed === "1"
        ? [
            { model: Curriculum, as: "curriculum", attributes: ["id", "name", "code", "type"] },
            { model: GradeLevel, as: "grade_level", attributes: ["id", "name"] },
            { model: FeeStructure, as: "fee_structure", attributes: ["id", "name", "amount", "category"] },
          ]
        : [];

    const rows = await Program.findAll({
      where,
      include,
      order: [["name", "ASC"]],
    });
    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.listPublicByCurriculum = async (req, res) => {
  try {
    const { curriculum_id } = req.params;
    const rows = await Program.findAll({
      where: { curriculum_id, is_active: true },
      order: [["name", "ASC"]],
    });
    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProgram = async (req, res) => {
  try {
    const row = await Program.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, data: row });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createProgram = async (req, res) => {
  try {
    const allowed = [
      "curriculum_id",
      "name",
      "grade_level_id",
      "duration",
      "description",
      "requirements",
      "career_paths",
      "fee_structure_id",
      "is_active",
    ];
    const payload = {};
    for (const k of allowed) {
      if (req.body[k] !== undefined) payload[k] = req.body[k];
    }
    const row = await Program.create(payload);
    return res.status(201).json({ success: true, data: row });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateProgram = async (req, res) => {
  try {
    const row = await Program.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Not found" });
    const allowed = [
      "curriculum_id",
      "name",
      "grade_level_id",
      "duration",
      "description",
      "requirements",
      "career_paths",
      "fee_structure_id",
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

exports.deleteProgram = async (req, res) => {
  try {
    const row = await Program.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Not found" });
    await row.destroy();
    return res.json({ success: true, message: "Deleted" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
