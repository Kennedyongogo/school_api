const express = require("express");
const router = express.Router();
const {
  listAssignments,
  getAssignment,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  publishAssignment,
  listAssignmentSubmissionsForMarking,
  createAssignmentSubmission,
  getMyAssignmentSubmission,
  saveSubmissionAnswers,
  submitAssignmentSubmission,
  markAssignmentAnswer,
  markAssignmentSubmission,
  markPdfManualAnswer,
  publishAssignmentMarks,
  listMyStudentAssignments,
  getMyStudentAssignmentFeedback,
  uploadSubmissionAnswerFile,
} = require("../controllers/assignmentController");
const {
  saveSubmissionPdfAnswers,
  uploadSubmissionPdfWorkingPaper,
  deleteSubmissionPdfWorkingPaper,
  uploadSubmissionPdfWorkingPaperMarkedReturn,
  deleteSubmissionPdfWorkingPaperMarkedReturn,
  updateSubmissionPdfWorkingPaperMarking,
  uploadAssignmentPdfTemplate,
  getAssignmentPdfTemplate,
} = require("../controllers/assignmentPdfController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const { errorHandler } = require("../middleware/errorHandler");
const {
  uploadAssignmentAnswerFile,
  uploadAssignmentPdfTemplate: uploadAssignmentPdfTemplateMw,
  uploadAssignmentPdfWorkingPaper,
  uploadAssignmentPdfMarkedReturn,
  handleUploadError,
} = require("../middleware/upload");
const { STAFF_ROLES } = require("../constants/userRoles");

const TEACH_OR_STAFF = [...STAFF_ROLES, "teacher"];

router.get("/", authenticateUser, authorizeRoles(TEACH_OR_STAFF), listAssignments);
router.post("/", authenticateUser, authorizeRoles(TEACH_OR_STAFF), createAssignment);
router.get("/student/my", authenticateUser, authorizeRoles(["student"]), listMyStudentAssignments);
router.get("/student/:assignmentId/feedback", authenticateUser, authorizeRoles(["student"]), getMyStudentAssignmentFeedback);

router.get("/:id", authenticateUser, authorizeRoles(TEACH_OR_STAFF), getAssignment);
router.put("/:id", authenticateUser, authorizeRoles(TEACH_OR_STAFF), updateAssignment);
router.delete("/:id", authenticateUser, authorizeRoles(TEACH_OR_STAFF), deleteAssignment);
router.post("/:id/publish", authenticateUser, authorizeRoles(TEACH_OR_STAFF), publishAssignment);

router.post(
  "/:id/pdf-template",
  authenticateUser,
  authorizeRoles(TEACH_OR_STAFF),
  uploadAssignmentPdfTemplateMw,
  handleUploadError,
  uploadAssignmentPdfTemplate
);
router.get("/:id/pdf-template", authenticateUser, getAssignmentPdfTemplate);

router.get("/:id/submissions", authenticateUser, authorizeRoles(TEACH_OR_STAFF), listAssignmentSubmissionsForMarking);
router.put("/:id/submissions/:submissionId/mark", authenticateUser, authorizeRoles(TEACH_OR_STAFF), markAssignmentSubmission);
router.put("/:id/submissions/:submissionId/answers/:answerId/mark", authenticateUser, authorizeRoles(TEACH_OR_STAFF), markAssignmentAnswer);
router.put("/:id/submissions/:submissionId/pdf-answers/:entryId/mark", authenticateUser, authorizeRoles(TEACH_OR_STAFF), markPdfManualAnswer);
router.post("/:id/submissions/:submissionId/publish-marks", authenticateUser, authorizeRoles(TEACH_OR_STAFF), publishAssignmentMarks);
router.post(
  "/:id/submissions/:submissionId/pdf-working-papers/:fileId/marked-return",
  authenticateUser,
  authorizeRoles(TEACH_OR_STAFF),
  uploadAssignmentPdfMarkedReturn,
  handleUploadError,
  uploadSubmissionPdfWorkingPaperMarkedReturn
);
router.delete(
  "/:id/submissions/:submissionId/pdf-working-papers/:fileId/marked-return",
  authenticateUser,
  authorizeRoles(TEACH_OR_STAFF),
  deleteSubmissionPdfWorkingPaperMarkedReturn
);
router.put(
  "/:id/submissions/:submissionId/pdf-working-papers/:fileId/marking",
  authenticateUser,
  authorizeRoles(TEACH_OR_STAFF),
  updateSubmissionPdfWorkingPaperMarking
);

router.post("/:id/submissions", authenticateUser, authorizeRoles(["student"]), createAssignmentSubmission);
router.get("/:id/submissions/me", authenticateUser, authorizeRoles(["student"]), getMyAssignmentSubmission);

router.put("/submissions/:submissionId/answers", authenticateUser, authorizeRoles(["student"]), saveSubmissionAnswers);
router.put("/submissions/:submissionId/submit", authenticateUser, authorizeRoles(["student"]), submitAssignmentSubmission);
router.put("/submissions/:submissionId/pdf-answers", authenticateUser, authorizeRoles(["student"]), saveSubmissionPdfAnswers);
router.post(
  "/submissions/:submissionId/pdf-working-papers",
  authenticateUser,
  authorizeRoles(["student"]),
  uploadAssignmentPdfWorkingPaper,
  handleUploadError,
  uploadSubmissionPdfWorkingPaper
);
router.delete(
  "/submissions/:submissionId/pdf-working-papers/:fileId",
  authenticateUser,
  authorizeRoles(["student"]),
  deleteSubmissionPdfWorkingPaper
);
router.post(
  "/submissions/:submissionId/answers/:questionId/upload",
  authenticateUser,
  authorizeRoles(["student"]),
  uploadAssignmentAnswerFile,
  handleUploadError,
  uploadSubmissionAnswerFile
);

router.use(errorHandler);

module.exports = router;
