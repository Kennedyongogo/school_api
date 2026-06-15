const express = require("express");
const router = express.Router();
const { listPayments, getPayment } = require("../controllers/feeInvoiceController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const { STAFF_ROLES } = require("../constants/userRoles");

router.get("/", authenticateUser, authorizeRoles(STAFF_ROLES), listPayments);
router.get("/:id", authenticateUser, authorizeRoles(STAFF_ROLES), getPayment);

module.exports = router;
