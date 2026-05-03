const express = require("express");
const router = express.Router();
const {
  listAttendanceTracking,
  getAttendanceTracking,
  createAttendanceTracking,
  updateAttendanceTracking,
  deleteAttendanceTracking,
} = require("../controllers/attendanceTrackingController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const { errorHandler } = require("../middleware/errorHandler");
const { checkStudentAccountAccess } = require("../middleware/checkStudentAccountAccess");

const { STAFF_ROLES, ADMIN_PORTAL_API_ROLES} = require("../constants/userRoles");
const TEACH_OR_STAFF = [...STAFF_ROLES, "teacher"];
const WITH_STUDENT = [...TEACH_OR_STAFF, "student"];

router.get("/", authenticateUser, checkStudentAccountAccess, authorizeRoles(WITH_STUDENT), listAttendanceTracking);
router.post("/", authenticateUser, checkStudentAccountAccess, authorizeRoles(WITH_STUDENT), createAttendanceTracking);
router.get("/:id", authenticateUser, checkStudentAccountAccess, authorizeRoles(WITH_STUDENT), getAttendanceTracking);
router.put("/:id", authenticateUser, checkStudentAccountAccess, authorizeRoles(WITH_STUDENT), updateAttendanceTracking);
router.delete("/:id", authenticateUser, checkStudentAccountAccess, authorizeRoles(ADMIN_PORTAL_API_ROLES), deleteAttendanceTracking);

router.use(errorHandler);

module.exports = router;
