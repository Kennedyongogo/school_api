const express = require("express");
const router = express.Router();
const {
  getPublicSchoolInfo,
  getFullSchoolSettings,
  updateSchoolProfile,
} = require("../controllers/schoolProfileController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const { errorHandler } = require("../middleware/errorHandler");

const STAFF_ROLES = ["admin", "accountant", "librarian"];

router.get("/", getPublicSchoolInfo);
router.get("/admin", authenticateUser, authorizeRoles(STAFF_ROLES), getFullSchoolSettings);
router.put("/", authenticateUser, authorizeRoles(STAFF_ROLES), updateSchoolProfile);

router.use(errorHandler);

module.exports = router;
