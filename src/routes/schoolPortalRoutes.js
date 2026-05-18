const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middleware/auth");
const { errorHandler } = require("../middleware/errorHandler");
const {
  listSchoolPortalNotifications,
  markSchoolPortalNotificationRead,
  markAllSchoolPortalNotificationsRead,
} = require("../controllers/schoolPortalNotificationController");
const {
  recordLiveSessionJoin,
  recordLiveSessionLeave,
} = require("../controllers/schoolPortalLiveSessionController");
const { getLiveClassRoom } = require("../controllers/schoolPortalLiveClassController");
const { issueLiveKitToken } = require("../controllers/livekitTokenController");
const {
  getLiveClassInteractions,
  postLiveClassChat,
  markLiveClassQuestionAnswered,
  raiseHand,
  lowerHand,
  dismissHand,
  postLiveClassReaction,
} = require("../controllers/liveClassInteractionController");
const {
  getLiveClassLobby,
  getMyLobbyStatus,
  requestLobbyJoin,
  admitLobbyEntry,
  denyLobbyEntry,
  admitAllLobby,
  leaveLobby,
} = require("../controllers/liveClassLobbyController");
const {
  listMyStudentTimetableLessons,
  listMyStudentExamSchedules,
  getMyStudentExamResult,
} = require("../controllers/schoolPortalTimetableController");
const { getExamScheduleLiveRoom } = require("../controllers/examScheduleLiveController");
const { issueExamScheduleLiveKitToken } = require("../controllers/examScheduleLivekitTokenController");
const {
  getExamScheduleLobby,
  getMyExamScheduleLobbyStatus,
  requestExamScheduleLobbyJoin,
  leaveExamScheduleLobby,
  admitExamScheduleLobbyEntry,
  denyExamScheduleLobbyEntry,
  admitAllExamScheduleLobby,
} = require("../controllers/examScheduleLobbyController");
const { authorizeRoles } = require("../middleware/auth");

router.get("/notifications", authenticateUser, listSchoolPortalNotifications);
router.patch("/notifications/:id/read", authenticateUser, markSchoolPortalNotificationRead);
router.post("/notifications/mark-all-read", authenticateUser, markAllSchoolPortalNotificationsRead);

router.post("/live-session/join", authenticateUser, authorizeRoles(["student"]), recordLiveSessionJoin);
router.post("/live-session/leave", authenticateUser, authorizeRoles(["student"]), recordLiveSessionLeave);
router.get("/live-class/:id", authenticateUser, getLiveClassRoom);
router.post("/live-class/:id/livekit-token", authenticateUser, issueLiveKitToken);
router.get("/live-class/:id/interactions", authenticateUser, getLiveClassInteractions);
router.post("/live-class/:id/chat", authenticateUser, postLiveClassChat);
router.patch("/live-class/:id/chat/:messageId/answered", authenticateUser, markLiveClassQuestionAnswered);
router.post("/live-class/:id/hand/raise", authenticateUser, raiseHand);
router.post("/live-class/:id/hand/lower", authenticateUser, lowerHand);
router.post("/live-class/:id/hand/:handId/dismiss", authenticateUser, dismissHand);
router.post("/live-class/:id/reaction", authenticateUser, postLiveClassReaction);
router.get("/live-class/:id/lobby", authenticateUser, getLiveClassLobby);
router.get("/live-class/:id/lobby/me", authenticateUser, getMyLobbyStatus);
router.post("/live-class/:id/lobby/join", authenticateUser, requestLobbyJoin);
router.post("/live-class/:id/lobby/leave", authenticateUser, leaveLobby);
router.post("/live-class/:id/lobby/:entryId/admit", authenticateUser, admitLobbyEntry);
router.post("/live-class/:id/lobby/:entryId/deny", authenticateUser, denyLobbyEntry);
router.post("/live-class/:id/lobby/admit-all", authenticateUser, admitAllLobby);
router.get("/student/timetable-lessons", authenticateUser, authorizeRoles(["student"]), listMyStudentTimetableLessons);
router.get("/student/exam-schedules", authenticateUser, authorizeRoles(["student"]), listMyStudentExamSchedules);
router.get("/student/exam-results/:examScheduleId", authenticateUser, authorizeRoles(["student"]), getMyStudentExamResult);
router.get("/exam-schedule/:id", authenticateUser, getExamScheduleLiveRoom);
router.post("/exam-schedule/:id/livekit-token", authenticateUser, issueExamScheduleLiveKitToken);
router.get("/exam-schedule/:id/lobby", authenticateUser, getExamScheduleLobby);
router.get("/exam-schedule/:id/lobby/me", authenticateUser, getMyExamScheduleLobbyStatus);
router.post("/exam-schedule/:id/lobby/join", authenticateUser, requestExamScheduleLobbyJoin);
router.post("/exam-schedule/:id/lobby/leave", authenticateUser, leaveExamScheduleLobby);
router.post("/exam-schedule/:id/lobby/:entryId/admit", authenticateUser, admitExamScheduleLobbyEntry);
router.post("/exam-schedule/:id/lobby/:entryId/deny", authenticateUser, denyExamScheduleLobbyEntry);
router.post("/exam-schedule/:id/lobby/admit-all", authenticateUser, admitAllExamScheduleLobby);

router.use(errorHandler);

module.exports = router;
