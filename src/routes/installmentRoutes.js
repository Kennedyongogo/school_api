const express = require("express");
const router = express.Router();
const {
  listInstallments,
  getInstallment,
  createInstallment,
  updateInstallment,
  deleteInstallment,
} = require("../controllers/installmentController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const { errorHandler } = require("../middleware/errorHandler");

const { STAFF_ROLES, ADMIN_PORTAL_API_ROLES} = require("../constants/userRoles");
const TEACH_OR_STAFF = [...STAFF_ROLES, "teacher"];

router.get("/", authenticateUser, authorizeRoles(TEACH_OR_STAFF), listInstallments);
router.post("/", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), createInstallment);
router.get("/:id", authenticateUser, authorizeRoles(TEACH_OR_STAFF), getInstallment);
router.put("/:id", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), updateInstallment);
router.delete("/:id", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), deleteInstallment);

router.use(errorHandler);

module.exports = router;
