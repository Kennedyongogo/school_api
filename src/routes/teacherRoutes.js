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

const STAFF_ROLES = ["admin", "accountant", "librarian"];

router.get("/me", authenticateUser, authorizeRoles(["teacher"]), getMyTeacherProfile);
router.get("/", authenticateUser, authorizeRoles(STAFF_ROLES), listTeachers);
router.post("/", authenticateUser, authorizeRoles(STAFF_ROLES), createTeacher);
router.get("/:id", authenticateUser, authorizeRoles(STAFF_ROLES), getTeacher);
router.put("/:id", authenticateUser, authorizeRoles(STAFF_ROLES), updateTeacher);
router.delete("/:id", authenticateUser, authorizeRoles(["admin"]), deleteTeacher);

router.use(errorHandler);

module.exports = router;
