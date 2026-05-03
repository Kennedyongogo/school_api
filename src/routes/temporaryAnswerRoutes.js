const express = require("express");
const router = express.Router();
const {
  listTemporaryAnswers,
  getTemporaryAnswer,
  upsertTemporaryAnswer,
  createTemporaryAnswer,
  updateTemporaryAnswer,
  deleteTemporaryAnswer,
} = require("../controllers/temporaryAnswerController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const { errorHandler } = require("../middleware/errorHandler");
const { checkStudentAccountAccess } = require("../middleware/checkStudentAccountAccess");

const { STAFF_ROLES, ADMIN_PORTAL_API_ROLES} = require("../constants/userRoles");
const TEACH_OR_STAFF = [...STAFF_ROLES, "teacher"];
const WITH_STUDENT = [...TEACH_OR_STAFF, "student"];

router.post("/upsert", authenticateUser, upsertTemporaryAnswer);

router.get("/", authenticateUser, checkStudentAccountAccess, authorizeRoles(WITH_STUDENT), listTemporaryAnswers);
router.post("/", authenticateUser, checkStudentAccountAccess, authorizeRoles(ADMIN_PORTAL_API_ROLES), createTemporaryAnswer);
router.get("/:id", authenticateUser, checkStudentAccountAccess, authorizeRoles(WITH_STUDENT), getTemporaryAnswer);
router.put("/:id", authenticateUser, checkStudentAccountAccess, authorizeRoles(ADMIN_PORTAL_API_ROLES), updateTemporaryAnswer);
router.delete("/:id", authenticateUser, checkStudentAccountAccess, authorizeRoles(ADMIN_PORTAL_API_ROLES), deleteTemporaryAnswer);

router.use(errorHandler);

module.exports = router;
