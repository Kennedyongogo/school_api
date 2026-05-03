const express = require("express");
const router = express.Router();
const {
  listParents,
  getParent,
  getMyParentProfile,
  getMyStudentsFeeOverview,
  createParent,
  updateParent,
  deleteParent,
} = require("../controllers/parentController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const { errorHandler } = require("../middleware/errorHandler");

const { STAFF_ROLES, ADMIN_PORTAL_API_ROLES, SCHOOL_ADMIN_ROLES } = require("../constants/userRoles");

router.get("/me", authenticateUser, authorizeRoles(["parent"]), getMyParentProfile);
router.get(
  "/me/students-fee-overview",
  authenticateUser,
  authorizeRoles(["parent"]),
  getMyStudentsFeeOverview
);
router.get("/", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), listParents);
router.post("/", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), createParent);
router.get("/:id", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), getParent);
router.put("/:id", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), updateParent);
router.delete("/:id", authenticateUser, authorizeRoles(SCHOOL_ADMIN_ROLES), deleteParent);

router.use(errorHandler);

module.exports = router;
