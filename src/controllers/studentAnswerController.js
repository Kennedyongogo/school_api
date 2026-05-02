const { Op } = require("sequelize");
const { StudentAnswer, ExamAttempt, ExamQuestion, Exam, Student, User } = require("../models");

const userSafe = { attributes: { exclude: ["password_hash"] } };

async function attemptIdsForStudent(req) {
  const profile = await Student.findOne({ where: { user_id: req.user.id } });
  if (!profile) return [];
  const attempts = await ExamAttempt.findAll({
    where: { student_id: profile.id },
    attributes: ["id"],
  });
  return attempts.map((a) => a.id);
}

const answerIncludes = [
  {
    model: ExamAttempt,
    as: "exam_attempt",
    include: [
      { model: Exam, as: "exam", attributes: ["id", "title", "total_marks", "passing_marks"] },
      { model: Student, as: "student", include: [{ model: User, as: "user", ...userSafe }] },
    ],
  },
  { model: ExamQuestion, as: "question" },
  { model: User, as: "grader", required: false, ...userSafe },
];

exports.listStudentAnswers = async (req, res) => {
  try {
    const where = {};
    if (req.query.question_id) where.question_id = req.query.question_id;

    if (req.user.role === "student") {
      const ids = await attemptIdsForStudent(req);
      if (ids.length === 0) {
        return res.json({ success: true, data: [] });
      }
      if (req.query.exam_attempt_id) {
        if (!ids.includes(req.query.exam_attempt_id)) {
          return res.json({ success: true, data: [] });
        }
        where.exam_attempt_id = req.query.exam_attempt_id;
      } else {
        where.exam_attempt_id = { [Op.in]: ids };
      }
    } else if (req.query.exam_attempt_id) {
      where.exam_attempt_id = req.query.exam_attempt_id;
    }

    const rows = await StudentAnswer.findAll({
      where,
      include: answerIncludes,
      order: [["created_at", "ASC"]],
    });
    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getStudentAnswer = async (req, res) => {
  try {
    const row = await StudentAnswer.findByPk(req.params.id, { include: answerIncludes });
    if (!row) {
      return res.status(404).json({ success: false, message: "Student answer not found" });
    }
    if (req.user.role === "student") {
      const ids = await attemptIdsForStudent(req);
      if (!ids.includes(row.exam_attempt_id)) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }
    }
    return res.json({ success: true, data: row });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createStudentAnswer = async (req, res) => {
  try {
    if (req.user.role === "student") {
      const ids = await attemptIdsForStudent(req);
      if (!req.body.exam_attempt_id || !ids.includes(req.body.exam_attempt_id)) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }
    }
    const row = await StudentAnswer.create(req.body);
    const created = await StudentAnswer.findByPk(row.id, { include: answerIncludes });
    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateStudentAnswer = async (req, res) => {
  try {
    const row = await StudentAnswer.findByPk(req.params.id);
    if (!row) {
      return res.status(404).json({ success: false, message: "Student answer not found" });
    }
    if (req.user.role === "student") {
      const ids = await attemptIdsForStudent(req);
      if (!ids.includes(row.exam_attempt_id)) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }
      const restricted = ["graded_by", "graded_at", "teacher_remarks", "auto_graded", "is_correct", "marks_obtained"];
      restricted.forEach((k) => delete req.body[k]);
    }
    const allowed = [
      "student_answer",
      "is_correct",
      "marks_obtained",
      "auto_graded",
      "graded_by",
      "graded_at",
      "teacher_remarks",
    ];
    const patch = {};
    for (const k of allowed) {
      if (req.body[k] !== undefined) patch[k] = req.body[k];
    }
    await row.update(patch);
    const updated = await StudentAnswer.findByPk(row.id, { include: answerIncludes });
    return res.json({ success: true, data: updated });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteStudentAnswer = async (req, res) => {
  try {
    const row = await StudentAnswer.findByPk(req.params.id);
    if (!row) {
      return res.status(404).json({ success: false, message: "Student answer not found" });
    }
    await row.destroy();
    return res.json({ success: true, message: "Student answer deleted" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
