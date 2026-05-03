const express = require("express");
const router = express.Router();
const {
  listClassSessions,
  listUpcoming,
  getClassSession,
  createClassSession,
  updateClassSession,
  endClassSession,
  getSessionAttendance,
  deleteClassSession,
} = require("../controllers/classSessionController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const { errorHandler } = require("../middleware/errorHandler");
const { checkStudentAccountAccess } = require("../middleware/checkStudentAccountAccess");

const { STAFF_ROLES } = require("../constants/userRoles");
const TEACH_OR_STAFF = [...STAFF_ROLES, "teacher"];
const WITH_STUDENT = [...TEACH_OR_STAFF, "student"];

router.get("/upcoming", authenticateUser, checkStudentAccountAccess, authorizeRoles(WITH_STUDENT), listUpcoming);
router.put("/:id/end", authenticateUser, checkStudentAccountAccess, authorizeRoles(TEACH_OR_STAFF), endClassSession);
router.get("/:id/attendance", authenticateUser, checkStudentAccountAccess, authorizeRoles(TEACH_OR_STAFF), getSessionAttendance);

router.get("/", authenticateUser, checkStudentAccountAccess, authorizeRoles(WITH_STUDENT), listClassSessions);
router.post("/", authenticateUser, checkStudentAccountAccess, authorizeRoles(TEACH_OR_STAFF), createClassSession);
router.get("/:id", authenticateUser, checkStudentAccountAccess, authorizeRoles(WITH_STUDENT), getClassSession);
router.put("/:id", authenticateUser, checkStudentAccountAccess, authorizeRoles(TEACH_OR_STAFF), updateClassSession);
router.delete("/:id", authenticateUser, checkStudentAccountAccess, authorizeRoles(TEACH_OR_STAFF), deleteClassSession);

router.use(errorHandler);

module.exports = router;
