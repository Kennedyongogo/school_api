const express = require("express");
const router = express.Router();
const {
  manualDeactivate,
  manualReactivate,
  triggerOverdueJob,
} = require("../controllers/studentAccountAdminController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const { errorHandler } = require("../middleware/errorHandler");

const { STAFF_ROLES, ADMIN_PORTAL_API_ROLES} = require("../constants/userRoles");

router.post("/deactivate", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), manualDeactivate);
router.post("/reactivate", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), manualReactivate);
router.post("/run-overdue-job", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), triggerOverdueJob);

router.use(errorHandler);

module.exports = router;
