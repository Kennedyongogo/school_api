const express = require("express");
const router = express.Router();
const {
  listExams,
  getExam,
  createExam,
  updateExam,
  deleteExam,
  duplicateExam,
  generateDiagramImage,
  generateQuestionsFromDocument,
  extractQuestionsWithAi,
  createExamSubmission,
  getMyExamSubmission,
  saveSubmissionAnswers,
  submitExamSubmission,
  listExamSubmissionsForMarking,
  markExamSubmission,
  markExamAnswer,
  cleanupExamStaleDraftSubmissions,
} = require("../controllers/examController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const { errorHandler } = require("../middleware/errorHandler");
const { uploadDocument, handleUploadError } = require("../middleware/upload");

const { STAFF_ROLES, ADMIN_PORTAL_API_ROLES, SCHOOL_ADMIN_ROLES } = require("../constants/userRoles");
const TEACH_OR_STAFF = [...STAFF_ROLES, "teacher"];

router.get("/", authenticateUser, authorizeRoles(TEACH_OR_STAFF), listExams);
router.post("/", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), createExam);
router.post("/ai/diagram", authenticateUser, authorizeRoles(TEACH_OR_STAFF), generateDiagramImage);
router.post(
  "/ocr/extract-questions-from-document",
  authenticateUser,
  authorizeRoles(TEACH_OR_STAFF),
  uploadDocument,
  handleUploadError,
  generateQuestionsFromDocument
);
router.post(
  "/ai/generate-questions-from-document",
  authenticateUser,
  authorizeRoles(TEACH_OR_STAFF),
  uploadDocument,
  handleUploadError,
  generateQuestionsFromDocument
);
router.post("/ai/extract-questions", authenticateUser, authorizeRoles(TEACH_OR_STAFF), extractQuestionsWithAi);
router.get("/:id", authenticateUser, authorizeRoles(TEACH_OR_STAFF), getExam);
router.put("/:id", authenticateUser, authorizeRoles(SCHOOL_ADMIN_ROLES), updateExam);
router.delete("/:id", authenticateUser, authorizeRoles(SCHOOL_ADMIN_ROLES), deleteExam);
router.post("/:id/duplicate", authenticateUser, authorizeRoles(SCHOOL_ADMIN_ROLES), duplicateExam);
router.post("/:id/submissions", authenticateUser, authorizeRoles(["student"]), createExamSubmission);
router.get("/:id/submissions/me", authenticateUser, authorizeRoles(["student"]), getMyExamSubmission);
router.get("/:id/submissions", authenticateUser, authorizeRoles(TEACH_OR_STAFF), listExamSubmissionsForMarking);
router.put("/:id/submissions/:submissionId/mark", authenticateUser, authorizeRoles(TEACH_OR_STAFF), markExamSubmission);
router.put("/:id/submissions/:submissionId/answers/:answerId/mark", authenticateUser, authorizeRoles(TEACH_OR_STAFF), markExamAnswer);
router.post("/:id/submissions/cleanup-stale-drafts", authenticateUser, authorizeRoles(SCHOOL_ADMIN_ROLES), cleanupExamStaleDraftSubmissions);
router.put("/submissions/:submissionId/answers", authenticateUser, authorizeRoles(["student"]), saveSubmissionAnswers);
router.put("/submissions/:submissionId/submit", authenticateUser, authorizeRoles(["student"]), submitExamSubmission);

router.use(errorHandler);

module.exports = router;
