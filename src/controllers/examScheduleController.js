const {
  ExamSchedule,
  Exam,
  Teacher,
  User,
  Curriculum,
  CurriculumClass,
  CurriculumClassLevel,
  ExamAttempt,
  ExamSubmission,
  Student,
  InAppNotification,
} = require("../models");
const { Op } = require("sequelize");
const crypto = require("crypto");

const userSafe = { attributes: { exclude: ["password_hash"] } };

const scheduleIncludes = [
  { model: Exam, as: "exam" },
  { model: Curriculum, as: "curriculum", required: false, attributes: ["id", "name", "type"] },
  {
    model: CurriculumClass,
    as: "curriculum_class",
    required: false,
    attributes: ["id", "name", "code", "curriculum_id"],
  },
  {
    model: CurriculumClassLevel,
    as: "curriculum_class_level",
    required: false,
    attributes: ["id", "name", "level_order"],
  },
  {
    model: Teacher,
    as: "teacher",
    required: false,
    include: [{ model: User, as: "user", ...userSafe }],
  },
];

const addDaysIso = (isoDate, days) => {
  const d = new Date(`${isoDate}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

function normalizePlatform(raw) {
  const s = String(raw || "").trim().toLowerCase();
  if (!s) return "jitsi";
  if (s === "jitsi") return "jitsi";
  return "other";
}

function jitsiRoomName(scheduleId) {
  return `schoolexam-${String(scheduleId || "").replace(/[^a-zA-Z0-9]/g, "").slice(0, 14)}-${crypto
    .randomUUID()
    .slice(0, 8)}`;
}

function resolveExamMeetingUrls(body, row) {
  const b = body && typeof body === "object" ? body : {};
  const joinFromBody = b.meeting_join_url != null ? String(b.meeting_join_url).trim() : "";
  const hostFromBody = b.meeting_host_url != null ? String(b.meeting_host_url).trim() : "";
  const platformFromBody = normalizePlatform(b.meeting_provider);
  if (joinFromBody) {
    return {
      meeting_provider: platformFromBody,
      meeting_join_url: joinFromBody,
      meeting_host_url: hostFromBody || joinFromBody,
      generated: false,
    };
  }
  if (row?.meeting_join_url && String(row.meeting_join_url).trim() !== "") {
    return {
      meeting_provider: normalizePlatform(row.meeting_provider),
      meeting_join_url: String(row.meeting_join_url).trim(),
      meeting_host_url:
        row.meeting_host_url && String(row.meeting_host_url).trim() !== ""
          ? String(row.meeting_host_url).trim()
          : String(row.meeting_join_url).trim(),
      generated: false,
    };
  }

  const defaultJoin = process.env.ONLINE_MEETING_DEFAULT_JOIN_URL ? String(process.env.ONLINE_MEETING_DEFAULT_JOIN_URL).trim() : "";
  const defaultHost = process.env.ONLINE_MEETING_DEFAULT_HOST_URL ? String(process.env.ONLINE_MEETING_DEFAULT_HOST_URL).trim() : "";
  if (defaultJoin) {
    return {
      meeting_provider: platformFromBody || "other",
      meeting_join_url: defaultJoin,
      meeting_host_url: defaultHost || defaultJoin,
      generated: false,
    };
  }

  if (process.env.JITSI_DISABLED === "1") {
    return {
      meeting_provider: platformFromBody || "other",
      meeting_join_url: "",
      meeting_host_url: "",
      generated: false,
    };
  }

  const room = jitsiRoomName(row?.id);
  const join = `https://meet.jit.si/${room}`;
  const hostName =
    row?.exam?.title && String(row.exam.title).trim() !== ""
      ? encodeURIComponent(String(row.exam.title).trim().slice(0, 80))
      : "exam";
  return {
    meeting_provider: "jitsi",
    meeting_join_url: join,
    meeting_host_url: `${join}#config.prejoinPageEnabled=false&config.enableWelcomePage=false&userInfo.displayName=${hostName}`,
    generated: true,
  };
}

const createSchedulePayload = (body, currentRow = null, userId = null) => {
  const source = body && typeof body === "object" ? body : {};
  const payload = {};

  const setIfDefined = (key, value) => {
    if (value !== undefined) payload[key] = value;
  };

  setIfDefined("exam_id", source.exam_id);
  setIfDefined("curriculum_id", source.curriculum_id);
  setIfDefined("curriculum_class_id", source.curriculum_class_id);
  setIfDefined("curriculum_class_level_id", source.curriculum_class_level_id);
  setIfDefined("teacher_id", source.teacher_id);
  setIfDefined("start_time", source.start_time);
  setIfDefined("end_time", source.end_time);
  setIfDefined("timezone", source.timezone);
  setIfDefined("status", source.status);
  setIfDefined("is_active", source.is_active);
  setIfDefined("allow_late_join_minutes", source.allow_late_join_minutes);
  setIfDefined("max_attempts", source.max_attempts);
  setIfDefined("requires_webcam", source.requires_webcam);
  setIfDefined("prevent_tab_switch", source.prevent_tab_switch);
  setIfDefined("proctoring_mode", source.proctoring_mode);
  setIfDefined("proctoring_rules_json", source.proctoring_rules_json);
  setIfDefined("meeting_provider", source.meeting_provider);
  setIfDefined("meeting_join_url", source.meeting_join_url);
  setIfDefined("meeting_host_url", source.meeting_host_url);

  if (!currentRow) {
    if (payload.timezone === undefined) payload.timezone = "Africa/Nairobi";
    if (payload.status === undefined) payload.status = "scheduled";
    if (payload.allow_late_join_minutes === undefined) payload.allow_late_join_minutes = 10;
    if (payload.proctoring_mode === undefined) payload.proctoring_mode = "none";
    if (payload.is_active === undefined) payload.is_active = true;
    if (userId) payload.created_by = userId;
  } else if (userId) {
    payload.updated_by = userId;
  }

  return payload;
};

exports.listExamSchedules = async (req, res) => {
  try {
    const where = {};
    if (req.query.exam_id) where.exam_id = req.query.exam_id;
    if (req.query.curriculum_id) where.curriculum_id = req.query.curriculum_id;
    if (req.query.curriculum_class_id) where.curriculum_class_id = req.query.curriculum_class_id;
    if (req.query.curriculum_class_level_id) where.curriculum_class_level_id = req.query.curriculum_class_level_id;
    if (req.query.teacher_id) where.teacher_id = req.query.teacher_id;
    if (req.query.status) where.status = req.query.status;
    if (req.query.is_active !== undefined) where.is_active = req.query.is_active === "true";
    if (req.query.date && /^\d{4}-\d{2}-\d{2}$/.test(String(req.query.date))) {
      const date = String(req.query.date);
      where.start_time = {
        [Op.between]: [new Date(`${date}T00:00:00.000Z`), new Date(`${date}T23:59:59.999Z`)],
      };
    }

    const rows = await ExamSchedule.findAll({
      where,
      include: scheduleIncludes,
      order: [["start_time", "ASC"]],
    });
    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/** Online exam slots from `from` through `from + days` (for online hub). */
exports.listOnlineExamSchedulesUpcoming = async (req, res) => {
  try {
    const todayIso = new Date().toISOString().slice(0, 10);
    let from = typeof req.query.from === "string" ? req.query.from.trim() : "";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(from)) from = todayIso;
    const days = Math.min(90, Math.max(1, parseInt(req.query.days, 10) || 28));
    const toIso = addDaysIso(from, days);
    const limit = Math.min(120, Math.max(1, parseInt(req.query.limit, 10) || 60));

    const rows = await ExamSchedule.findAll({
      where: {
        is_active: true,
        status: { [Op.in]: ["draft", "scheduled", "live"] },
        [Op.or]: [{ proctoring_mode: { [Op.ne]: "none" } }, { meeting_provider: { [Op.not]: null } }],
        start_time: {
          [Op.between]: [new Date(`${from}T00:00:00.000Z`), new Date(`${toIso}T23:59:59.999Z`)],
        },
      },
      include: scheduleIncludes,
      order: [["start_time", "ASC"]],
      limit,
    });

    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getExamSchedule = async (req, res) => {
  try {
    const row = await ExamSchedule.findByPk(req.params.id, { include: scheduleIncludes });
    if (!row) {
      return res.status(404).json({ success: false, message: "Exam schedule not found" });
    }
    return res.json({ success: true, data: row });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createExamSchedule = async (req, res) => {
  try {
    const payload = createSchedulePayload(req.body, null, req.user?.id || null);
    const row = await ExamSchedule.create(payload);
    const created = await ExamSchedule.findByPk(row.id, { include: scheduleIncludes });
    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateExamSchedule = async (req, res) => {
  try {
    const row = await ExamSchedule.findByPk(req.params.id);
    if (!row) {
      return res.status(404).json({ success: false, message: "Exam schedule not found" });
    }
    const patch = createSchedulePayload(req.body, row, req.user?.id || null);
    await row.update(patch);
    const updated = await ExamSchedule.findByPk(row.id, { include: scheduleIncludes });
    return res.json({ success: true, data: updated });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteExamSchedule = async (req, res) => {
  try {
    const row = await ExamSchedule.findByPk(req.params.id);
    if (!row) {
      return res.status(404).json({ success: false, message: "Exam schedule not found" });
    }
    await row.destroy();
    return res.json({ success: true, message: "Exam schedule deleted" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

/** Marks exam schedule live for online invigilation flow. */
exports.initiateOnlineExamSchedule = async (req, res) => {
  try {
    const row = await ExamSchedule.findByPk(req.params.id, { include: [{ model: Exam, as: "exam", attributes: ["id", "title"] }] });
    if (!row) {
      return res.status(404).json({ success: false, message: "Exam schedule not found" });
    }
    if (!row.is_active) {
      return res.status(400).json({ success: false, message: "Exam schedule is inactive" });
    }
    if (row.status === "cancelled" || row.status === "completed") {
      return res.status(400).json({ success: false, message: `Cannot initiate a ${row.status} exam schedule` });
    }
    const urls = resolveExamMeetingUrls(req.body, row);
    if (!urls.meeting_join_url) {
      return res.status(400).json({
        success: false,
        message:
          "No meeting join URL available. Jitsi is used by default (remove JITSI_DISABLED if you disabled it). Otherwise set ONLINE_MEETING_DEFAULT_JOIN_URL (and optionally ONLINE_MEETING_DEFAULT_HOST_URL), or send meeting_join_url (and optionally meeting_host_url) in the request body.",
      });
    }

    const patch = {
      status: "live",
      updated_by: req.user?.id || null,
    };

    patch.meeting_provider = urls.meeting_provider;
    patch.meeting_join_url = urls.meeting_join_url;
    patch.meeting_host_url = urls.meeting_host_url;

    await row.update(patch);
    const updated = await ExamSchedule.findByPk(row.id, { include: scheduleIncludes });
    return res.json({ success: true, data: updated, generated: urls.generated });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.notifyOnlineExamClass = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body && typeof req.body === "object" ? req.body : {};
    const noteExtra = body.note != null ? String(body.note).trim().slice(0, 2000) : "";

    const row = await ExamSchedule.findByPk(id, { include: scheduleIncludes });
    if (!row) return res.status(404).json({ success: false, message: "Exam schedule not found" });
    if (!row.curriculum_class_id) {
      return res.status(400).json({ success: false, message: "Exam schedule has no curriculum class." });
    }
    const joinUrl =
      (row.meeting_join_url && String(row.meeting_join_url).trim()) ||
      (body.meeting_join_url != null && String(body.meeting_join_url).trim()) ||
      "";
    if (!joinUrl) {
      return res.status(400).json({
        success: false,
        message: "No join URL yet. Prepare meeting links first (Initiate / open links), or include meeting_join_url in the request body.",
      });
    }

    const students = await Student.findAll({
      where: { curriculum_class_id: row.curriculum_class_id },
      attributes: ["id", "user_id"],
    });

    const examTitle = row.exam?.title || "Online exam";
    const dateLabel = row.start_time ? new Date(row.start_time).toISOString().slice(0, 10) : "";
    const title = `Online exam: ${examTitle}`;
    let message = dateLabel ? `${examTitle} · ${dateLabel}\n\nJoin: ${joinUrl}` : `${examTitle}\n\nJoin: ${joinUrl}`;
    if (noteExtra) message += `\n\n${noteExtra}`;

    let inApp = 0;
    const errors = [];
    for (const st of students) {
      try {
        await InAppNotification.create({
          user_id: st.user_id,
          title,
          message,
          type: "info",
          action_url: joinUrl.length > 500 ? joinUrl.slice(0, 500) : joinUrl,
        });
        inApp += 1;
      } catch (e) {
        errors.push({ student_id: st.id, step: "in_app", message: e.message });
      }
    }
    return res.json({
      success: true,
      data: {
        students_targeted: students.length,
        in_app_notifications_created: inApp,
        errors: errors.length ? errors : undefined,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getOnlineExamTracking = async (req, res) => {
  try {
    const { id } = req.params;
    const row = await ExamSchedule.findByPk(id, { include: scheduleIncludes });
    if (!row) return res.status(404).json({ success: false, message: "Exam schedule not found" });

    const attempts = await ExamAttempt.findAll({
      where: { exam_schedule_id: row.id },
      order: [["start_time", "DESC"]],
      include: [
        {
          model: Student,
          as: "student",
          attributes: ["id", "admission_number", "user_id"],
          include: [{ model: User, as: "user", ...userSafe }],
        },
      ],
      attributes: ["id", "student_id", "status", "start_time", "end_time", "time_spent_seconds", "submitted_at", "created_at"],
    });

    const recordings = Array.isArray(row.proctoring_rules_json?.recordings) ? row.proctoring_rules_json.recordings : [];

    return res.json({
      success: true,
      data: {
        exam_schedule: row,
        attendance_rows: attempts.map((a) => ({
          id: a.id,
          student: a.student || null,
          join_time: a.start_time,
          leave_time: a.end_time,
          duration_minutes: a.time_spent_seconds != null ? Math.round(Number(a.time_spent_seconds) / 60) : null,
          status: a.start_time || a.status === "completed" ? "Attended" : "Pending",
          submitted_at: a.submitted_at || null,
        })),
        recordings,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createOnlineExamRecording = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body && typeof req.body === "object" ? req.body : {};
    const recording_url =
      body.recording_url != null && String(body.recording_url).trim() !== "" ? String(body.recording_url).trim() : "";
    if (!recording_url) {
      return res.status(400).json({ success: false, message: "recording_url is required" });
    }
    const row = await ExamSchedule.findByPk(id);
    if (!row) return res.status(404).json({ success: false, message: "Exam schedule not found" });
    let duration_seconds = 0;
    if (body.duration_seconds != null && body.duration_seconds !== "") {
      const n = parseInt(body.duration_seconds, 10);
      if (Number.isFinite(n) && n >= 0) duration_seconds = n;
    }
    const prev = row.proctoring_rules_json && typeof row.proctoring_rules_json === "object" ? row.proctoring_rules_json : {};
    const recordings = Array.isArray(prev.recordings) ? [...prev.recordings] : [];
    recordings.unshift({
      id: crypto.randomUUID(),
      recording_url: recording_url.slice(0, 500),
      duration_seconds,
      created_at: new Date().toISOString(),
      created_by: req.user?.id || null,
    });
    const nextRules = { ...prev, recordings };
    await row.update({ proctoring_rules_json: nextRules, updated_by: req.user?.id || null });
    return res.status(201).json({ success: true, data: recordings[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/** Attendance snapshot for one exam schedule (derived from existing attempt/submission rows). */
exports.getExamScheduleAttendance = async (req, res) => {
  try {
    const row = await ExamSchedule.findByPk(req.params.id, { include: scheduleIncludes });
    if (!row) {
      return res.status(404).json({ success: false, message: "Exam schedule not found" });
    }

    const attempts = await ExamAttempt.findAll({
      where: { exam_schedule_id: row.id },
      include: [
        {
          model: Student,
          as: "student",
          required: false,
          include: [{ model: User, as: "user", attributes: ["id", "full_name", "username", "email"] }],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    const submissions = await ExamSubmission.findAll({
      where: { exam_id: row.exam_id },
      attributes: ["id", "student_id", "status", "started_at", "submitted_at"],
      order: [["created_at", "DESC"]],
    });

    const attendanceByStudent = new Map();
    for (const a of attempts) {
      const sid = a.student_id;
      if (!sid) continue;
      if (!attendanceByStudent.has(sid)) {
        attendanceByStudent.set(sid, {
          student_id: sid,
          student_name: a.student?.user?.full_name || a.student?.user?.username || "Student",
          attended: false,
          source: [],
          started_at: null,
          submitted_at: null,
          status: null,
        });
      }
      const item = attendanceByStudent.get(sid);
      item.source.push("exam_attempts");
      item.status = a.status || item.status;
      item.started_at = a.start_time || item.started_at;
      item.submitted_at = a.submitted_at || item.submitted_at;
      if (a.start_time || a.status === "in_progress" || a.status === "completed" || a.status === "submitted") {
        item.attended = true;
      }
    }

    for (const s of submissions) {
      const sid = s.student_id;
      if (!sid) continue;
      if (!attendanceByStudent.has(sid)) {
        attendanceByStudent.set(sid, {
          student_id: sid,
          student_name: "Student",
          attended: false,
          source: [],
          started_at: null,
          submitted_at: null,
          status: null,
        });
      }
      const item = attendanceByStudent.get(sid);
      item.source.push("exam_submissions");
      item.status = s.status || item.status;
      item.started_at = s.started_at || item.started_at;
      item.submitted_at = s.submitted_at || item.submitted_at;
      if (s.started_at || s.status === "submitted" || s.status === "draft") {
        item.attended = true;
      }
    }

    const students = Array.from(attendanceByStudent.values());
    const attendedCount = students.filter((s) => s.attended).length;

    return res.json({
      success: true,
      data: {
        exam_schedule_id: row.id,
        exam_id: row.exam_id,
        status: row.status,
        invigilator: row.teacher || null,
        invigilator_attended: row.status === "live" || row.status === "completed",
        invigilator_attended_at: row.updated_at || null,
        students,
        totals: {
          total_students_seen: students.length,
          attended_students: attendedCount,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
