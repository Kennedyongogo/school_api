const {
  RealTimeActivity,
  ExamAttempt,
  AttendanceTracking,
  Student,
  ProctoringSession,
  ProctoringEvent,
} = require("../models");
const { STAFF_ROLES } = require("../constants/userRoles");

const TEACH_OR_STAFF_ROLES = [...STAFF_ROLES, "teacher"];

function pick(body, camel, snake) {
  return body[snake] !== undefined ? body[snake] : body[camel];
}

async function studentProfileFromReq(req) {
  return Student.findOne({ where: { user_id: req.user.id } });
}

async function assertStudentWriter(req, studentId) {
  if (!["student"].includes(req.user.role)) {
    return { ok: false, status: 403, message: "Only students may send realtime telemetry" };
  }
  const profile = await studentProfileFromReq(req);
  if (!profile || profile.id !== studentId) {
    return { ok: false, status: 403, message: "Forbidden" };
  }
  return { ok: true, profile };
}

async function verifyRealtimeSession(studentId, sessionId, sessionType) {
  if (sessionType === "exam") {
    const att = await ExamAttempt.findByPk(sessionId);
    if (!att || att.student_id !== studentId) return false;
    return ["pending", "in_progress", "paused"].includes(att.status);
  }
  if (sessionType === "class" || sessionType === "study") {
    const row = await AttendanceTracking.findByPk(sessionId);
    return !!(row && row.student_id === studentId);
  }
  return false;
}

async function assertCanReadSession(req, studentId, sessionId, sessionType) {
  const staff = TEACH_OR_STAFF_ROLES.includes(req.user.role);
  if (staff) return true;
  if (req.user.role === "student") {
    const profile = await studentProfileFromReq(req);
    if (!profile || profile.id !== studentId) return false;
    return verifyRealtimeSession(profile.id, sessionId, sessionType);
  }
  return false;
}

const FLAGGED_TYPES = new Set([
  "tab_switch",
  "window_blur",
  "copy_attempt",
  "paste_attempt",
  "right_click",
  "screenshot_taken",
]);

async function mirrorProctoringViolation(examAttemptId, activityType, activityData) {
  const session = await ProctoringSession.findOne({ where: { exam_attempt_id: examAttemptId } });
  if (!session) return;

  let event_type = null;
  if (activityType === "tab_switch") event_type = "tab_switch";
  else if (activityType === "window_blur") event_type = "window_blur";
  else if (activityType === "copy_attempt" || activityType === "paste_attempt") event_type = "copy_paste";
  else if (activityType === "right_click") event_type = "right_click";
  if (!event_type) return;

  await ProctoringEvent.create({
    proctoring_session_id: session.id,
    event_type,
    severity: activityType === "tab_switch" ? "high" : "medium",
    details: activityData || {},
  });

  await session.increment("total_violations");
}

async function bumpExamCounters(examAttemptId, activityType) {
  const row = await ExamAttempt.findByPk(examAttemptId);
  if (!row) return;

  if (activityType === "tab_switch") {
    await row.increment("tab_switch_count");
    await row.increment("warning_count");
  } else if (
    ["window_blur", "copy_attempt", "paste_attempt", "right_click", "screenshot_taken"].includes(activityType)
  ) {
    await row.increment("warning_count");
  }
}

