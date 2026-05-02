const { OnlineSessionTracking, ClassSession, Enrollment, Student, Teacher } = require("../models");

async function teacherProfile(req) {
  return Teacher.findOne({ where: { user_id: req.user.id } });
}

async function assertSessionReader(req, session) {
  const staff = ["admin", "accountant", "librarian"].includes(req.user.role);
  if (staff) return true;
  if (req.user.role === "teacher") {
    const t = await teacherProfile(req);
    return !!(t && session.teacher_id === t.id);
  }
  return false;
}

exports.listOnlineSessionTracking = async (req, res) => {
  try {
    const staffRoles = ["admin", "accountant", "librarian"];
    const where = {};

    if (req.user.role === "student") {
      const profile = await Student.findOne({ where: { user_id: req.user.id } });
      if (!profile) return res.json({ success: true, data: [] });
      where.student_id = profile.id;
      if (req.query.class_session_id) where.class_session_id = req.query.class_session_id;
    } else if (staffRoles.includes(req.user.role)) {
      if (req.query.class_session_id) where.class_session_id = req.query.class_session_id;
      if (req.query.student_id) where.student_id = req.query.student_id;
    } else if (req.user.role === "teacher") {
      if (!req.query.class_session_id) {
        return res.status(400).json({ success: false, message: "class_session_id is required" });
      }
      const session = await ClassSession.findByPk(req.query.class_session_id);
      if (!session) return res.status(404).json({ success: false, message: "Class session not found" });
      const ok = await assertSessionReader(req, session);
      if (!ok) return res.status(403).json({ success: false, message: "Forbidden" });
      where.class_session_id = req.query.class_session_id;
    } else {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const rows = await OnlineSessionTracking.findAll({
      where,
      order: [["joined_at", "DESC"]],
      limit: Math.min(Number(req.query.limit) || 100, 300),
    });
    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getOnlineSessionTracking = async (req, res) => {
  try {
    const row = await OnlineSessionTracking.findByPk(req.params.id, {
      include: [{ model: ClassSession, as: "class_session" }],
    });
    if (!row) return res.status(404).json({ success: false, message: "Not found" });

    const session = await ClassSession.findByPk(row.class_session_id);
    if (req.user.role === "student") {
      const profile = await Student.findOne({ where: { user_id: req.user.id } });
      if (!profile || row.student_id !== profile.id) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }
    } else {
      const ok = await assertSessionReader(req, session);
      if (!ok) return res.status(403).json({ success: false, message: "Forbidden" });
    }

    return res.json({ success: true, data: row });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createOnlineSessionTracking = async (req, res) => {
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
      const ok = await assertSessionReader(req, session);
      if (!ok) return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const row = await OnlineSessionTracking.create(req.body);
    return res.status(201).json({ success: true, data: row });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateOnlineSessionTracking = async (req, res) => {
  try {
    const row = await OnlineSessionTracking.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Not found" });

    const session = await ClassSession.findByPk(row.class_session_id);

    if (req.user.role === "student") {
      const profile = await Student.findOne({ where: { user_id: req.user.id } });
      if (!profile || row.student_id !== profile.id) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }
    } else {
      const ok = await assertSessionReader(req, session);
      if (!ok) return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const allowed = [
      "joined_at",
      "left_at",
      "total_duration_seconds",
      "connection_quality",
      "interruptions_count",
      "last_active_at",
      "is_connected",
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

exports.deleteOnlineSessionTracking = async (req, res) => {
  try {
    const row = await OnlineSessionTracking.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Not found" });
    const session = await ClassSession.findByPk(row.class_session_id);
    const ok = await assertSessionReader(req, session);
    if (!ok) return res.status(403).json({ success: false, message: "Forbidden" });
    await row.destroy();
    return res.json({ success: true, message: "Deleted" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
