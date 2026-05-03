const { Op } = require("sequelize");
const {
  TemporaryAnswer,
  ExamAttempt,
  ExamQuestion,
  Exam,
  Student,
  User,
} = require("../models");
const { STAFF_ROLES } = require("../constants/userRoles");

const TEACH_OR_STAFF_ROLES = [...STAFF_ROLES, "teacher"];

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

const includes = [
  {
    model: ExamAttempt,
    as: "exam_attempt",
    include: [
      { model: Exam, as: "exam", attributes: ["id", "title"] },
      { model: Student, as: "student", include: [{ model: User, as: "user", ...userSafe }] },
    ],
  },
  { model: ExamQuestion, as: "question", attributes: ["id", "order_number", "question_type", "marks"] },
];

exports.listTemporaryAnswers = async (req, res) => {
  try {
    const where = {};

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

    const rows = await TemporaryAnswer.findAll({
      where,
      include: includes,
      order: [["last_saved_at", "DESC"]],
    });
    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTemporaryAnswer = async (req, res) => {
  try {
    const row = await TemporaryAnswer.findByPk(req.params.id, { include: includes });
    if (!row) {
      return res.status(404).json({ success: false, message: "Temporary answer not found" });
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

exports.upsertTemporaryAnswer = async (req, res) => {
  try {
    const { exam_attempt_id, question_id, answer_data } = req.body;
    if (!exam_attempt_id || !question_id) {
      return res.status(400).json({
        success: false,
        message: "exam_attempt_id and question_id are required",
      });
    }

    const attempt = await ExamAttempt.findByPk(exam_attempt_id, {
      include: [{ model: Student, as: "student" }],
    });
    if (!attempt) {
      return res.status(404).json({ success: false, message: "Exam attempt not found" });
    }
    const isStaff = TEACH_OR_STAFF_ROLES.includes(req.user.role);
    if (!isStaff && attempt.student?.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const [row, created] = await TemporaryAnswer.findOrCreate({
      where: { exam_attempt_id, question_id },
      defaults: {
        answer_data,
        last_saved_at: new Date(),
        auto_save_count: 1,
      },
    });

    if (!created) {
      await row.update({
        answer_data,
        last_saved_at: new Date(),
        auto_save_count: row.auto_save_count + 1,
      });
    }

    const full = await TemporaryAnswer.findByPk(row.id, { include: includes });
    return res.status(created ? 201 : 200).json({ success: true, data: full });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.createTemporaryAnswer = async (req, res) => {
  try {
    const row = await TemporaryAnswer.create(req.body);
    const created = await TemporaryAnswer.findByPk(row.id, { include: includes });
    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateTemporaryAnswer = async (req, res) => {
  try {
    const row = await TemporaryAnswer.findByPk(req.params.id);
    if (!row) {
      return res.status(404).json({ success: false, message: "Temporary answer not found" });
    }
    const allowed = ["answer_data", "last_saved_at", "auto_save_count"];
    const patch = {};
    for (const k of allowed) {
      if (req.body[k] !== undefined) patch[k] = req.body[k];
    }
    await row.update(patch);
    const updated = await TemporaryAnswer.findByPk(row.id, { include: includes });
    return res.json({ success: true, data: updated });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteTemporaryAnswer = async (req, res) => {
  try {
    const row = await TemporaryAnswer.findByPk(req.params.id);
    if (!row) {
      return res.status(404).json({ success: false, message: "Temporary answer not found" });
    }
    await row.destroy();
    return res.json({ success: true, message: "Temporary answer deleted" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
