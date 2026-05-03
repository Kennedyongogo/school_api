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

const { STAFF_ROLES, ADMIN_PORTAL_API_ROLES} = require("../constants/userRoles");
const TEACH_OR_STAFF = [...STAFF_ROLES, "teacher"];

router.get("/", authenticateUser, authorizeRoles(TEACH_OR_STAFF), listGradeLevels);
router.post("/", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), createGradeLevel);
router.get("/:id", authenticateUser, authorizeRoles(TEACH_OR_STAFF), getGradeLevel);
router.put("/:id", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), updateGradeLevel);
router.delete("/:id", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), deleteGradeLevel);

router.use(errorHandler);

module.exports = router;
