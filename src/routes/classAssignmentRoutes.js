const express = require("express");
const router = express.Router();
const {
  listClassAssignments,
  getClassAssignment,
  createClassAssignment,
  updateClassAssignment,
  deleteClassAssignment,
} = require("../controllers/classAssignmentController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const { errorHandler } = require("../middleware/errorHandler");

const STAFF_ROLES = ["admin", "accountant", "librarian"];
const TEACH_OR_STAFF = [...STAFF_ROLES, "teacher"];

router.get("/", authenticateUser, authorizeRoles(TEACH_OR_STAFF), listClassAssignments);
router.post("/", authenticateUser, authorizeRoles(STAFF_ROLES), createClassAssignment);
router.get("/:id", authenticateUser, authorizeRoles(TEACH_OR_STAFF), getClassAssignment);
router.put("/:id", authenticateUser, authorizeRoles(STAFF_ROLES), updateClassAssignment);
router.delete("/:id", authenticateUser, authorizeRoles(STAFF_ROLES), deleteClassAssignment);

router.use(errorHandler);

module.exports = router;
