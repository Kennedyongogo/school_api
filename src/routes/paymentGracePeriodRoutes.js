const express = require("express");
const router = express.Router();
const {
  listPaymentGracePeriods,
  getPaymentGracePeriod,
  createPaymentGracePeriod,
  updatePaymentGracePeriod,
  deletePaymentGracePeriod,
} = require("../controllers/paymentGracePeriodController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const { errorHandler } = require("../middleware/errorHandler");

const STAFF_ROLES = ["admin", "accountant", "librarian"];
const TEACH_OR_STAFF = [...STAFF_ROLES, "teacher"];

router.get("/", authenticateUser, authorizeRoles(TEACH_OR_STAFF), listPaymentGracePeriods);
router.post("/", authenticateUser, authorizeRoles(STAFF_ROLES), createPaymentGracePeriod);
router.get("/:id", authenticateUser, authorizeRoles(TEACH_OR_STAFF), getPaymentGracePeriod);
router.put("/:id", authenticateUser, authorizeRoles(STAFF_ROLES), updatePaymentGracePeriod);
router.delete("/:id", authenticateUser, authorizeRoles(STAFF_ROLES), deletePaymentGracePeriod);

router.use(errorHandler);

module.exports = router;
