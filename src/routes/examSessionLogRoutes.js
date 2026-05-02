const express = require("express");
const router = express.Router();
const {
  listExamSessionLogs,
  createExamSessionLog,
  deleteExamSessionLog,
} = require("../controllers/examSessionLogController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const { errorHandler } = require("../middleware/errorHandler");
const { checkStudentAccountAccess } = require("../middleware/checkStudentAccountAccess");

const STAFF_ROLES = ["admin", "accountant", "librarian"];
const TEACH_OR_STAFF = [...STAFF_ROLES, "teacher"];
const WITH_STUDENT = [...TEACH_OR_STAFF, "student"];

router.get("/", authenticateUser, checkStudentAccountAccess, authorizeRoles(WITH_STUDENT), listExamSessionLogs);
router.post("/", authenticateUser, checkStudentAccountAccess, authorizeRoles(WITH_STUDENT), createExamSessionLog);
router.delete("/:id", authenticateUser, checkStudentAccountAccess, authorizeRoles(STAFF_ROLES), deleteExamSessionLog);

router.use(errorHandler);

module.exports = router;
