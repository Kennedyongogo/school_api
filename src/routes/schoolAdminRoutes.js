const express = require("express");
const router = express.Router();
const {
  listSchoolAdmins,
  getSchoolAdmin,
  createSchoolAdmin,
  updateSchoolAdmin,
  deleteSchoolAdmin,
} = require("../controllers/schoolAdminController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const { errorHandler } = require("../middleware/errorHandler");
const { STAFF_ROLES, ADMIN_PORTAL_API_ROLES, SCHOOL_ADMIN_ROLES } = require("../constants/userRoles");

router.get("/", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), listSchoolAdmins);
router.post("/", authenticateUser, authorizeRoles(SCHOOL_ADMIN_ROLES), createSchoolAdmin);
router.get("/:id", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), getSchoolAdmin);
router.put("/:id", authenticateUser, authorizeRoles(SCHOOL_ADMIN_ROLES), updateSchoolAdmin);
router.delete("/:id", authenticateUser, authorizeRoles(SCHOOL_ADMIN_ROLES), deleteSchoolAdmin);

router.use(errorHandler);

module.exports = router;
