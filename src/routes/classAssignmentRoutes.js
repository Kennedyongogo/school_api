const express = require("express");
const router = express.Router();
const {
  listClassAssignments,
  getClassAssignment,
  createClassAssignment,
  updateClassAssignment,
  deleteClassAssignment,
} = require("../controllers/classAssignmentController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const { errorHandler } = require("../middleware/errorHandler");

const { STAFF_ROLES, ADMIN_PORTAL_API_ROLES} = require("../constants/userRoles");
const TEACH_OR_STAFF = [...STAFF_ROLES, "teacher"];

router.get("/", authenticateUser, authorizeRoles(TEACH_OR_STAFF), listClassAssignments);
router.post("/", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), createClassAssignment);
router.get("/:id", authenticateUser, authorizeRoles(TEACH_OR_STAFF), getClassAssignment);
router.put("/:id", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), updateClassAssignment);
router.delete("/:id", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), deleteClassAssignment);

router.use(errorHandler);

module.exports = router;
