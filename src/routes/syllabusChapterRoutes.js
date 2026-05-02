const express = require("express");
const router = express.Router();
const {
  listChapters,
  getChapter,
  createChapter,
  updateChapter,
  deleteChapter,
} = require("../controllers/syllabusChapterController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const { errorHandler } = require("../middleware/errorHandler");

const STAFF_ROLES = ["admin", "accountant", "librarian"];
const TEACH_OR_STAFF = [...STAFF_ROLES, "teacher"];

router.get("/", authenticateUser, authorizeRoles(TEACH_OR_STAFF), listChapters);
router.post("/", authenticateUser, authorizeRoles(TEACH_OR_STAFF), createChapter);
router.get("/:id", authenticateUser, authorizeRoles(TEACH_OR_STAFF), getChapter);
router.put("/:id", authenticateUser, authorizeRoles(TEACH_OR_STAFF), updateChapter);
router.delete("/:id", authenticateUser, authorizeRoles(TEACH_OR_STAFF), deleteChapter);

router.use(errorHandler);

module.exports = router;
