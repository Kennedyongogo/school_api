const express = require("express");
const router = express.Router();
const {
  postRecalculateSubjectAverage,
  postRecalculateOverallAverage,
  postRecalculateClassPositions,
  postRecalculateGradePositions,
  postRecalculateSubjectRanksSection,
  postRecalculateSubjectRanksGrade,
  postGenerateReportCard,
  getReportCard,
  listReportCardsForStudent,
  getMyGradingSummary,
} = require("../controllers/gradingWorkflowController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const { errorHandler } = require("../middleware/errorHandler");
const { checkStudentAccountAccess } = require("../middleware/checkStudentAccountAccess");

const { STAFF_ROLES } = require("../constants/userRoles");
const TEACH_OR_STAFF = [...STAFF_ROLES, "teacher"];

router.get(
  "/me/summary",
  authenticateUser,
  checkStudentAccountAccess,
  authorizeRoles(["student"]),
  getMyGradingSummary
);

router.post(
  "/recalculate/subject-average",
  authenticateUser,
  checkStudentAccountAccess,
  authorizeRoles(TEACH_OR_STAFF),
  postRecalculateSubjectAverage
);
router.post(
  "/recalculate/overall-average",
  authenticateUser,
  checkStudentAccountAccess,
  authorizeRoles(TEACH_OR_STAFF),
  postRecalculateOverallAverage
);
router.post(
  "/recalculate/class-positions",
  authenticateUser,
  checkStudentAccountAccess,
  authorizeRoles(TEACH_OR_STAFF),
  postRecalculateClassPositions
);
router.post(
  "/recalculate/grade-positions",
  authenticateUser,
  checkStudentAccountAccess,
  authorizeRoles(TEACH_OR_STAFF),
  postRecalculateGradePositions
);
router.post(
  "/recalculate/subject-ranks/section",
  authenticateUser,
  checkStudentAccountAccess,
  authorizeRoles(TEACH_OR_STAFF),
  postRecalculateSubjectRanksSection
);
router.post(
  "/recalculate/subject-ranks/grade",
  authenticateUser,
  checkStudentAccountAccess,
  authorizeRoles(TEACH_OR_STAFF),
  postRecalculateSubjectRanksGrade
);

router.post(
  "/report-cards/generate",
  authenticateUser,
  checkStudentAccountAccess,
  authorizeRoles(TEACH_OR_STAFF),
  postGenerateReportCard
);
router.get(
  "/report-cards/student/:student_id",
  authenticateUser,
  checkStudentAccountAccess,
  authorizeRoles(TEACH_OR_STAFF),
  listReportCardsForStudent
);
router.get(
  "/report-cards/:id",
  authenticateUser,
  checkStudentAccountAccess,
  authorizeRoles(TEACH_OR_STAFF),
  getReportCard
);

router.use(errorHandler);

module.exports = router;
