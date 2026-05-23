const express = require("express");
const router = express.Router();
const { listFeePayments, getFeePayment } = require("../controllers/feePaymentController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const { errorHandler } = require("../middleware/errorHandler");
const { ADMIN_PORTAL_API_ROLES } = require("../constants/userRoles");

router.get("/", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), listFeePayments);
router.get("/:id", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), getFeePayment);

router.use(errorHandler);

module.exports = router;
