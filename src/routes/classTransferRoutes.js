const express = require("express");
const router = express.Router();
const {
  listClassTransferCurricula,
  listClassTransferClasses,
  listClassTransferLevels,
  listClassTransferLevelStudents,
  moveClassTransferStudent,
} = require("../controllers/classTransferController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const { ADMIN_PORTAL_API_ROLES } = require("../constants/userRoles");

router.get("/curricula", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), listClassTransferCurricula);
router.get(
  "/curricula/:curriculumId/classes",
  authenticateUser,
  authorizeRoles(ADMIN_PORTAL_API_ROLES),
  listClassTransferClasses
);
router.get(
  "/classes/:classId/levels",
  authenticateUser,
  authorizeRoles(ADMIN_PORTAL_API_ROLES),
  listClassTransferLevels
);
router.get(
  "/classes/:classId/levels/:levelId/students",
  authenticateUser,
  authorizeRoles(ADMIN_PORTAL_API_ROLES),
  listClassTransferLevelStudents
);
router.post(
  "/students/:studentId/move",
  authenticateUser,
  authorizeRoles(ADMIN_PORTAL_API_ROLES),
  moveClassTransferStudent
);

module.exports = router;
