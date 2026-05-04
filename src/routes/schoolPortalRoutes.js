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
const { authorizeRoles } = require("../middleware/auth");

router.get("/notifications", authenticateUser, listSchoolPortalNotifications);
router.patch("/notifications/:id/read", authenticateUser, markSchoolPortalNotificationRead);
router.post("/notifications/mark-all-read", authenticateUser, markAllSchoolPortalNotificationsRead);

router.post("/live-session/join", authenticateUser, authorizeRoles(["student"]), recordLiveSessionJoin);
router.post("/live-session/leave", authenticateUser, authorizeRoles(["student"]), recordLiveSessionLeave);

router.use(errorHandler);

module.exports = router;
