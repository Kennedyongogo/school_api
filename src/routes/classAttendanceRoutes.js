const express = require("express");
const router = express.Router();
const {
  listClassAttendances,
  listMyClassAttendance,
  getClassAttendance,
  createClassAttendance,
  updateClassAttendance,
  deleteClassAttendance,
} = require("../controllers/classAttendanceController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const { errorHandler } = require("../middleware/errorHandler");
const { checkStudentAccountAccess } = require("../middleware/checkStudentAccountAccess");

const STAFF_ROLES = ["admin", "accountant", "librarian"];
const TEACH_OR_STAFF = [...STAFF_ROLES, "teacher"];
const WITH_STUDENT = [...TEACH_OR_STAFF, "student"];

router.get("/my", authenticateUser, checkStudentAccountAccess, authorizeRoles(["student"]), listMyClassAttendance);

router.get("/", authenticateUser, checkStudentAccountAccess, authorizeRoles(WITH_STUDENT), listClassAttendances);
router.post("/", authenticateUser, checkStudentAccountAccess, authorizeRoles(WITH_STUDENT), createClassAttendance);
router.get("/:id", authenticateUser, checkStudentAccountAccess, authorizeRoles(WITH_STUDENT), getClassAttendance);
router.put("/:id", authenticateUser, checkStudentAccountAccess, authorizeRoles(TEACH_OR_STAFF), updateClassAttendance);
router.delete("/:id", authenticateUser, checkStudentAccountAccess, authorizeRoles(TEACH_OR_STAFF), deleteClassAttendance);

router.use(errorHandler);

module.exports = router;
