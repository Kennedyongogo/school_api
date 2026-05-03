const express = require("express");
const router = express.Router();
const {
  generateInstallments,
  listStudentInstallmentPlans,
  getStudentInstallmentPlan,
  createStudentInstallmentPlan,
  updateStudentInstallmentPlan,
  deleteStudentInstallmentPlan,
} = require("../controllers/studentInstallmentPlanController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const { errorHandler } = require("../middleware/errorHandler");

const { STAFF_ROLES, ADMIN_PORTAL_API_ROLES} = require("../constants/userRoles");
const TEACH_OR_STAFF = [...STAFF_ROLES, "teacher"];

router.post("/generate", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), generateInstallments);

router.get("/", authenticateUser, authorizeRoles(TEACH_OR_STAFF), listStudentInstallmentPlans);
router.post("/", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), createStudentInstallmentPlan);
router.get("/:id", authenticateUser, authorizeRoles(TEACH_OR_STAFF), getStudentInstallmentPlan);
router.put("/:id", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), updateStudentInstallmentPlan);
router.delete("/:id", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), deleteStudentInstallmentPlan);

router.use(errorHandler);

module.exports = router;
