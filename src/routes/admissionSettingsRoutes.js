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

const STAFF_ROLES = ["admin", "accountant", "librarian"];
const TEACH_OR_STAFF = [...STAFF_ROLES, "teacher"];

router.get("/public/open", listPublicOpen);

router.get("/", authenticateUser, authorizeRoles(TEACH_OR_STAFF), listSettings);
router.post("/", authenticateUser, authorizeRoles(STAFF_ROLES), createSettings);
router.get("/:id", authenticateUser, authorizeRoles(TEACH_OR_STAFF), getSettings);
router.put("/:id", authenticateUser, authorizeRoles(STAFF_ROLES), updateSettings);
router.delete("/:id", authenticateUser, authorizeRoles(STAFF_ROLES), deleteSettings);

router.use(errorHandler);

module.exports = router;
