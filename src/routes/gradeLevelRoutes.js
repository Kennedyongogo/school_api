const express = require("express");
const router = express.Router();
const {
  listGradeLevels,
  getGradeLevel,
  createGradeLevel,
  updateGradeLevel,
  deleteGradeLevel,
} = require("../controllers/gradeLevelController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const { errorHandler } = require("../middleware/errorHandler");

const STAFF_ROLES = ["admin", "accountant", "librarian"];
const TEACH_OR_STAFF = [...STAFF_ROLES, "teacher"];

router.get("/", authenticateUser, authorizeRoles(TEACH_OR_STAFF), listGradeLevels);
router.post("/", authenticateUser, authorizeRoles(STAFF_ROLES), createGradeLevel);
router.get("/:id", authenticateUser, authorizeRoles(TEACH_OR_STAFF), getGradeLevel);
router.put("/:id", authenticateUser, authorizeRoles(STAFF_ROLES), updateGradeLevel);
router.delete("/:id", authenticateUser, authorizeRoles(STAFF_ROLES), deleteGradeLevel);

router.use(errorHandler);

module.exports = router;
