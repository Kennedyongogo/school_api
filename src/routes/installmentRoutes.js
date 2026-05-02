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

const STAFF_ROLES = ["admin", "accountant", "librarian"];
const TEACH_OR_STAFF = [...STAFF_ROLES, "teacher"];

router.get("/", authenticateUser, authorizeRoles(TEACH_OR_STAFF), listInstallments);
router.post("/", authenticateUser, authorizeRoles(STAFF_ROLES), createInstallment);
router.get("/:id", authenticateUser, authorizeRoles(TEACH_OR_STAFF), getInstallment);
router.put("/:id", authenticateUser, authorizeRoles(STAFF_ROLES), updateInstallment);
router.delete("/:id", authenticateUser, authorizeRoles(STAFF_ROLES), deleteInstallment);

router.use(errorHandler);

module.exports = router;
