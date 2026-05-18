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
  ExamSessionLog,
} = require("../models");
const { Op } = require("sequelize");
const crypto = require("crypto");
const webrtcRoomService = require("../services/webrtcRoomService");
const { isInAppVideoPlatform, defaultOnlineMeetingMode } = require("../utils/meetingPlatform");
const { isConfigured: liveKitConfigured } = require("../services/livekitService");

const userSafe = { attributes: { exclude: ["password_hash"] } };

async function teacherProfileFromReq(req) {
  if (req.user?.role !== "teacher") return null;
  return Teacher.findOne({ where: { user_id: req.user.id }, attributes: ["id", "user_id"] });
}

async function enforceTeacherScheduleOwnership(req, schedule) {
  if (req.user?.role !== "teacher") return null;
  const teacherProfile = await teacherProfileFromReq(req);
  if (!teacherProfile) {
    return { ok: false, code: 403, message: "Teacher profile not found for this user." };
  }
  if (String(schedule?.teacher_id || "") !== String(teacherProfile.id)) {
    return { ok: false, code: 403, message: "Forbidden: this schedule is assigned to another invigilator." };
  }
  return { ok: true, teacherProfile };
}

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
  const s = String(raw || "").trim().toLowerCase().replace(/-/g, "_");
  if (!s) return "";
  if (s === "livekit") return "livekit";
  if (s === "webrtc") return "webrtc";
  if (s === "jitsi") return "jitsi";
  return "other";
}

function jitsiRoomName(scheduleId) {
  return `schoolexam-${String(scheduleId || "").replace(/[^a-zA-Z0-9]/g, "").slice(0, 14)}-${crypto
    .randomUUID()
    .slice(0, 8)}`;
}

function tryProvisionExamLiveKit(row) {
  const mode = defaultOnlineMeetingMode();
  if (mode !== "livekit" && mode !== "webrtc") return null;
  if (mode === "livekit" && !liveKitConfigured()) return null;
  if (!row?.id) return null;
  const p = webrtcRoomService.provisionForExamSchedule(row.id, mode);
  const links = webrtcRoomService.urlsForExamScheduleRow(row.id);
  return {
    meeting_provider: p.platform,
    meeting_id: p.meeting_id,
    meeting_join_url: links.join_url,
    meeting_host_url: links.host_url,
    generated: true,
  };
}

