const { Op } = require("sequelize");
const {
  ClassSession,
  ClassAttendance,
  Enrollment,
  Student,
  Teacher,
  Subject,
  Section,
  User,
} = require("../models");
const { STAFF_ROLES } = require("../constants/userRoles");

const sessionIncludes = [
  { model: Subject, as: "subject", attributes: ["id", "name", "code"] },
  { model: Section, as: "section", attributes: ["id", "name"] },
];

async function teacherProfile(req) {
  return Teacher.findOne({ where: { user_id: req.user.id } });
}

async function assertSessionStaffOrTeacher(req, session) {
  const staff = STAFF_ROLES.includes(req.user.role);
  if (staff) return true;
  if (req.user.role !== "teacher") return false;
  const t = await teacherProfile(req);
  return !!(t && session.teacher_id === t.id);
}

exports.listClassSessions = async (req, res) => {
  try {
    const where = {};
    if (req.query.class_assignment_id) where.class_assignment_id = req.query.class_assignment_id;
    if (req.query.teacher_id) where.teacher_id = req.query.teacher_id;
    if (req.query.section_id) where.section_id = req.query.section_id;
    if (req.query.subject_id) where.subject_id = req.query.subject_id;
    if (req.query.status) where.status = req.query.status;
    if (req.query.session_date) where.session_date = req.query.session_date;

    if (req.user.role === "teacher") {
      const t = await teacherProfile(req);
      if (!t) return res.json({ success: true, data: [] });
      where.teacher_id = t.id;
    }

    if (req.user.role === "student") {
      const profile = await Student.findOne({ where: { user_id: req.user.id } });
      if (!profile) return res.json({ success: true, data: [] });
      const enrollments = await Enrollment.findAll({
        where: { student_id: profile.id, is_active: true },
        attributes: ["section_id"],
      });
      const sectionIds = [...new Set(enrollments.map((e) => e.section_id))];
      if (!sectionIds.length) return res.json({ success: true, data: [] });
      where.section_id = { [Op.in]: sectionIds };
    }

    const rows = await ClassSession.findAll({
      where,
      include: sessionIncludes,
      order: [
        ["session_date", "ASC"],
        ["start_time", "ASC"],
      ],
    });
    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.listUpcoming = async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const where = {
      session_date: { [Op.gte]: req.query.from_date || today },
      status: { [Op.in]: ["scheduled", "in_progress"] },
    };

    if (req.query.teacher_id) where.teacher_id = req.query.teacher_id;

    if (req.user.role === "teacher") {
      const t = await teacherProfile(req);
      if (!t) return res.json({ success: true, data: [] });
      where.teacher_id = t.id;
    }

    if (req.user.role === "student") {
      const profile = await Student.findOne({ where: { user_id: req.user.id } });
      if (!profile) return res.json({ success: true, data: [] });
      const enrollments = await Enrollment.findAll({
        where: { student_id: profile.id, is_active: true },
        attributes: ["section_id"],
      });
      const sectionIds = [...new Set(enrollments.map((e) => e.section_id))];
      if (!sectionIds.length) return res.json({ success: true, data: [] });
      where.section_id = { [Op.in]: sectionIds };
    }

    const rows = await ClassSession.findAll({
      where,
      include: sessionIncludes,
      order: [
        ["session_date", "ASC"],
        ["start_time", "ASC"],
      ],
      limit: Math.min(Number(req.query.limit) || 50, 200),
    });
    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getClassSession = async (req, res) => {
  try {
    const row = await ClassSession.findByPk(req.params.id, { include: sessionIncludes });
    if (!row) return res.status(404).json({ success: false, message: "Class session not found" });

    if (req.user.role === "student") {
      const profile = await Student.findOne({ where: { user_id: req.user.id } });
      const en = profile
        ? await Enrollment.findOne({
            where: { student_id: profile.id, section_id: row.section_id, is_active: true },
          })
        : null;
      if (!en) return res.status(403).json({ success: false, message: "Forbidden" });
    }

    return res.json({ success: true, data: row });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createClassSession = async (req, res) => {
  try {
    if (req.user.role === "teacher") {
      const t = await teacherProfile(req);
      if (!t || req.body.teacher_id !== t.id) {
        return res.status(403).json({ success: false, message: "Teachers may only create sessions for themselves" });
      }
    }
    const row = await ClassSession.create(req.body);
    const created = await ClassSession.findByPk(row.id, { include: sessionIncludes });
    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateClassSession = async (req, res) => {
  try {
    const row = await ClassSession.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Class session not found" });

    const ok = await assertSessionStaffOrTeacher(req, row);
    if (!ok) return res.status(403).json({ success: false, message: "Forbidden" });

    const allowed = [
      "class_assignment_id",
      "teacher_id",
      "section_id",
      "subject_id",
      "syllabus_chapter_id",
      "session_date",
      "start_time",
      "end_time",
      "actual_start_time",
      "actual_end_time",
      "topics_covered",
      "teaching_methods",
      "materials_used",
      "homework_given",
      "next_session_preview",
      "teacher_notes",
      "status",
      "cancellation_reason",
      "is_recorded",
      "recording_url",
      "online_session_link",
    ];
    const patch = {};
    for (const k of allowed) {
      if (req.body[k] !== undefined) patch[k] = req.body[k];
    }
    await row.update(patch);
    const updated = await ClassSession.findByPk(row.id, { include: sessionIncludes });
    return res.json({ success: true, data: updated });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.endClassSession = async (req, res) => {
  try {
    const row = await ClassSession.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Class session not found" });

    const ok = await assertSessionStaffOrTeacher(req, row);
    if (!ok) return res.status(403).json({ success: false, message: "Forbidden" });

    const actualEnd = req.body.actual_end_time ? new Date(req.body.actual_end_time) : new Date();
    await row.update({
      status: "completed",
      actual_end_time: actualEnd,
    });

    const updated = await ClassSession.findByPk(row.id, { include: sessionIncludes });
    return res.json({ success: true, data: updated });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.getSessionAttendance = async (req, res) => {
  try {
    const session = await ClassSession.findByPk(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: "Class session not found" });

    const ok = await assertSessionStaffOrTeacher(req, session);
    if (!ok) return res.status(403).json({ success: false, message: "Forbidden" });

    const rows = await ClassAttendance.findAll({
      where: { class_session_id: session.id },
      include: [
        {
          model: Student,
          as: "student",
          include: [{ model: User, as: "user", attributes: { exclude: ["password_hash"] } }],
        },
      ],
      order: [["created_at", "ASC"]],
    });

    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteClassSession = async (req, res) => {
  try {
    const row = await ClassSession.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Class session not found" });
    const ok = await assertSessionStaffOrTeacher(req, row);
    if (!ok) return res.status(403).json({ success: false, message: "Forbidden" });
    await row.destroy();
    return res.json({ success: true, message: "Deleted" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
