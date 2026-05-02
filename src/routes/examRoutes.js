const express = require("express");
const router = express.Router();
const {
  listExams,
  getExam,
  createExam,
  updateExam,
  deleteExam,
} = require("../controllers/examController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const { errorHandler } = require("../middleware/errorHandler");

const STAFF_ROLES = ["admin", "accountant", "librarian"];
const TEACH_OR_STAFF = [...STAFF_ROLES, "teacher"];

router.get("/", authenticateUser, authorizeRoles(TEACH_OR_STAFF), listExams);
router.post("/", authenticateUser, authorizeRoles(STAFF_ROLES), createExam);
router.get("/:id", authenticateUser, authorizeRoles(TEACH_OR_STAFF), getExam);
router.put("/:id", authenticateUser, authorizeRoles(STAFF_ROLES), updateExam);
router.delete("/:id", authenticateUser, authorizeRoles(STAFF_ROLES), deleteExam);

router.use(errorHandler);

module.exports = router;
