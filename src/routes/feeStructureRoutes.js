const express = require("express");
const router = express.Router();
const {
  listFeeStructures,
  getFeeStructure,
  createFeeStructure,
  updateFeeStructure,
  deleteFeeStructure,
} = require("../controllers/feeStructureController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const { errorHandler } = require("../middleware/errorHandler");

const STAFF_ROLES = ["admin", "accountant", "librarian"];
const TEACH_OR_STAFF = [...STAFF_ROLES, "teacher"];

router.get("/", authenticateUser, authorizeRoles(TEACH_OR_STAFF), listFeeStructures);
router.post("/", authenticateUser, authorizeRoles(STAFF_ROLES), createFeeStructure);
router.get("/:id", authenticateUser, authorizeRoles(TEACH_OR_STAFF), getFeeStructure);
router.put("/:id", authenticateUser, authorizeRoles(STAFF_ROLES), updateFeeStructure);
router.delete("/:id", authenticateUser, authorizeRoles(STAFF_ROLES), deleteFeeStructure);

router.use(errorHandler);

module.exports = router;
