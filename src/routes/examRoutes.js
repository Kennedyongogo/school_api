const express = require("express");
const router = express.Router();
const {
  listExams,
  getExam,
  createExam,
  updateExam,
  deleteExam,
  createExamSubmission,
  getMyExamSubmission,
  saveSubmissionAnswers,
  submitExamSubmission,
} = require("../controllers/examController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const { errorHandler } = require("../middleware/errorHandler");

const { STAFF_ROLES, ADMIN_PORTAL_API_ROLES, SCHOOL_ADMIN_ROLES } = require("../constants/userRoles");
const TEACH_OR_STAFF = [...STAFF_ROLES, "teacher"];

router.get("/", authenticateUser, authorizeRoles(TEACH_OR_STAFF), listExams);
router.post("/", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), createExam);
router.get("/:id", authenticateUser, authorizeRoles(TEACH_OR_STAFF), getExam);
router.put("/:id", authenticateUser, authorizeRoles(SCHOOL_ADMIN_ROLES), updateExam);
router.delete("/:id", authenticateUser, authorizeRoles(SCHOOL_ADMIN_ROLES), deleteExam);
router.post("/:id/submissions", authenticateUser, authorizeRoles(["student"]), createExamSubmission);
router.get("/:id/submissions/me", authenticateUser, authorizeRoles(["student"]), getMyExamSubmission);
router.put("/submissions/:submissionId/answers", authenticateUser, authorizeRoles(["student"]), saveSubmissionAnswers);
router.put("/submissions/:submissionId/submit", authenticateUser, authorizeRoles(["student"]), submitExamSubmission);

router.use(errorHandler);

module.exports = router;
