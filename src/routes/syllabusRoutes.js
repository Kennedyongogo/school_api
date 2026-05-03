const express = require("express");
const router = express.Router();
const {
  listSyllabi,
  getSyllabus,
  createSyllabus,
  updateSyllabus,
  deleteSyllabus,
  addChapters,
  getCurrentPublished,
  getProgress,
} = require("../controllers/syllabusController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const { errorHandler } = require("../middleware/errorHandler");
const { checkStudentAccountAccess } = require("../middleware/checkStudentAccountAccess");

const { STAFF_ROLES } = require("../constants/userRoles");
const TEACH_OR_STAFF = [...STAFF_ROLES, "teacher"];
const WITH_PARENT = [...TEACH_OR_STAFF, "student", "parent"];

router.get("/current", authenticateUser, checkStudentAccountAccess, authorizeRoles(WITH_PARENT), getCurrentPublished);
router.get("/:id/progress", authenticateUser, checkStudentAccountAccess, authorizeRoles(WITH_PARENT), getProgress);
router.post("/:id/chapters", authenticateUser, checkStudentAccountAccess, authorizeRoles(TEACH_OR_STAFF), addChapters);

router.get("/", authenticateUser, checkStudentAccountAccess, authorizeRoles(WITH_PARENT), listSyllabi);
router.post("/", authenticateUser, checkStudentAccountAccess, authorizeRoles(TEACH_OR_STAFF), createSyllabus);
router.get("/:id", authenticateUser, checkStudentAccountAccess, authorizeRoles(WITH_PARENT), getSyllabus);
router.put("/:id", authenticateUser, checkStudentAccountAccess, authorizeRoles(TEACH_OR_STAFF), updateSyllabus);
router.delete("/:id", authenticateUser, checkStudentAccountAccess, authorizeRoles(TEACH_OR_STAFF), deleteSyllabus);

router.use(errorHandler);

module.exports = router;
