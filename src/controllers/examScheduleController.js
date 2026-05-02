const { ExamSchedule, Exam, Section, GradeLevel, Teacher, User } = require("../models");

const userSafe = { attributes: { exclude: ["password_hash"] } };

const scheduleIncludes = [
  { model: Exam, as: "exam" },
  { model: Section, as: "section", include: [{ model: GradeLevel, as: "grade_level" }] },
  {
    model: Teacher,
    as: "Invigilator",
    required: false,
    include: [{ model: User, as: "user", ...userSafe }],
  },
];

exports.listExamSchedules = async (req, res) => {
  try {
    const where = {};
    if (req.query.exam_id) where.exam_id = req.query.exam_id;
    if (req.query.section_id) where.section_id = req.query.section_id;
    if (req.query.is_active !== undefined) where.is_active = req.query.is_active === "true";

    const rows = await ExamSchedule.findAll({
      where,
      include: scheduleIncludes,
      order: [["start_time", "ASC"]],
    });
    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getExamSchedule = async (req, res) => {
  try {
    const row = await ExamSchedule.findByPk(req.params.id, { include: scheduleIncludes });
    if (!row) {
      return res.status(404).json({ success: false, message: "Exam schedule not found" });
    }
    return res.json({ success: true, data: row });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createExamSchedule = async (req, res) => {
  try {
    const row = await ExamSchedule.create(req.body);
    const created = await ExamSchedule.findByPk(row.id, { include: scheduleIncludes });
    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateExamSchedule = async (req, res) => {
  try {
    const row = await ExamSchedule.findByPk(req.params.id);
    if (!row) {
      return res.status(404).json({ success: false, message: "Exam schedule not found" });
    }
    const allowed = [
      "exam_id",
      "section_id",
      "start_time",
      "end_time",
      "room_number",
      "invigilator_id",
      "is_active",
    ];
    const patch = {};
    for (const k of allowed) {
      if (req.body[k] !== undefined) patch[k] = req.body[k];
    }
    await row.update(patch);
    const updated = await ExamSchedule.findByPk(row.id, { include: scheduleIncludes });
    return res.json({ success: true, data: updated });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteExamSchedule = async (req, res) => {
  try {
    const row = await ExamSchedule.findByPk(req.params.id);
    if (!row) {
      return res.status(404).json({ success: false, message: "Exam schedule not found" });
    }
    await row.destroy();
    return res.json({ success: true, message: "Exam schedule deleted" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
