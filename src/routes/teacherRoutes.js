const express = require("express");
const router = express.Router();
const {
  listTeachers,
  getTeacher,
  getMyTeacherProfile,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} = require("../controllers/teacherController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const { errorHandler } = require("../middleware/errorHandler");

const { STAFF_ROLES, ADMIN_PORTAL_API_ROLES, SCHOOL_ADMIN_ROLES } = require("../constants/userRoles");

router.get("/me", authenticateUser, authorizeRoles(["teacher"]), getMyTeacherProfile);
router.get("/", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), listTeachers);
router.post("/", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), createTeacher);
router.get("/:id", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), getTeacher);
router.put("/:id", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), updateTeacher);
router.delete("/:id", authenticateUser, authorizeRoles(SCHOOL_ADMIN_ROLES), deleteTeacher);

router.use(errorHandler);

module.exports = router;
