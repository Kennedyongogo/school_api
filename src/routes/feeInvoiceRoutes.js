const express = require("express");
const router = express.Router();
const {
<<<<<<< HEAD
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
=======
  listFeeInvoices,
  generateFeeInvoice,
  getFeeInvoice,
  postFeePayment,
  listMyParentInvoices,
  getMyParentInvoice,
  postMyParentPayment,
  getInvoiceTemplate,
} = require("../controllers/feeInvoiceController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const { errorHandler } = require("../middleware/errorHandler");
const { ADMIN_PORTAL_API_ROLES } = require("../constants/userRoles");

router.get("/template", authenticateUser, getInvoiceTemplate);
router.get("/me", authenticateUser, authorizeRoles(["parent"]), listMyParentInvoices);
router.get("/me/:id", authenticateUser, authorizeRoles(["parent"]), getMyParentInvoice);
router.post("/me/:id/payments", authenticateUser, authorizeRoles(["parent"]), postMyParentPayment);

router.get("/", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), listFeeInvoices);
router.post("/generate", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), generateFeeInvoice);
router.get("/:id", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), getFeeInvoice);
router.post("/:id/payments", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), postFeePayment);

router.use(errorHandler);
>>>>>>> dbf38d6042c6ec91a0dd55101879df2f1e151a96

module.exports = router;
