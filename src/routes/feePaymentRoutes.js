const express = require("express");
const router = express.Router();
<<<<<<< HEAD
const { listPayments, getPayment } = require("../controllers/feeInvoiceController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const { STAFF_ROLES } = require("../constants/userRoles");

router.get("/", authenticateUser, authorizeRoles(STAFF_ROLES), listPayments);
router.get("/:id", authenticateUser, authorizeRoles(STAFF_ROLES), getPayment);
=======
const { listFeePayments, getFeePayment } = require("../controllers/feePaymentController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const { errorHandler } = require("../middleware/errorHandler");
const { ADMIN_PORTAL_API_ROLES } = require("../constants/userRoles");

router.get("/", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), listFeePayments);
router.get("/:id", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), getFeePayment);

router.use(errorHandler);
>>>>>>> dbf38d6042c6ec91a0dd55101879df2f1e151a96

module.exports = router;
