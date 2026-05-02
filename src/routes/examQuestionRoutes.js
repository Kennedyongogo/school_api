const express = require("express");
const router = express.Router();
const {
  listExamQuestions,
  getExamQuestion,
  createExamQuestion,
  updateExamQuestion,
  deleteExamQuestion,
} = require("../controllers/examQuestionController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const { errorHandler } = require("../middleware/errorHandler");

const STAFF_ROLES = ["admin", "accountant", "librarian"];
const TEACH_OR_STAFF = [...STAFF_ROLES, "teacher"];

router.get("/", authenticateUser, authorizeRoles(TEACH_OR_STAFF), listExamQuestions);
router.post("/", authenticateUser, authorizeRoles(STAFF_ROLES), createExamQuestion);
router.get("/:id", authenticateUser, authorizeRoles(TEACH_OR_STAFF), getExamQuestion);
router.put("/:id", authenticateUser, authorizeRoles(STAFF_ROLES), updateExamQuestion);
router.delete("/:id", authenticateUser, authorizeRoles(STAFF_ROLES), deleteExamQuestion);

router.use(errorHandler);

module.exports = router;
