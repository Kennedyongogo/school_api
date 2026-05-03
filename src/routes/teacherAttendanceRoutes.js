const express = require("express");
const router = express.Router();
const {
  listTeacherAttendances,
  getTeacherAttendance,
  createTeacherAttendance,
  updateTeacherAttendance,
  deleteTeacherAttendance,
  checkIn,
  checkOut,
} = require("../controllers/teacherAttendanceController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const { errorHandler } = require("../middleware/errorHandler");

const { STAFF_ROLES, ADMIN_PORTAL_API_ROLES} = require("../constants/userRoles");
const TEACH_OR_STAFF = [...STAFF_ROLES, "teacher"];

router.post("/check-in", authenticateUser, authorizeRoles(TEACH_OR_STAFF), checkIn);
router.put("/check-out", authenticateUser, authorizeRoles(TEACH_OR_STAFF), checkOut);

router.get("/", authenticateUser, authorizeRoles(TEACH_OR_STAFF), listTeacherAttendances);
router.post("/", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), createTeacherAttendance);
router.get("/:id", authenticateUser, authorizeRoles(TEACH_OR_STAFF), getTeacherAttendance);
router.put("/:id", authenticateUser, authorizeRoles(TEACH_OR_STAFF), updateTeacherAttendance);
router.delete("/:id", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), deleteTeacherAttendance);

router.use(errorHandler);

module.exports = router;
