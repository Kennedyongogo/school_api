const express = require("express");
const router = express.Router();
const {
  listStudents,
  listStudentUsersWithoutProfile,
  getStudent,
  getMyStudentProfile,
  createStudent,
  updateStudent,
  deleteStudent,
} = require("../controllers/studentController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const { errorHandler } = require("../middleware/errorHandler");

const { STAFF_ROLES, ADMIN_PORTAL_API_ROLES, SCHOOL_ADMIN_ROLES } = require("../constants/userRoles");
const TEACH_OR_STAFF = [...STAFF_ROLES, "teacher"];

router.get("/me", authenticateUser, authorizeRoles(["student"]), getMyStudentProfile);
router.get("/", authenticateUser, authorizeRoles(TEACH_OR_STAFF), listStudents);
router.get(
  "/users-without-profile",
  authenticateUser,
  authorizeRoles(ADMIN_PORTAL_API_ROLES),
  listStudentUsersWithoutProfile
);
router.post("/", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), createStudent);
router.get("/:id", authenticateUser, authorizeRoles(TEACH_OR_STAFF), getStudent);
router.put("/:id", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), updateStudent);
router.delete("/:id", authenticateUser, authorizeRoles(SCHOOL_ADMIN_ROLES), deleteStudent);

router.use(errorHandler);

module.exports = router;
