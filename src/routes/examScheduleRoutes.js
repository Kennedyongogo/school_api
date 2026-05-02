const express = require("express");
const router = express.Router();
const {
  listExamSchedules,
  getExamSchedule,
  createExamSchedule,
  updateExamSchedule,
  deleteExamSchedule,
} = require("../controllers/examScheduleController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const { errorHandler } = require("../middleware/errorHandler");

const STAFF_ROLES = ["admin", "accountant", "librarian"];
const TEACH_OR_STAFF = [...STAFF_ROLES, "teacher"];

router.get("/", authenticateUser, authorizeRoles(TEACH_OR_STAFF), listExamSchedules);
router.post("/", authenticateUser, authorizeRoles(STAFF_ROLES), createExamSchedule);
router.get("/:id", authenticateUser, authorizeRoles(TEACH_OR_STAFF), getExamSchedule);
router.put("/:id", authenticateUser, authorizeRoles(STAFF_ROLES), updateExamSchedule);
router.delete("/:id", authenticateUser, authorizeRoles(STAFF_ROLES), deleteExamSchedule);

router.use(errorHandler);

module.exports = router;