exports.postHeartbeat = async (req, res) => {
  try {
    const studentId = pick(req.body, "studentId", "student_id");
    const sessionId = pick(req.body, "sessionId", "session_id");
    let sessionType = pick(req.body, "sessionType", "session_type");
    const tsRaw = pick(req.body, "timestamp", "timestamp");
    const isActive = pick(req.body, "isActive", "is_active");

    if (!studentId || !sessionId || !sessionType) {
      return res.status(400).json({
        success: false,
        message: "student_id, session_id, and session_type are required",
      });
    }

    sessionType = String(sessionType).toLowerCase();
    const gate = await assertStudentWriter(req, studentId);
    if (!gate.ok) return res.status(gate.status).json({ success: false, message: gate.message });

    if (!(await verifyRealtimeSession(studentId, sessionId, sessionType))) {
      return res.status(403).json({ success: false, message: "Invalid session or session closed" });
    }

    const ts = tsRaw ? new Date(tsRaw) : new Date();
    const presence =
      typeof isActive === "boolean" ? isActive : typeof isActive === "string" ? isActive === "true" : true;

    if (sessionType === "exam") {
      await ExamAttempt.update(
        { last_activity_at: ts, client_presence_active: presence },
        { where: { id: sessionId, student_id: studentId } }
      );
    }

    await RealTimeActivity.create({
      student_id: studentId,
      session_id: sessionId,
      session_type: sessionType,
      activity_type: "heartbeat",
      activity_data: { is_active: presence },
      timestamp: ts,
      is_flagged: false,
    });

    return res.json({ success: true, message: "Heartbeat received" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.postActivity = async (req, res) => {
  try {
    const studentId = pick(req.body, "studentId", "student_id");
    const sessionId = pick(req.body, "sessionId", "session_id");
    let sessionType = pick(req.body, "sessionType", "session_type");
    const activityType = pick(req.body, "activityType", "activity_type");
    const activityData = pick(req.body, "activityData", "activity_data") || {};
    const tsRaw = pick(req.body, "timestamp", "timestamp");

    if (!studentId || !sessionId || !sessionType || !activityType) {
      return res.status(400).json({
        success: false,
        message: "student_id, session_id, session_type, and activity_type are required",
      });
    }

    sessionType = String(sessionType).toLowerCase();
    const gate = await assertStudentWriter(req, studentId);
    if (!gate.ok) return res.status(gate.status).json({ success: false, message: gate.message });

    if (!(await verifyRealtimeSession(studentId, sessionId, sessionType))) {
      return res.status(403).json({ success: false, message: "Invalid session or session closed" });
    }

    const ts = tsRaw ? new Date(tsRaw) : new Date();

    let isFlagged = FLAGGED_TYPES.has(activityType);
    let flagReason = isFlagged ? `${activityType} detected` : null;

    if (sessionType === "exam") {
      if (activityType === "exam_paused") {
        await ExamAttempt.update({ status: "paused", last_activity_at: ts }, { where: { id: sessionId, student_id: studentId } });
      } else if (activityType === "exam_resumed") {
        await ExamAttempt.update({ status: "in_progress", last_activity_at: ts }, { where: { id: sessionId, student_id: studentId } });
      } else {
        await ExamAttempt.update({ last_activity_at: ts }, { where: { id: sessionId, student_id: studentId } });
      }

      if (isFlagged) {
        await bumpExamCounters(sessionId, activityType);
        await mirrorProctoringViolation(sessionId, activityType, activityData);
      }
    }

    await RealTimeActivity.create({
      student_id: studentId,
      session_id: sessionId,
      session_type: sessionType,
      activity_type: activityType,
      activity_data: activityData,
      timestamp: ts,
      is_flagged: isFlagged,
      flag_reason: flagReason,
    });

    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSessionTimeline = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const sessionType = req.query.session_type || req.query.sessionType;
    const studentId = req.query.student_id || req.query.studentId;

    if (!sessionType || !studentId) {
      return res.status(400).json({
        success: false,
        message: "student_id and session_type query params are required",
      });
    }

    const can = await assertCanReadSession(req, studentId, sessionId, sessionType);
    if (!can) return res.status(403).json({ success: false, message: "Forbidden" });

    const activities = await RealTimeActivity.findAll({
      where: {
        session_id: sessionId,
        session_type: sessionType,
        student_id: studentId,
      },
      order: [["timestamp", "ASC"]],
    });

    return res.json({ success: true, data: activities });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSessionPresenceStatus = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const sessionType = req.query.session_type || req.query.sessionType;
    const studentId = req.query.student_id || req.query.studentId;

    if (!sessionType || !studentId) {
      return res.status(400).json({
        success: false,
        message: "student_id and session_type query params are required",
      });
    }

    const can = await assertCanReadSession(req, studentId, sessionId, sessionType);
    if (!can) return res.status(403).json({ success: false, message: "Forbidden" });

    if (sessionType === "exam") {
      const attempt = await ExamAttempt.findByPk(sessionId);
      if (!attempt || attempt.student_id !== studentId) {
        return res.status(404).json({ success: false, message: "Attempt not found" });
      }

      const lastActivity = await RealTimeActivity.findOne({
        where: {
          session_id: sessionId,
          session_type: "exam",
          activity_type: "heartbeat",
          student_id: studentId,
        },
        order: [["timestamp", "DESC"]],
      });

      const lastTs = lastActivity ? new Date(lastActivity.timestamp).getTime() : null;
      const now = Date.now();
      const heartbeatFresh = lastTs != null && now - lastTs < 30000;

      const presence =
        typeof attempt.client_presence_active === "boolean" ? attempt.client_presence_active : true;

      const isActive = heartbeatFresh && presence && ["in_progress", "paused"].includes(attempt.status);

      return res.json({
        success: true,
        data: {
          is_active: isActive,
          last_activity_at: attempt.last_activity_at,
          last_heartbeat_at: lastActivity?.timestamp ?? null,
          exam_status: attempt.status,
          tab_switch_count: attempt.tab_switch_count,
          warning_count: attempt.warning_count,
        },
      });
    }

    const lastHb = await RealTimeActivity.findOne({
      where: {
        session_id: sessionId,
        session_type: sessionType,
        activity_type: "heartbeat",
        student_id: studentId,
      },
      order: [["timestamp", "DESC"]],
    });

    const lastTs = lastHb ? new Date(lastHb.timestamp).getTime() : null;
    const isActive = lastTs != null && Date.now() - lastTs < 30000;

    return res.json({
      success: true,
      data: {
        is_active: isActive,
        last_heartbeat_at: lastHb?.timestamp ?? null,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
