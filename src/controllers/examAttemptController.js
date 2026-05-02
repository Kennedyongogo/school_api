const { ExamAttempt, Exam, Student, User, ExamSchedule, Section, GradeLevel } = require("../models");

const userSafe = { attributes: { exclude: ["password_hash"] } };

async function studentProfileFromReq(req) {
  return Student.findOne({ where: { user_id: req.user.id } });
}

const attemptIncludes = [
  {
    model: Exam,
    as: "exam",
    attributes: ["id", "title", "duration_minutes", "total_marks", "passing_marks", "status", "requires_webcam"],
  },
  {
    model: Student,
    as: "student",
    include: [{ model: User, as: "user", ...userSafe }],
  },
  {
    model: ExamSchedule,
    as: "exam_schedule",
    required: false,
    include: [{ model: Section, as: "section", include: [{ model: GradeLevel, as: "grade_level" }] }],
  },
];

exports.listExamAttempts = async (req, res) => {
  try {
    const where = {};
    if (req.query.exam_id) where.exam_id = req.query.exam_id;
    if (req.query.exam_schedule_id) where.exam_schedule_id = req.query.exam_schedule_id;
    if (req.query.status) where.status = req.query.status;

    if (req.user.role === "student") {
      const profile = await studentProfileFromReq(req);
      if (!profile) {
        return res.json({ success: true, data: [] });
      }
      where.student_id = profile.id;
    } else if (req.query.student_id) {
      where.student_id = req.query.student_id;
    }

    const rows = await ExamAttempt.findAll({
      where,
      include: attemptIncludes,
      order: [["created_at", "DESC"]],
    });
    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getExamAttempt = async (req, res) => {
  try {
    const row = await ExamAttempt.findByPk(req.params.id, { include: attemptIncludes });
    if (!row) {
      return res.status(404).json({ success: false, message: "Exam attempt not found" });
    }
    if (req.user.role === "student") {
      const profile = await studentProfileFromReq(req);
      if (!profile || row.student_id !== profile.id) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }
    }
    return res.json({ success: true, data: row });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createExamAttempt = async (req, res) => {
  try {
    if (req.user.role === "student") {
      const profile = await studentProfileFromReq(req);
      if (!profile || req.body.student_id !== profile.id) {
        return res.status(403).json({ success: false, message: "Students may only create attempts for themselves" });
      }
    }
    const row = await ExamAttempt.create(req.body);
    const created = await ExamAttempt.findByPk(row.id, { include: attemptIncludes });
    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateExamAttempt = async (req, res) => {
  try {
    const row = await ExamAttempt.findByPk(req.params.id);
    if (!row) {
      return res.status(404).json({ success: false, message: "Exam attempt not found" });
    }
    if (req.user.role === "student") {
      const profile = await studentProfileFromReq(req);
      if (!profile || row.student_id !== profile.id) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }
      if (req.body.student_id && req.body.student_id !== profile.id) {
        return res.status(403).json({ success: false, message: "Cannot change student_id" });
      }
    }
    const allowed = [
      "exam_id",
      "student_id",
      "exam_schedule_id",
      "start_time",
      "end_time",
      "time_spent_seconds",
      "status",
      "total_score",
      "percentage",
      "is_passed",
      "ip_address",
      "device_info",
      "webcam_enabled",
      "tab_switch_count",
      "warning_count",
      "is_cancelled",
      "cancellation_reason",
      "submitted_at",
      "last_activity_at",
      "client_presence_active",
    ];
    const patch = {};
    for (const k of allowed) {
      if (req.body[k] !== undefined) patch[k] = req.body[k];
    }
    await row.update(patch);
    const updated = await ExamAttempt.findByPk(row.id, { include: attemptIncludes });
    return res.json({ success: true, data: updated });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteExamAttempt = async (req, res) => {
  try {
    const row = await ExamAttempt.findByPk(req.params.id);
    if (!row) {
      return res.status(404).json({ success: false, message: "Exam attempt not found" });
    }
    await row.destroy();
    return res.json({ success: true, message: "Exam attempt deleted" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
