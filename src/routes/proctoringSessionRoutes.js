const express = require("express");
const router = express.Router();
const {
  listProctoringSessions,
  getProctoringSession,
  createProctoringSession,
  updateProctoringSession,
  deleteProctoringSession,
} = require("../controllers/proctoringSessionController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const { errorHandler } = require("../middleware/errorHandler");
const { checkStudentAccountAccess } = require("../middleware/checkStudentAccountAccess");

const STAFF_ROLES = ["admin", "accountant", "librarian"];
const TEACH_OR_STAFF = [...STAFF_ROLES, "teacher"];
const WITH_STUDENT = [...TEACH_OR_STAFF, "student"];

router.get("/", authenticateUser, checkStudentAccountAccess, authorizeRoles(WITH_STUDENT), listProctoringSessions);
router.post("/", authenticateUser, checkStudentAccountAccess, authorizeRoles(WITH_STUDENT), createProctoringSession);
router.get("/:id", authenticateUser, checkStudentAccountAccess, authorizeRoles(WITH_STUDENT), getProctoringSession);
router.put("/:id", authenticateUser, checkStudentAccountAccess, authorizeRoles(WITH_STUDENT), updateProctoringSession);
router.delete("/:id", authenticateUser, checkStudentAccountAccess, authorizeRoles(STAFF_ROLES), deleteProctoringSession);

router.use(errorHandler);

module.exports = router;
