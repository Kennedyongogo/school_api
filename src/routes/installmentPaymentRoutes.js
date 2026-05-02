const express = require("express");
const router = express.Router();
const {
  listInstallmentPayments,
  getInstallmentPayment,
  createInstallmentPayment,
  updateInstallmentPayment,
  deleteInstallmentPayment,
} = require("../controllers/installmentPaymentController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const { errorHandler } = require("../middleware/errorHandler");

const STAFF_ROLES = ["admin", "accountant", "librarian"];
const TEACH_OR_STAFF = [...STAFF_ROLES, "teacher"];

router.get("/", authenticateUser, authorizeRoles(TEACH_OR_STAFF), listInstallmentPayments);
router.post("/", authenticateUser, authorizeRoles(TEACH_OR_STAFF), createInstallmentPayment);
router.get("/:id", authenticateUser, authorizeRoles(TEACH_OR_STAFF), getInstallmentPayment);
router.put("/:id", authenticateUser, authorizeRoles(TEACH_OR_STAFF), updateInstallmentPayment);
router.delete("/:id", authenticateUser, authorizeRoles(STAFF_ROLES), deleteInstallmentPayment);

router.use(errorHandler);

module.exports = router;