function resolveExamMeetingUrls(body, row, options = {}) {
  const b = body && typeof body === "object" ? body : {};
  const joinFromBody = b.meeting_join_url != null ? String(b.meeting_join_url).trim() : "";
  const hostFromBody = b.meeting_host_url != null ? String(b.meeting_host_url).trim() : "";
  const platformFromBody = normalizePlatform(b.meeting_provider);
  const preferLiveKit = options.preferLiveKit === true;

  if (joinFromBody) {
    return {
      meeting_provider: platformFromBody || "other",
      meeting_id: b.meeting_id != null ? String(b.meeting_id).trim() : row?.meeting_id || null,
      meeting_join_url: joinFromBody,
      meeting_host_url: hostFromBody || joinFromBody,
      generated: false,
    };
  }

  // On "go live" / initiate: upgrade stale Jitsi links to LiveKit when the server supports it.
  if (preferLiveKit) {
    const liveKitProvision = tryProvisionExamLiveKit(row);
    if (liveKitProvision?.meeting_join_url) return liveKitProvision;
  }

  if (row?.meeting_id && isInAppVideoPlatform(row.meeting_provider)) {
    const links = webrtcRoomService.urlsForExamScheduleRow(row.id);
    return {
      meeting_provider: normalizePlatform(row.meeting_provider),
      meeting_id: String(row.meeting_id).trim(),
      meeting_join_url: links.join_url,
      meeting_host_url: links.host_url,
      generated: false,
    };
  }

  if (row?.meeting_join_url && String(row.meeting_join_url).trim() !== "" && !isInAppVideoPlatform(row.meeting_provider)) {
    return {
      meeting_provider: normalizePlatform(row.meeting_provider) || "jitsi",
      meeting_id: row.meeting_id || null,
      meeting_join_url: String(row.meeting_join_url).trim(),
      meeting_host_url:
        row.meeting_host_url && String(row.meeting_host_url).trim() !== ""
          ? String(row.meeting_host_url).trim()
          : String(row.meeting_join_url).trim(),
      generated: false,
    };
  }

  const liveKitProvision = tryProvisionExamLiveKit(row);
  if (liveKitProvision?.meeting_join_url) return liveKitProvision;

  const defaultJoin = process.env.ONLINE_MEETING_DEFAULT_JOIN_URL ? String(process.env.ONLINE_MEETING_DEFAULT_JOIN_URL).trim() : "";
  const defaultHost = process.env.ONLINE_MEETING_DEFAULT_HOST_URL ? String(process.env.ONLINE_MEETING_DEFAULT_HOST_URL).trim() : "";
  if (defaultJoin) {
    return {
      meeting_provider: platformFromBody || "other",
      meeting_id: null,
      meeting_join_url: defaultJoin,
      meeting_host_url: defaultHost || defaultJoin,
      generated: false,
    };
  }

  if (process.env.JITSI_DISABLED === "1") {
    return {
      meeting_provider: platformFromBody || "other",
      meeting_id: null,
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
    meeting_id: null,
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
  setIfDefined("meeting_id", source.meeting_id);
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
    const teacherProfile = await teacherProfileFromReq(req);
    if (req.user?.role === "teacher" && !teacherProfile) {
      return res.status(403).json({ success: false, message: "Teacher profile not found for this user." });
    }
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
    if (req.user?.role === "teacher" && teacherProfile?.id) {
      where.teacher_id = teacherProfile.id;
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
    const ownership = await enforceTeacherScheduleOwnership(req, row);
    if (ownership && ownership.ok === false) {
      return res.status(ownership.code).json({ success: false, message: ownership.message });
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
    const ownership = await enforceTeacherScheduleOwnership(req, row);
    if (ownership && ownership.ok === false) {
      return res.status(ownership.code).json({ success: false, message: ownership.message });
    }
    if (!row.is_active) {
      return res.status(400).json({ success: false, message: "Exam schedule is inactive" });
    }
    if (row.status === "cancelled" || row.status === "completed") {
      return res.status(400).json({ success: false, message: `Cannot initiate a ${row.status} exam schedule` });
    }
    const urls = resolveExamMeetingUrls(req.body, row, { preferLiveKit: true });
    if (!urls.meeting_join_url) {
      const liveKitHint = liveKitConfigured()
        ? ""
        : " LiveKit is not configured — set LIVEKIT_URL, LIVEKIT_API_KEY, and LIVEKIT_API_SECRET.";
      return res.status(400).json({
        success: false,
        message:
          `No meeting URL available. Set ONLINE_MEETING_PLATFORM=livekit${liveKitHint} Or set ONLINE_MEETING_DEFAULT_JOIN_URL, or send meeting_join_url in the request body.`,
      });
    }

    const patch = {
      status: "live",
      updated_by: req.user?.id || null,
    };

    patch.meeting_provider = urls.meeting_provider;
    patch.meeting_join_url = urls.meeting_join_url;
    patch.meeting_host_url = urls.meeting_host_url;
    if (urls.meeting_id) patch.meeting_id = urls.meeting_id;

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
    const ownership = await enforceTeacherScheduleOwnership(req, row);
    if (ownership && ownership.ok === false) {
      return res.status(ownership.code).json({ success: false, message: ownership.message });
    }
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
    const ownership = await enforceTeacherScheduleOwnership(req, row);
    if (ownership && ownership.ok === false) {
      return res.status(ownership.code).json({ success: false, message: ownership.message });
    }

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
    const attemptIds = attempts.map((a) => a.id).filter(Boolean);
    const logs = attemptIds.length
      ? await ExamSessionLog.findAll({
          where: { exam_attempt_id: { [Op.in]: attemptIds } },
          attributes: ["id", "exam_attempt_id", "event_type", "event_timestamp", "event_data"],
          order: [["event_timestamp", "ASC"]],
        })
      : [];
    const logsByAttempt = new Map();
    for (const lg of logs) {
      const key = lg.exam_attempt_id;
      if (!logsByAttempt.has(key)) logsByAttempt.set(key, []);
      logsByAttempt.get(key).push(lg);
    }

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
    const ownership = await enforceTeacherScheduleOwnership(req, row);
    if (ownership && ownership.ok === false) {
      return res.status(ownership.code).json({ success: false, message: ownership.message });
    }
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

exports.getExamScheduleProctorMonitor = async (req, res) => {
  try {
    const { id } = req.params;
    const schedule = await ExamSchedule.findByPk(id, { include: scheduleIncludes });
    if (!schedule) return res.status(404).json({ success: false, message: "Exam schedule not found" });
    const ownership = await enforceTeacherScheduleOwnership(req, schedule);
    if (ownership && ownership.ok === false) {
      return res.status(ownership.code).json({ success: false, message: ownership.message });
    }
    if (!schedule.curriculum_class_id) {
      return res.status(400).json({ success: false, message: "Exam schedule has no curriculum class." });
    }

    const roster = await Student.findAll({
      where: { curriculum_class_id: schedule.curriculum_class_id },
      attributes: ["id", "admission_number", "user_id"],
      include: [{ model: User, as: "user", attributes: ["id", "full_name", "username", "email"] }],
      order: [[{ model: User, as: "user" }, "full_name", "ASC"]],
    });

    const attempts = await ExamAttempt.findAll({
      where: { exam_schedule_id: schedule.id },
      attributes: [
        "id",
        "student_id",
        "status",
        "start_time",
        "end_time",
        "submitted_at",
        "webcam_enabled",
        "tab_switch_count",
        "warning_count",
        "last_activity_at",
        "client_presence_active",
        "is_cancelled",
        "cancellation_reason",
      ],
      order: [["created_at", "DESC"]],
    });
    const attemptIds = attempts.map((a) => a.id).filter(Boolean);
    const logs = attemptIds.length
      ? await ExamSessionLog.findAll({
          where: { exam_attempt_id: { [Op.in]: attemptIds } },
          attributes: ["id", "exam_attempt_id", "event_type", "event_timestamp", "event_data"],
          order: [["event_timestamp", "ASC"]],
        })
      : [];
    const logsByAttempt = new Map();
    for (const lg of logs) {
      const key = lg.exam_attempt_id;
      if (!logsByAttempt.has(key)) logsByAttempt.set(key, []);
      logsByAttempt.get(key).push(lg);
    }
    const attemptByStudent = new Map(attempts.map((a) => [a.student_id, a]));

    const rows = roster.map((s) => {
      const a = attemptByStudent.get(s.id);
      const started = !!(a?.start_time);
      const submitted = !!(a?.submitted_at) || a?.status === "completed";
      const status = a?.is_cancelled
        ? "closed"
        : submitted
          ? "submitted"
          : started
            ? (a?.status || "in_progress")
            : "not_started";
      return {
        student: s,
        attempt: a || null,
        status,
        tab_switch_count: a?.tab_switch_count ?? 0,
        warning_count: a?.warning_count ?? 0,
        webcam_enabled: a?.webcam_enabled ?? false,
        last_activity_at: a?.last_activity_at ?? null,
        is_cancelled: !!a?.is_cancelled,
        cancellation_reason: a?.cancellation_reason || null,
        session_logs: a?.id ? logsByAttempt.get(a.id) || [] : [],
      };
    });

    const summary = rows.reduce(
      (acc, r) => {
        acc.total += 1;
        if (r.status === "not_started") acc.not_started += 1;
        else if (r.status === "submitted" || r.status === "completed") acc.submitted += 1;
        else acc.in_progress += 1;
        return acc;
      },
      { total: 0, not_started: 0, in_progress: 0, submitted: 0 }
    );

    return res.json({
      success: true,
      data: {
        exam_schedule: schedule,
        summary,
        roster_rows: rows,
      },
    });
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
    const ownership = await enforceTeacherScheduleOwnership(req, row);
    if (ownership && ownership.ok === false) {
      return res.status(ownership.code).json({ success: false, message: ownership.message });
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
