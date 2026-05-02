const express = require("express");
const router = express.Router();
const {
  listPaymentReminders,
  getPaymentReminder,
  createPaymentReminder,
  updatePaymentReminder,
  deletePaymentReminder,
} = require("../controllers/paymentReminderController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const { errorHandler } = require("../middleware/errorHandler");

const STAFF_ROLES = ["admin", "accountant", "librarian"];
const TEACH_OR_STAFF = [...STAFF_ROLES, "teacher"];

router.get("/", authenticateUser, authorizeRoles(TEACH_OR_STAFF), listPaymentReminders);
router.post("/", authenticateUser, authorizeRoles(TEACH_OR_STAFF), createPaymentReminder);
router.get("/:id", authenticateUser, authorizeRoles(TEACH_OR_STAFF), getPaymentReminder);
router.put("/:id", authenticateUser, authorizeRoles(TEACH_OR_STAFF), updatePaymentReminder);
router.delete("/:id", authenticateUser, authorizeRoles(STAFF_ROLES), deletePaymentReminder);

router.use(errorHandler);

module.exports = router;
