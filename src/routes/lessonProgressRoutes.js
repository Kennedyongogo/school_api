const express = require("express");
const router = express.Router();
const {
  listLessonProgress,
  getLessonProgress,
  createLessonProgress,
  updateLessonProgress,
  deleteLessonProgress,
} = require("../controllers/lessonProgressController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const { errorHandler } = require("../middleware/errorHandler");

const STAFF_ROLES = ["admin", "accountant", "librarian"];
const TEACH_OR_STAFF = [...STAFF_ROLES, "teacher"];

router.get("/", authenticateUser, authorizeRoles(TEACH_OR_STAFF), listLessonProgress);
router.post("/", authenticateUser, authorizeRoles(TEACH_OR_STAFF), createLessonProgress);
router.get("/:id", authenticateUser, authorizeRoles(TEACH_OR_STAFF), getLessonProgress);
router.put("/:id", authenticateUser, authorizeRoles(TEACH_OR_STAFF), updateLessonProgress);
router.delete("/:id", authenticateUser, authorizeRoles(TEACH_OR_STAFF), deleteLessonProgress);

router.use(errorHandler);

module.exports = router;
