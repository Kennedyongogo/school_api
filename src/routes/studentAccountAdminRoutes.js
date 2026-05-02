const express = require("express");
const router = express.Router();
const {
  manualDeactivate,
  manualReactivate,
  triggerOverdueJob,
} = require("../controllers/studentAccountAdminController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const { errorHandler } = require("../middleware/errorHandler");

const STAFF_ROLES = ["admin", "accountant", "librarian"];

router.post("/deactivate", authenticateUser, authorizeRoles(STAFF_ROLES), manualDeactivate);
router.post("/reactivate", authenticateUser, authorizeRoles(STAFF_ROLES), manualReactivate);
router.post("/run-overdue-job", authenticateUser, authorizeRoles(STAFF_ROLES), triggerOverdueJob);

router.use(errorHandler);

module.exports = router;
