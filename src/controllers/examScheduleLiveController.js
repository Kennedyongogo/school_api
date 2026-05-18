const { Exam } = require("../models");
const webrtcRoomService = require("../services/webrtcRoomService");
const { getLiveKitUrl, isConfigured: liveKitConfigured } = require("../services/livekitService");
const { isInAppVideoPlatform } = require("../utils/meetingPlatform");
const {
  loadExamScheduleForAccess,
  assertCanAccessExamSchedule,
  isStaffRole,
} = require("../services/examScheduleAccess");
const { getExamScheduleJoinWindow } = require("../utils/examJoinWindow");

const userSafe = { attributes: { exclude: ["password_hash"] } };

exports.getExamScheduleLiveRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const schedule = await loadExamScheduleForAccess(id);
    await assertCanAccessExamSchedule(req, schedule);

    const exam = await Exam.findByPk(schedule.exam_id, { attributes: ["id", "title", "requires_webcam"] });
    const staff = isStaffRole(req);
    const joinWindow = getExamScheduleJoinWindow({
      start_time: schedule.start_time,
      end_time: schedule.end_time,
      status: schedule.status,
      allow_late_join_minutes: schedule.allow_late_join_minutes,
      is_staff: staff,
    });

    if (req.user.role === "student" && !joinWindow.can_join) {
      return res.status(403).json({
        success: false,
        message: joinWindow.reason || "This exam room is not open.",
        data: { can_join: false, join_blocked_reason: joinWindow.reason },
      });
    }

    const platform = String(schedule.meeting_provider || "").toLowerCase();
    const role = staff ? "teacher" : "student";

    return res.json({
      success: true,
      data: {
        exam_schedule_id: schedule.id,
        exam_id: schedule.exam_id,
        exam_title: exam?.title || "Exam",
        meeting_id: schedule.meeting_id,
        platform,
        status: schedule.status,
        proctoring_mode: schedule.proctoring_mode,
        can_join: joinWindow.can_join,
        join_blocked_reason: joinWindow.reason,
        join_opens_at: joinWindow.opens_at,
        join_closes_at: joinWindow.closes_at,
        ice_servers:
          isInAppVideoPlatform(platform) && platform !== "livekit" ? webrtcRoomService.getIceServers() : [],
        livekit_url: platform === "livekit" && liveKitConfigured() ? getLiveKitUrl() : null,
        video_mode:
          platform === "livekit"
            ? "livekit"
            : isInAppVideoPlatform(platform)
              ? "webrtc"
              : "external",
        media_mode: schedule.requires_webcam === false ? "optional" : "video",
        role,
        join_path: webrtcRoomService.portalExamInvigilationPath(schedule.id),
        host_path: webrtcRoomService.adminExamLivePath(schedule.id),
      },
    });
  } catch (error) {
    const code = error.statusCode || 500;
    return res.status(code).json({ success: false, message: error.message });
  }
};
