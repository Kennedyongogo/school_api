const {
  ClassAttendance,
  ClassSession,
  Enrollment,
  Student,
  Subject,
  Teacher,
} = require("../models");
const { STAFF_ROLES } = require("../constants/userRoles");

async function teacherProfile(req) {
  return Teacher.findOne({ where: { user_id: req.user.id } });
}

async function assertTeacherOwnsSession(req, session) {
  const staff = STAFF_ROLES.includes(req.user.role);
  if (staff) return true;
  if (req.user.role !== "teacher") return false;
  const t = await teacherProfile(req);
  return !!(t && session.teacher_id === t.id);
}

exports.listClassAttendances = async (req, res) => {
  try {
    const where = {};
    if (req.query.class_session_id) where.class_session_id = req.query.class_session_id;
    if (req.query.student_id) where.student_id = req.query.student_id;

    if (req.user.role === "student") {
      const profile = await Student.findOne({ where: { user_id: req.user.id } });
      if (!profile) return res.json({ success: true, data: [] });
      where.student_id = profile.id;
    }

    const rows = await ClassAttendance.findAll({
      where,
      include: [
        {
          model: ClassSession,
          as: "class_session",
          include: [{ model: Subject, as: "subject", attributes: ["id", "name"] }],
        },
      ],
      order: [["created_at", "DESC"]],
      limit: Math.min(Number(req.query.limit) || 100, 500),
    });
    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.listMyClassAttendance = async (req, res) => {
  try {
    const profile = await Student.findOne({ where: { user_id: req.user.id } });
    if (!profile) return res.status(403).json({ success: false, message: "Forbidden" });

    const rows = await ClassAttendance.findAll({
      where: { student_id: profile.id },
      include: [
        {
          model: ClassSession,
          as: "class_session",
          include: [{ model: Subject, as: "subject", attributes: ["id", "name"] }],
        },
      ],
      order: [["created_at", "DESC"]],
      limit: Math.min(Number(req.query.limit) || 50, 200),
    });
    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getClassAttendance = async (req, res) => {
  try {
    const row = await ClassAttendance.findByPk(req.params.id, {
      include: [{ model: ClassSession, as: "class_session" }],
    });
    if (!row) return res.status(404).json({ success: false, message: "Not found" });

    if (req.user.role === "student") {
      const profile = await Student.findOne({ where: { user_id: req.user.id } });
      if (!profile || row.student_id !== profile.id) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }
    }

    return res.json({ success: true, data: row });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createClassAttendance = async (req, res) => {
  try {
    const session = await ClassSession.findByPk(req.body.class_session_id);
    if (!session) return res.status(400).json({ success: false, message: "Invalid class_session_id" });

    if (req.user.role === "student") {
      const profile = await Student.findOne({ where: { user_id: req.user.id } });
      if (!profile || req.body.student_id !== profile.id) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }
      const en = await Enrollment.findOne({
        where: { student_id: profile.id, section_id: session.section_id, is_active: true },
      });
      if (!en) return res.status(403).json({ success: false, message: "Forbidden" });
    } else {
      const ok = await assertTeacherOwnsSession(req, session);
      if (!ok) return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const row = await ClassAttendance.create(req.body);
    return res.status(201).json({ success: true, data: row });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateClassAttendance = async (req, res) => {
  try {
    const row = await ClassAttendance.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Not found" });

    const session = await ClassSession.findByPk(row.class_session_id);
    const ok = await assertTeacherOwnsSession(req, session);
    if (!ok) return res.status(403).json({ success: false, message: "Forbidden" });

    const allowed = [
      "check_in_time",
      "check_out_time",
      "status",
      "lateness_minutes",
      "participation_score",
      "teacher_remarks",
      "auto_marked",
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

exports.deleteClassAttendance = async (req, res) => {
  try {
    const row = await ClassAttendance.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Not found" });
    const session = await ClassSession.findByPk(row.class_session_id);
    const ok = await assertTeacherOwnsSession(req, session);
    if (!ok) return res.status(403).json({ success: false, message: "Forbidden" });
    await row.destroy();
    return res.json({ success: true, message: "Deleted" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
