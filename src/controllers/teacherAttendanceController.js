const { Op } = require("sequelize");
const { TeacherAttendance, Teacher, User } = require("../models");

async function teacherProfile(req) {
  return Teacher.findOne({ where: { user_id: req.user.id } });
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

exports.listTeacherAttendances = async (req, res) => {
  try {
    const where = {};
    if (req.query.teacher_id) where.teacher_id = req.query.teacher_id;
    if (req.query.date) where.date = req.query.date;
    if (req.query.start_date && req.query.end_date) {
      where.date = { [Op.between]: [req.query.start_date, req.query.end_date] };
    }

    if (req.user.role === "teacher") {
      const t = await teacherProfile(req);
      if (!t) return res.json({ success: true, data: [] });
      where.teacher_id = t.id;
    }

    const rows = await TeacherAttendance.findAll({
      where,
      include: [
        { model: Teacher, as: "teacher" },
        { model: User, as: "approver", attributes: { exclude: ["password_hash"] }, required: false },
      ],
      order: [["date", "DESC"]],
      limit: Math.min(Number(req.query.limit) || 200, 500),
    });
    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTeacherAttendance = async (req, res) => {
  try {
    const row = await TeacherAttendance.findByPk(req.params.id, {
      include: [{ model: Teacher, as: "teacher" }],
    });
    if (!row) return res.status(404).json({ success: false, message: "Not found" });

    if (req.user.role === "teacher") {
      const t = await teacherProfile(req);
      if (!t || row.teacher_id !== t.id) return res.status(403).json({ success: false, message: "Forbidden" });
    }

    return res.json({ success: true, data: row });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.checkIn = async (req, res) => {
  try {
    let teacherId = req.body.teacher_id;
    const date = req.body.date || todayStr();

    if (req.user.role === "teacher") {
      const t = await teacherProfile(req);
      if (!t) return res.status(403).json({ success: false, message: "Forbidden" });
      teacherId = t.id;
    }

    if (!teacherId) {
      return res.status(400).json({ success: false, message: "teacher_id is required for admin check-in" });
    }

    const [row, created] = await TeacherAttendance.findOrCreate({
      where: { teacher_id: teacherId, date },
      defaults: {
        teacher_id: teacherId,
        date,
        check_in_time: req.body.check_in_time || null,
        status: req.body.status || "present",
        lateness_minutes: req.body.lateness_minutes ?? 0,
        remarks: req.body.remarks,
      },
    });

    if (!created) {
      await row.update({
        check_in_time: req.body.check_in_time ?? row.check_in_time,
        status: req.body.status ?? row.status,
        lateness_minutes: req.body.lateness_minutes ?? row.lateness_minutes,
        remarks: req.body.remarks ?? row.remarks,
      });
    }

    const updated = await TeacherAttendance.findByPk(row.id, {
      include: [{ model: Teacher, as: "teacher" }],
    });
    return res.json({ success: true, data: updated });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.checkOut = async (req, res) => {
  try {
    let teacherId = req.body.teacher_id;
    const date = req.body.date || todayStr();

    if (req.user.role === "teacher") {
      const t = await teacherProfile(req);
      if (!t) return res.status(403).json({ success: false, message: "Forbidden" });
      teacherId = t.id;
    }

    if (!teacherId) {
      return res.status(400).json({ success: false, message: "teacher_id is required for admin check-out" });
    }

    let row = await TeacherAttendance.findOne({ where: { teacher_id: teacherId, date } });
    if (!row) {
      row = await TeacherAttendance.create({
        teacher_id: teacherId,
        date,
        status: "present",
        check_out_time: req.body.check_out_time,
      });
    } else {
      await row.update({
        check_out_time: req.body.check_out_time ?? row.check_out_time,
        early_departure_minutes: req.body.early_departure_minutes ?? row.early_departure_minutes,
        remarks: req.body.remarks ?? row.remarks,
      });
    }

    return res.json({ success: true, data: row });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.createTeacherAttendance = async (req, res) => {
  try {
    const row = await TeacherAttendance.create(req.body);
    return res.status(201).json({ success: true, data: row });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateTeacherAttendance = async (req, res) => {
  try {
    const row = await TeacherAttendance.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Not found" });

    if (req.user.role === "teacher") {
      const t = await teacherProfile(req);
      if (!t || row.teacher_id !== t.id) return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const allowed = [
      "check_in_time",
      "check_out_time",
      "status",
      "lateness_minutes",
      "early_departure_minutes",
      "leave_type",
      "leave_reason",
      "approved_by",
      "remarks",
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

exports.deleteTeacherAttendance = async (req, res) => {
  try {
    const row = await TeacherAttendance.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Not found" });
    await row.destroy();
    return res.json({ success: true, message: "Deleted" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
