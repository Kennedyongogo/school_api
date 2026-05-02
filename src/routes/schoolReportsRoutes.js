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

const STAFF_ROLES = ["admin", "accountant", "librarian"];

router.get("/teacher-attendance", authenticateUser, authorizeRoles(STAFF_ROLES), getTeacherAttendanceReport);
router.get("/class-attendance", authenticateUser, authorizeRoles(STAFF_ROLES), getClassAttendanceReport);
router.get("/syllabus-progress", authenticateUser, authorizeRoles(STAFF_ROLES), getSyllabusProgressReport);
router.get("/daily-summary", authenticateUser, authorizeRoles(STAFF_ROLES), getDailySummary);

router.use(errorHandler);

module.exports = router;
