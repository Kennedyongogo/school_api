const {
  LiveClass,
  CurriculumClassTimetableLesson,
  CurriculumClassTimetable,
  CurriculumSubject,
  Teacher,
  User,
} = require("../models");
const webrtcRoomService = require("../services/webrtcRoomService");
const { getLiveKitUrl, isConfigured: liveKitConfigured } = require("../services/livekitService");
const { isInAppVideoPlatform } = require("../utils/meetingPlatform");
const { ADMIN_PORTAL_API_ROLES } = require("../constants/userRoles");
const { assertCanAccessLiveClass, ensureLiveClassLessonLink } = require("../services/liveClassAccess");
const { getLessonJoinWindow } = require("../utils/lessonJoinWindow");

const userSafe = { attributes: { exclude: ["password_hash"] } };

exports.getLiveClassRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const live = await LiveClass.findByPk(id, {
      attributes: [
        "id",
        "meeting_id",
        "join_url",
        "host_url",
        "platform",
        "session_status",
        "start_time",
        "end_time",
        "teacher_id",
        "curriculum_class_timetable_lesson_id",
      ],
      include: [
        {
          model: CurriculumClassTimetableLesson,
          as: "timetable_lesson",
          required: false,
          attributes: ["id", "lesson_date", "starts_at", "ends_at", "delivery_mode", "media_mode"],
          include: [
            {
              model: CurriculumClassTimetable,
              as: "timetable",
              required: false,
              attributes: ["id", "curriculum_class_id"],
            },
            { model: CurriculumSubject, as: "curriculum_subject", attributes: ["id", "name"] },
          ],
        },
        {
          model: Teacher,
          as: "host",
          required: false,
          attributes: ["id"],
          include: [{ model: User, as: "user", ...userSafe }],
        },
      ],
    });

    await ensureLiveClassLessonLink(live);
    await assertCanAccessLiveClass(req, live);

    const subjectName = live.timetable_lesson?.curriculum_subject?.name || "Online class";
    const role = req.user.role === "student" ? "student" : ADMIN_PORTAL_API_ROLES.includes(req.user.role) ? "teacher" : "participant";
    const isStaff = ADMIN_PORTAL_API_ROLES.includes(req.user.role);
    const joinWindow = getLessonJoinWindow({
      lesson_date: live.timetable_lesson?.lesson_date,
      starts_at: live.timetable_lesson?.starts_at,
      ends_at: live.timetable_lesson?.ends_at,
      session_status: live.session_status,
      is_staff: isStaff,
    });

    if (req.user.role === "student" && !joinWindow.can_join) {
      return res.status(403).json({
        success: false,
        message: joinWindow.reason || "This class is not open for joining.",
        data: { can_join: false, join_blocked_reason: joinWindow.reason },
      });
    }

    return res.json({
      success: true,
      data: {
        live_class_id: live.id,
        meeting_id: live.meeting_id,
        platform: live.platform,
        session_status: live.session_status,
        subject_name: subjectName,
        lesson_date: live.timetable_lesson?.lesson_date || null,
        starts_at: live.timetable_lesson?.starts_at || null,
        ends_at: live.timetable_lesson?.ends_at || null,
        can_join: joinWindow.can_join,
        join_blocked_reason: joinWindow.reason,
        join_opens_at: joinWindow.opens_at,
        join_closes_at: joinWindow.closes_at,
        ice_servers: isInAppVideoPlatform(live.platform) && live.platform !== "livekit" ? webrtcRoomService.getIceServers() : [],
        livekit_url: live.platform === "livekit" && liveKitConfigured() ? getLiveKitUrl() : null,
        video_mode: live.platform === "livekit" ? "livekit" : isInAppVideoPlatform(live.platform) ? "webrtc" : "external",
        media_mode: isStaff
          ? "video"
          : live.timetable_lesson?.delivery_mode === "online"
            ? String(live.timetable_lesson?.media_mode || "optional").toLowerCase()
            : "optional",
        role,
        join_path: webrtcRoomService.portalLiveClassPath(live.id),
      },
    });
  } catch (error) {
    const code = error.statusCode || 500;
    return res.status(code).json({ success: false, message: error.message });
  }
};
