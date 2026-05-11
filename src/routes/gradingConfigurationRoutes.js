const express = require("express");
const router = express.Router();
const {
  listGradingAssignments,
  createGradingAssignment,
  updateGradingAssignment,
  deleteGradingAssignment,
  listAssessmentComponents,
  createAssessmentComponent,
  updateAssessmentComponent,
  deleteAssessmentComponent,
  resolveGradingConfiguration,
} = require("../controllers/gradingConfigurationController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const { errorHandler } = require("../middleware/errorHandler");

const { STAFF_ROLES, ADMIN_PORTAL_API_ROLES } = require("../constants/userRoles");
const TEACH_OR_STAFF = [...STAFF_ROLES, "teacher"];

router.get("/assignments", authenticateUser, authorizeRoles(TEACH_OR_STAFF), listGradingAssignments);
router.post("/assignments", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), createGradingAssignment);
router.put("/assignments/:id", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), updateGradingAssignment);
router.delete("/assignments/:id", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), deleteGradingAssignment);

router.get("/components", authenticateUser, authorizeRoles(TEACH_OR_STAFF), listAssessmentComponents);
router.post("/components", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), createAssessmentComponent);
router.put("/components/:id", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), updateAssessmentComponent);
router.delete("/components/:id", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), deleteAssessmentComponent);

router.get("/resolve", authenticateUser, authorizeRoles(TEACH_OR_STAFF), resolveGradingConfiguration);

router.use(errorHandler);

module.exports = router;
