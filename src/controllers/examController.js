const {
  Exam,
  Subject,
  ClassAssignment,
  Section,
  GradeLevel,
  Teacher,
  User,
  Department,
} = require("../models");

const userSafe = { attributes: { exclude: ["password_hash"] } };

const examIncludes = [
  { model: Subject, as: "subject", include: [{ model: Department, as: "department" }] },
  {
    model: ClassAssignment,
    as: "class_assignment",
    include: [
      { model: Section, as: "section", include: [{ model: GradeLevel, as: "grade_level" }] },
      { model: Subject, as: "subject" },
      { model: Teacher, as: "teacher", include: [{ model: User, as: "user", ...userSafe }] },
    ],
  },
  { model: User, as: "creator", required: false, ...userSafe },
];

exports.listExams = async (req, res) => {
  try {
    const where = {};
    if (req.query.status) where.status = req.query.status;
    if (req.query.subject_id) where.subject_id = req.query.subject_id;

    const rows = await Exam.findAll({
      where,
      include: examIncludes,
      order: [["created_at", "DESC"]],
    });
    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getExam = async (req, res) => {
  try {
    const row = await Exam.findByPk(req.params.id, { include: examIncludes });
    if (!row) {
      return res.status(404).json({ success: false, message: "Exam not found" });
    }
    return res.json({ success: true, data: row });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createExam = async (req, res) => {
  try {
    const body = { ...req.body };
    if (!body.created_by && req.user?.id) body.created_by = req.user.id;
    const row = await Exam.create(body);
    const created = await Exam.findByPk(row.id, { include: examIncludes });
    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateExam = async (req, res) => {
  try {
    const row = await Exam.findByPk(req.params.id);
    if (!row) {
      return res.status(404).json({ success: false, message: "Exam not found" });
    }
    const allowed = [
      "title",
      "description",
      "subject_id",
      "class_assignment_id",
      "total_marks",
      "passing_marks",
      "duration_minutes",
      "question_type",
      "requires_webcam",
      "prevent_tab_switch",
      "allow_retake",
      "max_attempts",
      "instructions",
      "status",
      "created_by",
    ];
    const patch = {};
    for (const k of allowed) {
      if (req.body[k] !== undefined) patch[k] = req.body[k];
    }
    await row.update(patch);
    const updated = await Exam.findByPk(row.id, { include: examIncludes });
    return res.json({ success: true, data: updated });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteExam = async (req, res) => {
  try {
    const row = await Exam.findByPk(req.params.id);
    if (!row) {
      return res.status(404).json({ success: false, message: "Exam not found" });
    }
    await row.destroy();
    return res.json({ success: true, message: "Exam deleted" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
