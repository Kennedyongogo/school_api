const { AttendanceTracking } = require("../models");
const { Student } = require("../models");

async function studentProfileFromReq(req) {
  return Student.findOne({ where: { user_id: req.user.id } });
}

exports.listAttendanceTracking = async (req, res) => {
  try {
    const where = {};
    if (req.query.student_id) where.student_id = req.query.student_id;
    if (req.query.session_type) where.session_type = req.query.session_type;
    if (req.query.session_id) where.session_id = req.query.session_id;

    if (req.user.role === "student") {
      const profile = await studentProfileFromReq(req);
      if (!profile) return res.json({ success: true, data: [] });
      where.student_id = profile.id;
    }

    const rows = await AttendanceTracking.findAll({
      where,
      order: [["check_in_time", "DESC"]],
    });
    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAttendanceTracking = async (req, res) => {
  try {
    const row = await AttendanceTracking.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Not found" });

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

exports.createAttendanceTracking = async (req, res) => {
  try {
    if (req.user.role === "student") {
      const profile = await studentProfileFromReq(req);
      if (!profile || req.body.student_id !== profile.id) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }
    }
    const row = await AttendanceTracking.create(req.body);
    return res.status(201).json({ success: true, data: row });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateAttendanceTracking = async (req, res) => {
  try {
    const row = await AttendanceTracking.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Not found" });

    if (req.user.role === "student") {
      const profile = await studentProfileFromReq(req);
      if (!profile || row.student_id !== profile.id) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }
    }

    const allowed = [
      "class_assignment_id",
      "session_type",
      "session_id",
      "check_in_time",
      "check_out_time",
      "total_duration_seconds",
      "status",
      "lateness_minutes",
      "early_departure_minutes",
      "ip_address",
      "device_info",
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

exports.deleteAttendanceTracking = async (req, res) => {
  try {
    const row = await AttendanceTracking.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Not found" });
    await row.destroy();
    return res.json({ success: true, message: "Deleted" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
