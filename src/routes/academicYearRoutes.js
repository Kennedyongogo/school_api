const express = require("express");
const router = express.Router();
const {
  listAcademicYears,
  getAcademicYear,
  createAcademicYear,
  updateAcademicYear,
  deleteAcademicYear,
} = require("../controllers/academicYearController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const { errorHandler } = require("../middleware/errorHandler");

const { STAFF_ROLES, ADMIN_PORTAL_API_ROLES} = require("../constants/userRoles");
const TEACH_OR_STAFF = [...STAFF_ROLES, "teacher"];

router.get("/", authenticateUser, authorizeRoles(TEACH_OR_STAFF), listAcademicYears);
router.post("/", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), createAcademicYear);
router.get("/:id", authenticateUser, authorizeRoles(TEACH_OR_STAFF), getAcademicYear);
router.put("/:id", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), updateAcademicYear);
router.delete("/:id", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), deleteAcademicYear);

router.use(errorHandler);

module.exports = router;
