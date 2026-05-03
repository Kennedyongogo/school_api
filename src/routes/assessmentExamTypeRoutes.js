const express = require("express");
const router = express.Router();
const {
  listAssessmentExamTypes,
  getAssessmentExamType,
  createAssessmentExamType,
  updateAssessmentExamType,
  deleteAssessmentExamType,
} = require("../controllers/assessmentExamTypeController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const { errorHandler } = require("../middleware/errorHandler");

const { STAFF_ROLES, ADMIN_PORTAL_API_ROLES} = require("../constants/userRoles");
const TEACH_OR_STAFF = [...STAFF_ROLES, "teacher"];

router.get("/", authenticateUser, authorizeRoles(TEACH_OR_STAFF), listAssessmentExamTypes);
router.post("/", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), createAssessmentExamType);
router.get("/:id", authenticateUser, authorizeRoles(TEACH_OR_STAFF), getAssessmentExamType);
router.put("/:id", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), updateAssessmentExamType);
router.delete("/:id", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), deleteAssessmentExamType);

router.use(errorHandler);

module.exports = router;
