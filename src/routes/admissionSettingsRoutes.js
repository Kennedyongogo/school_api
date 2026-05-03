const express = require("express");
const router = express.Router();
const {
  listPublicOpen,
  listSettings,
  getSettings,
  createSettings,
  updateSettings,
  deleteSettings,
} = require("../controllers/admissionSettingsController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const { errorHandler } = require("../middleware/errorHandler");

const { STAFF_ROLES, ADMIN_PORTAL_API_ROLES} = require("../constants/userRoles");
const TEACH_OR_STAFF = [...STAFF_ROLES, "teacher"];

router.get("/public/open", listPublicOpen);

router.get("/", authenticateUser, authorizeRoles(TEACH_OR_STAFF), listSettings);
router.post("/", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), createSettings);
router.get("/:id", authenticateUser, authorizeRoles(TEACH_OR_STAFF), getSettings);
router.put("/:id", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), updateSettings);
router.delete("/:id", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), deleteSettings);

router.use(errorHandler);

module.exports = router;
