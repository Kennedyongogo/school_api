const express = require("express");
const router = express.Router();
const {
  listInvoices,
  listMyInvoices,
  generateInvoice,
  cancelInvoice,
  recordInvoicePayment,
  recordMyInvoicePayment,
} = require("../controllers/feeInvoiceController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const { STAFF_ROLES } = require("../constants/userRoles");

router.get("/me", authenticateUser, authorizeRoles(["parent"]), listMyInvoices);
router.post("/me/:id/payments", authenticateUser, authorizeRoles(["parent"]), recordMyInvoicePayment);
router.post("/generate", authenticateUser, authorizeRoles(STAFF_ROLES), generateInvoice);
router.get("/", authenticateUser, authorizeRoles(STAFF_ROLES), listInvoices);
router.post("/:id/cancel", authenticateUser, authorizeRoles(STAFF_ROLES), cancelInvoice);
router.post("/:id/payments", authenticateUser, authorizeRoles(STAFF_ROLES), recordInvoicePayment);

module.exports = router;
