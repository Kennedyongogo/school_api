const express = require("express");
const router = express.Router();
const {
  postHeartbeat,
  postActivity,
  getSessionTimeline,
  getSessionPresenceStatus,
} = require("../controllers/realTimeTrackingController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const { errorHandler } = require("../middleware/errorHandler");
const { checkStudentAccountAccess } = require("../middleware/checkStudentAccountAccess");

const TEACH_OR_STAFF = ["admin", "accountant", "librarian", "teacher"];
const WITH_STUDENT = [...TEACH_OR_STAFF, "student"];

router.post("/heartbeat", authenticateUser, checkStudentAccountAccess, authorizeRoles(["student"]), postHeartbeat);
router.post("/activity", authenticateUser, checkStudentAccountAccess, authorizeRoles(["student"]), postActivity);

router.get("/sessions/:sessionId/timeline", authenticateUser, checkStudentAccountAccess, authorizeRoles(WITH_STUDENT), getSessionTimeline);
router.get("/sessions/:sessionId/status", authenticateUser, checkStudentAccountAccess, authorizeRoles(WITH_STUDENT), getSessionPresenceStatus);

router.use(errorHandler);

module.exports = router;
