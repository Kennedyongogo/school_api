const express = require("express");
const router = express.Router();
const {
  listStudents,
  getStudent,
  getMyStudentProfile,
  createStudent,
  updateStudent,
  deleteStudent,
} = require("../controllers/studentController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const { errorHandler } = require("../middleware/errorHandler");

const STAFF_ROLES = ["admin", "accountant", "librarian"];
const TEACH_OR_STAFF = [...STAFF_ROLES, "teacher"];

router.get("/me", authenticateUser, authorizeRoles(["student"]), getMyStudentProfile);
router.get("/", authenticateUser, authorizeRoles(TEACH_OR_STAFF), listStudents);
router.post("/", authenticateUser, authorizeRoles(STAFF_ROLES), createStudent);
router.get("/:id", authenticateUser, authorizeRoles(TEACH_OR_STAFF), getStudent);
router.put("/:id", authenticateUser, authorizeRoles(STAFF_ROLES), updateStudent);
router.delete("/:id", authenticateUser, authorizeRoles(["admin"]), deleteStudent);

router.use(errorHandler);

module.exports = router;
