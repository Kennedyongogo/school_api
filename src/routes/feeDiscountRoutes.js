const express = require("express");
const router = express.Router();
const {
  listFeeDiscounts,
  getFeeDiscount,
  createFeeDiscount,
  updateFeeDiscount,
  deleteFeeDiscount,
} = require("../controllers/feeDiscountController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const { errorHandler } = require("../middleware/errorHandler");

const { STAFF_ROLES, ADMIN_PORTAL_API_ROLES} = require("../constants/userRoles");
const TEACH_OR_STAFF = [...STAFF_ROLES, "teacher"];

router.get("/", authenticateUser, authorizeRoles(TEACH_OR_STAFF), listFeeDiscounts);
router.post("/", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), createFeeDiscount);
router.get("/:id", authenticateUser, authorizeRoles(TEACH_OR_STAFF), getFeeDiscount);
router.put("/:id", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), updateFeeDiscount);
router.delete("/:id", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), deleteFeeDiscount);

router.use(errorHandler);

module.exports = router;
