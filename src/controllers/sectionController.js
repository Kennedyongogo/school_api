const { Section, GradeLevel, Teacher, User } = require("../models");

const userSafe = { attributes: { exclude: ["password_hash"] } };

exports.listSections = async (req, res) => {
  try {
    const where = {};
    if (req.query.grade_level_id) where.grade_level_id = req.query.grade_level_id;

    const rows = await Section.findAll({
      where,
      include: [
        { model: GradeLevel, as: "grade_level", required: true },
        {
          model: Teacher,
          as: "ClassTeacher",
          required: false,
          include: [{ model: User, as: "user", ...userSafe }],
        },
      ],
      order: [["grade_level_id", "ASC"], ["name", "ASC"]],
    });
    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSection = async (req, res) => {
  try {
    const row = await Section.findByPk(req.params.id, {
      include: [
        { model: GradeLevel, as: "grade_level" },
        {
          model: Teacher,
          as: "ClassTeacher",
          required: false,
          include: [{ model: User, as: "user", ...userSafe }],
        },
      ],
    });
    if (!row) {
      return res.status(404).json({ success: false, message: "Section not found" });
    }
    return res.json({ success: true, data: row });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createSection = async (req, res) => {
  try {
    const row = await Section.create(req.body);
    const created = await Section.findByPk(row.id, {
      include: [
        { model: GradeLevel, as: "grade_level" },
        {
          model: Teacher,
          as: "ClassTeacher",
          required: false,
          include: [{ model: User, as: "user", ...userSafe }],
        },
      ],
    });
    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateSection = async (req, res) => {
  try {
    const row = await Section.findByPk(req.params.id);
    if (!row) {
      return res.status(404).json({ success: false, message: "Section not found" });
    }
    const allowed = ["name", "grade_level_id", "class_teacher_id", "room_number", "capacity", "current_enrollment"];
    const patch = {};
    for (const k of allowed) {
      if (req.body[k] !== undefined) patch[k] = req.body[k];
    }
    await row.update(patch);
    const updated = await Section.findByPk(row.id, {
      include: [
        { model: GradeLevel, as: "grade_level" },
        {
          model: Teacher,
          as: "ClassTeacher",
          required: false,
          include: [{ model: User, as: "user", ...userSafe }],
        },
      ],
    });
    return res.json({ success: true, data: updated });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteSection = async (req, res) => {
  try {
    const row = await Section.findByPk(req.params.id);
    if (!row) {
      return res.status(404).json({ success: false, message: "Section not found" });
    }
    await row.destroy();
    return res.json({ success: true, message: "Section deleted" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
