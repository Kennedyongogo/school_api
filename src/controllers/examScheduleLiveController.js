const webrtcRoomService = require("../services/webrtcRoomService");
const { getLiveKitUrl, isConfigured: liveKitConfigured } = require("../services/livekitService");
const { isInAppVideoPlatform } = require("../utils/meetingPlatform");
const {
  loadExamForAccess,
  assertCanAccessExam,
  isStaffRole,
} = require("../services/examScheduleAccess");
const { getExamJoinWindow } = require("../utils/examJoinWindow");
const { resolveExamMeetingUrls } = require("../utils/examMeeting");
const { normalizeMode, usesLiveKitInvigilation } = require("../utils/examProctoring");

async function ensureLiveKitMeetingForExam(exam) {
  if (!usesLiveKitInvigilation(exam?.proctoring_mode)) return exam;
  if (exam.meeting_id && String(exam.meeting_provider || "").toLowerCase() === "livekit") return exam;
  const urls = resolveExamMeetingUrls({}, exam, { preferLiveKit: true });
  if (!urls.meeting_join_url) return exam;
  await exam.update({
    meeting_provider: urls.meeting_provider,
    meeting_id: urls.meeting_id,
    meeting_join_url: urls.meeting_join_url,
    meeting_host_url: urls.meeting_host_url,
  });
  return loadExamForAccess(exam.id);
}

exports.getExamLiveRoom = async (req, res) => {
  try {
    const { id } = req.params;
    let exam = await loadExamForAccess(id);
    await assertCanAccessExam(req, exam);
    exam = await ensureLiveKitMeetingForExam(exam);

    const staff = isStaffRole(req);
    const joinWindow = getExamJoinWindow({
      start_time: exam.start_time,
      end_time: exam.end_time,
      session_status: exam.session_status,
      allow_late_join_minutes: exam.allow_late_join_minutes,
      is_staff: staff,
    });

    if (req.user.role === "student" && !joinWindow.can_join) {
      return res.status(403).json({
        success: false,
        message: joinWindow.reason || "This exam room is not open.",
        data: { can_join: false, join_blocked_reason: joinWindow.reason },
      });
    }

    const platform = String(exam.meeting_provider || "").toLowerCase();
    const role = staff ? "teacher" : "student";

    return res.json({
      success: true,
      data: {
        exam_id: exam.id,
        exam_schedule_id: exam.id,
        exam_title: exam.title || "Exam",
        meeting_id: exam.meeting_id,
        platform,
        session_status: exam.session_status,
        status: exam.session_status,
        proctoring_mode: exam.proctoring_mode,
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
        media_mode: exam.requires_webcam === false ? "optional" : "video",
        role,
        join_path: webrtcRoomService.portalExamInvigilationPath(exam.id),
        host_path: webrtcRoomService.adminExamLivePath(exam.id),
      },
    });
  } catch (error) {
    const code = error.statusCode || 500;
    return res.status(code).json({ success: false, message: error.message });
  }
};

/** @deprecated alias */
exports.getExamScheduleLiveRoom = exports.getExamLiveRoom;
