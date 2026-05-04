const { Op } = require("sequelize");
const {
  LiveClass,
  Student,
  LiveClassAttendance,
  CurriculumClassTimetableLesson,
  CurriculumClassTimetable,
} = require("../models");

/** Match student join URL to stored row (strip #fragments and trailing slashes). */
function normalizeJoinUrlForMatch(raw) {
  const s = String(raw || "").trim();
  if (!s) return "";
  const noHash = s.split("#")[0].trim();
  return noHash.replace(/\/+$/, "");
}

async function findLiveClassForJoin(joinUrlRaw) {
  const key = normalizeJoinUrlForMatch(joinUrlRaw);
  if (!key) return null;

  const candidates = await LiveClass.findAll({
    where: {
      join_url: { [Op.ne]: null },
      curriculum_class_timetable_lesson_id: { [Op.ne]: null },
    },
    order: [["created_at", "DESC"]],
    limit: 150,
    include: [
      {
        model: CurriculumClassTimetableLesson,
        as: "timetable_lesson",
        required: true,
        attributes: ["id"],
        include: [
          {
            model: CurriculumClassTimetable,
            as: "timetable",
            required: true,
            attributes: ["id", "curriculum_class_id"],
          },
        ],
      },
    ],
  });

  for (const row of candidates) {
    const stored = normalizeJoinUrlForMatch(row.join_url || "");
    if (stored === key) return row;
  }
  return null;
}

/** Student-only: records join for roster when opening the meeting link from the portal. */
exports.recordLiveSessionJoin = async (req, res) => {
  try {
    const join_url = req.body?.join_url != null ? String(req.body.join_url).trim() : "";
    if (!join_url) {
      return res.status(400).json({ success: false, message: "join_url is required" });
    }

    const student = await Student.findOne({
      where: { user_id: req.user.id },
      attributes: ["id", "user_id", "curriculum_class_id"],
    });
    if (!student) {
      return res.status(404).json({ success: false, message: "Student profile not found" });
    }
    if (!student.curriculum_class_id) {
      return res.status(403).json({
        success: false,
        message: "Your profile has no class placement; attendance cannot be recorded.",
      });
    }

    const live = await findLiveClassForJoin(join_url);
    if (!live) {
      return res.status(404).json({
        success: false,
        message: "No active live lesson matches this link.",
      });
    }

    const classId = live.timetable_lesson?.timetable?.curriculum_class_id;
    if (!classId || String(student.curriculum_class_id) !== String(classId)) {
      return res.status(403).json({
        success: false,
        message: "This online class is not for your registered class.",
      });
    }

    const now = new Date();
    const [row, created] = await LiveClassAttendance.findOrCreate({
      where: { live_class_id: live.id, student_id: student.id },
      defaults: {
        join_time: now,
        leave_time: null,
        duration_minutes: null,
        left_early: false,
      },
    });

    if (!created) {
      await row.update({
        join_time: now,
        leave_time: null,
        duration_minutes: null,
        left_early: false,
      });
      await row.reload();
    } else {
      await LiveClass.increment("attendance_count", { where: { id: live.id } });
      await row.reload();
    }

    return res.json({
      success: true,
      data: {
        live_class_id: live.id,
        attendance_id: row.id,
        join_time: row.join_time,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/** Optional: student marks leaving (tab close unreliable — explicit button later). */
exports.recordLiveSessionLeave = async (req, res) => {
  try {
    const join_url = req.body?.join_url != null ? String(req.body.join_url).trim() : "";
    if (!join_url) {
      return res.status(400).json({ success: false, message: "join_url is required" });
    }

    const student = await Student.findOne({
      where: { user_id: req.user.id },
      attributes: ["id", "curriculum_class_id"],
    });
    if (!student) {
      return res.status(404).json({ success: false, message: "Student profile not found" });
    }

    const live = await findLiveClassForJoin(join_url);
    if (!live) {
      return res.status(404).json({ success: false, message: "No live lesson matches this link." });
    }

    const classIdLeave = live.timetable_lesson?.timetable?.curriculum_class_id;
    if (
      !student.curriculum_class_id ||
      !classIdLeave ||
      String(student.curriculum_class_id) !== String(classIdLeave)
    ) {
      return res.status(403).json({ success: false, message: "This session is not for your class." });
    }

    const row = await LiveClassAttendance.findOne({
      where: { live_class_id: live.id, student_id: student.id },
    });
    if (!row) {
      return res.status(404).json({ success: false, message: "No join record found." });
    }

    const leave = new Date();
    const joinTime = row.join_time ? new Date(row.join_time) : leave;
    const durationMinutes = Math.max(0, Math.round((leave.getTime() - joinTime.getTime()) / 60000));

    await row.update({
      leave_time: leave,
      duration_minutes: durationMinutes,
      left_early: false,
    });

    return res.json({ success: true, data: row });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
