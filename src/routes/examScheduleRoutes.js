const express = require("express");
const router = express.Router();
const {
  listExamSchedules,
  listOnlineExamSchedulesUpcoming,
  getExamSchedule,
  createExamSchedule,
  initiateOnlineExamSchedule,
  notifyOnlineExamClass,
  getOnlineExamTracking,
  createOnlineExamRecording,
  getExamScheduleAttendance,
  updateExamSchedule,
  deleteExamSchedule,
} = require("../controllers/examScheduleController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const { errorHandler } = require("../middleware/errorHandler");

const { STAFF_ROLES, ADMIN_PORTAL_API_ROLES} = require("../constants/userRoles");
const TEACH_OR_STAFF = [...STAFF_ROLES, "teacher"];

router.get("/", authenticateUser, authorizeRoles(TEACH_OR_STAFF), listExamSchedules);
router.get("/online-upcoming", authenticateUser, authorizeRoles(TEACH_OR_STAFF), listOnlineExamSchedulesUpcoming);
router.post("/", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), createExamSchedule);
router.post("/:id/initiate-online", authenticateUser, authorizeRoles(TEACH_OR_STAFF), initiateOnlineExamSchedule);
router.post("/:id/live-session/initiate", authenticateUser, authorizeRoles(TEACH_OR_STAFF), initiateOnlineExamSchedule);
router.post("/:id/notify-class", authenticateUser, authorizeRoles(TEACH_OR_STAFF), notifyOnlineExamClass);
router.get("/:id/live-tracking", authenticateUser, authorizeRoles(TEACH_OR_STAFF), getOnlineExamTracking);
router.post("/:id/live-recording", authenticateUser, authorizeRoles(TEACH_OR_STAFF), createOnlineExamRecording);
router.get("/:id/attendance", authenticateUser, authorizeRoles(TEACH_OR_STAFF), getExamScheduleAttendance);
router.get("/:id", authenticateUser, authorizeRoles(TEACH_OR_STAFF), getExamSchedule);
router.put("/:id", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), updateExamSchedule);
router.delete("/:id", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), deleteExamSchedule);

router.use(errorHandler);

module.exports = router;
