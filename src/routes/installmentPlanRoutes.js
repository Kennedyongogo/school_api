const express = require("express");
const router = express.Router();
const {
  listInstallmentPlans,
  getInstallmentPlan,
  createInstallmentPlan,
  updateInstallmentPlan,
  deleteInstallmentPlan,
} = require("../controllers/installmentPlanController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const { errorHandler } = require("../middleware/errorHandler");

const STAFF_ROLES = ["admin", "accountant", "librarian"];
const TEACH_OR_STAFF = [...STAFF_ROLES, "teacher"];

router.get("/", authenticateUser, authorizeRoles(TEACH_OR_STAFF), listInstallmentPlans);
router.post("/", authenticateUser, authorizeRoles(STAFF_ROLES), createInstallmentPlan);
router.get("/:id", authenticateUser, authorizeRoles(TEACH_OR_STAFF), getInstallmentPlan);
router.put("/:id", authenticateUser, authorizeRoles(STAFF_ROLES), updateInstallmentPlan);
router.delete("/:id", authenticateUser, authorizeRoles(STAFF_ROLES), deleteInstallmentPlan);

router.use(errorHandler);

module.exports = router;
