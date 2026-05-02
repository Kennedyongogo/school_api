const express = require("express");
const router = express.Router();
const {
  listGradingScales,
  getGradingScale,
  createGradingScale,
  updateGradingScale,
  deleteGradingScale,
} = require("../controllers/gradingScaleController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const { errorHandler } = require("../middleware/errorHandler");

const STAFF_ROLES = ["admin", "accountant", "librarian"];
const TEACH_OR_STAFF = [...STAFF_ROLES, "teacher"];

router.get("/", authenticateUser, authorizeRoles(TEACH_OR_STAFF), listGradingScales);
router.post("/", authenticateUser, authorizeRoles(STAFF_ROLES), createGradingScale);
router.get("/:id", authenticateUser, authorizeRoles(TEACH_OR_STAFF), getGradingScale);
router.put("/:id", authenticateUser, authorizeRoles(STAFF_ROLES), updateGradingScale);
router.delete("/:id", authenticateUser, authorizeRoles(STAFF_ROLES), deleteGradingScale);

router.use(errorHandler);

module.exports = router;
