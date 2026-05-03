const express = require("express");
const router = express.Router();
const {
  listSubjects,
  getSubject,
  createSubject,
  updateSubject,
  deleteSubject,
} = require("../controllers/subjectController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const { errorHandler } = require("../middleware/errorHandler");

const { STAFF_ROLES, ADMIN_PORTAL_API_ROLES} = require("../constants/userRoles");
const TEACH_OR_STAFF = [...STAFF_ROLES, "teacher"];

router.get("/", authenticateUser, authorizeRoles(TEACH_OR_STAFF), listSubjects);
router.post("/", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), createSubject);
router.get("/:id", authenticateUser, authorizeRoles(TEACH_OR_STAFF), getSubject);
router.put("/:id", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), updateSubject);
router.delete("/:id", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), deleteSubject);

router.use(errorHandler);

module.exports = router;
