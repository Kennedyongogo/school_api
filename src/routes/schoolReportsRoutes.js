const express = require("express");
const router = express.Router();
const {
  getTeacherAttendanceReport,
  getClassAttendanceReport,
  getSyllabusProgressReport,
  getDailySummary,
} = require("../controllers/schoolReportsController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const { errorHandler } = require("../middleware/errorHandler");

const { STAFF_ROLES, ADMIN_PORTAL_API_ROLES} = require("../constants/userRoles");

router.get("/teacher-attendance", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), getTeacherAttendanceReport);
router.get("/class-attendance", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), getClassAttendanceReport);
router.get("/syllabus-progress", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), getSyllabusProgressReport);
router.get("/daily-summary", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), getDailySummary);

router.use(errorHandler);

module.exports = router;
