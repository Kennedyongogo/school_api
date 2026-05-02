const express = require("express");
const router = express.Router();
const {
  listEnrollments,
  getEnrollment,
  createEnrollment,
  updateEnrollment,
  deleteEnrollment,
} = require("../controllers/enrollmentController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const { errorHandler } = require("../middleware/errorHandler");

const STAFF_ROLES = ["admin", "accountant", "librarian"];
const TEACH_OR_STAFF = [...STAFF_ROLES, "teacher"];

router.get("/", authenticateUser, authorizeRoles(TEACH_OR_STAFF), listEnrollments);
router.post("/", authenticateUser, authorizeRoles(STAFF_ROLES), createEnrollment);
router.get("/:id", authenticateUser, authorizeRoles(TEACH_OR_STAFF), getEnrollment);
router.put("/:id", authenticateUser, authorizeRoles(STAFF_ROLES), updateEnrollment);
router.delete("/:id", authenticateUser, authorizeRoles(STAFF_ROLES), deleteEnrollment);

router.use(errorHandler);

module.exports = router;
