const { ExamScheduleLobbyEntry, User } = require("../models");
const { createParticipantToken, isConfigured } = require("../services/livekitService");
const { isInAppVideoPlatform } = require("../utils/meetingPlatform");
const {
  loadExamScheduleForAccess,
  assertCanAccessExamSchedule,
  isTeacherRole,
  isStaffRole,
} = require("../services/examScheduleAccess");
const { getExamScheduleJoinWindow } = require("../utils/examJoinWindow");

exports.issueExamScheduleLiveKitToken = async (req, res) => {
  try {
    if (!isConfigured()) {
      return res.status(503).json({
        success: false,
        message: "LiveKit is not configured on the server.",
      });
    }

    const { id } = req.params;
    const schedule = await loadExamScheduleForAccess(id);
    await assertCanAccessExamSchedule(req, schedule);

    const platform = String(schedule.meeting_provider || "").toLowerCase();
    if (platform !== "livekit") {
      return res.status(400).json({
        success: false,
        message: "This exam session does not use LiveKit video.",
      });
    }

    const roomName = String(schedule.meeting_id || "").trim();
    if (!roomName) {
      return res.status(400).json({
        success: false,
        message: "This exam has no LiveKit room configured. Open meeting links from the timetable first.",
      });
    }

    const staff = isStaffRole(req);
    const joinWindow = getExamScheduleJoinWindow({
      start_time: schedule.start_time,
      end_time: schedule.end_time,
      status: schedule.status,
      allow_late_join_minutes: schedule.allow_late_join_minutes,
      is_staff: staff,
    });

    if (!staff && !joinWindow.can_join) {
      return res.status(403).json({
        success: false,
        message: joinWindow.reason || "This exam room is not open for joining.",
      });
    }

    let role = isTeacherRole(req) ? "teacher" : "student";

    if (req.user.role === "student") {
      const entry = await ExamScheduleLobbyEntry.findOne({
        where: { exam_schedule_id: id, user_id: req.user.id },
        order: [["requested_at", "DESC"]],
        attributes: ["status"],
      });
      if (!entry || entry.status !== "admitted") {
        return res.status(403).json({
          success: false,
          message: "You must be admitted by the invigilator before joining video.",
        });
      }
    }

    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "full_name", "username"],
    });
    const displayName =
      (user?.full_name && String(user.full_name).trim()) ||
      (user?.username && String(user.username).trim()) ||
      "Participant";

    const { token, url } = await createParticipantToken({
      roomName,
      identity: String(req.user.id),
      name: displayName,
      role,
    });

    return res.json({
      success: true,
      data: {
        token,
        url,
        room_name: roomName,
        exam_schedule_id: schedule.id,
        video_mode: isInAppVideoPlatform(platform) && platform === "livekit" ? "livekit" : "external",
      },
    });
  } catch (error) {
    const code = error.statusCode || 500;
    return res.status(code).json({ success: false, message: error.message });
  }
};
