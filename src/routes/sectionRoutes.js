const express = require("express");
const router = express.Router();
const {
  listSections,
  getSection,
  createSection,
  updateSection,
  deleteSection,
} = require("../controllers/sectionController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const { errorHandler } = require("../middleware/errorHandler");

const { STAFF_ROLES, ADMIN_PORTAL_API_ROLES} = require("../constants/userRoles");
const TEACH_OR_STAFF = [...STAFF_ROLES, "teacher"];

router.get("/", authenticateUser, authorizeRoles(TEACH_OR_STAFF), listSections);
router.post("/", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), createSection);
router.get("/:id", authenticateUser, authorizeRoles(TEACH_OR_STAFF), getSection);
router.put("/:id", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), updateSection);
router.delete("/:id", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), deleteSection);

router.use(errorHandler);

module.exports = router;
