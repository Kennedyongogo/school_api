const express = require("express");
const router = express.Router();
const {
  listSemesters,
  getSemester,
  createSemester,
  updateSemester,
  deleteSemester,
} = require("../controllers/semesterController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const { errorHandler } = require("../middleware/errorHandler");

const { STAFF_ROLES, ADMIN_PORTAL_API_ROLES} = require("../constants/userRoles");
const TEACH_OR_STAFF = [...STAFF_ROLES, "teacher"];

router.get("/", authenticateUser, authorizeRoles(TEACH_OR_STAFF), listSemesters);
router.post("/", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), createSemester);
router.get("/:id", authenticateUser, authorizeRoles(TEACH_OR_STAFF), getSemester);
router.put("/:id", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), updateSemester);
router.delete("/:id", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), deleteSemester);

router.use(errorHandler);

module.exports = router;
