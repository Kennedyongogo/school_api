const { Curriculum } = require("../models");

exports.listPublicActive = async (req, res) => {
  try {
    const rows = await Curriculum.findAll({
      where: { is_active: true },
      order: [
        ["display_order", "ASC"],
        ["name", "ASC"],
      ],
    });
    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.listCurricula = async (req, res) => {
  try {
    const where = {};
    if (req.query.is_active !== undefined) where.is_active = req.query.is_active === "true";
    if (req.query.type) where.type = req.query.type;

    const rows = await Curriculum.findAll({
      where,
      order: [
        ["display_order", "ASC"],
        ["name", "ASC"],
      ],
    });
    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCurriculum = async (req, res) => {
  try {
    const row = await Curriculum.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, data: row });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createCurriculum = async (req, res) => {
  try {
    const allowed = [
      "name",
      "code",
      "type",
      "description",
      "grade_levels",
      "subjects",
      "duration_years",
      "features",
      "image_url",
      "brochure_url",
      "is_active",
      "display_order",
    ];
    const payload = {};
    for (const k of allowed) {
      if (req.body[k] !== undefined) payload[k] = req.body[k];
    }
    const row = await Curriculum.create(payload);
    return res.status(201).json({ success: true, data: row });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateCurriculum = async (req, res) => {
  try {
    const row = await Curriculum.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Not found" });
    const allowed = [
      "name",
      "code",
      "type",
      "description",
      "grade_levels",
      "subjects",
      "duration_years",
      "features",
      "image_url",
      "brochure_url",
      "is_active",
      "display_order",
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

exports.deleteCurriculum = async (req, res) => {
  try {
    const row = await Curriculum.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Not found" });
    await row.destroy();
    return res.json({ success: true, message: "Deleted" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
