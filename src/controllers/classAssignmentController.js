const { ClassAssignment, Section, Subject, Teacher, User, GradeLevel } = require("../models");

const userSafe = { attributes: { exclude: ["password_hash"] } };

const includeFull = [
  {
    model: Section,
    as: "section",
    include: [{ model: GradeLevel, as: "grade_level" }],
  },
  { model: Subject, as: "subject" },
  {
    model: Teacher,
    as: "teacher",
    include: [{ model: User, as: "user", ...userSafe }],
  },
];

exports.listClassAssignments = async (req, res) => {
  try {
    const where = {};
    if (req.query.section_id) where.section_id = req.query.section_id;
    if (req.query.subject_id) where.subject_id = req.query.subject_id;
    if (req.query.teacher_id) where.teacher_id = req.query.teacher_id;
    if (req.query.academic_year) where.academic_year = req.query.academic_year;

    const rows = await ClassAssignment.findAll({
      where,
      include: includeFull,
      order: [["academic_year", "DESC"], ["created_at", "DESC"]],
    });
    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getClassAssignment = async (req, res) => {
  try {
    const row = await ClassAssignment.findByPk(req.params.id, {
      include: includeFull,
    });
    if (!row) {
      return res.status(404).json({ success: false, message: "Class assignment not found" });
    }
    return res.json({ success: true, data: row });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createClassAssignment = async (req, res) => {
  try {
    const row = await ClassAssignment.create(req.body);
    const created = await ClassAssignment.findByPk(row.id, { include: includeFull });
    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateClassAssignment = async (req, res) => {
  try {
    const row = await ClassAssignment.findByPk(req.params.id);
    if (!row) {
      return res.status(404).json({ success: false, message: "Class assignment not found" });
    }
    const allowed = ["section_id", "subject_id", "teacher_id", "academic_year", "schedule", "room_number"];
    const patch = {};
    for (const k of allowed) {
      if (req.body[k] !== undefined) patch[k] = req.body[k];
    }
    await row.update(patch);
    const updated = await ClassAssignment.findByPk(row.id, { include: includeFull });
    return res.json({ success: true, data: updated });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteClassAssignment = async (req, res) => {
  try {
    const row = await ClassAssignment.findByPk(req.params.id);
    if (!row) {
      return res.status(404).json({ success: false, message: "Class assignment not found" });
    }
    await row.destroy();
    return res.json({ success: true, message: "Class assignment deleted" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
