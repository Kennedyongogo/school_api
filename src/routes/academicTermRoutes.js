const express = require("express");
const router = express.Router();
const {
  listAcademicTerms,
  getAcademicTerm,
  createAcademicTerm,
  updateAcademicTerm,
  deleteAcademicTerm,
} = require("../controllers/academicTermController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const { errorHandler } = require("../middleware/errorHandler");

const STAFF_ROLES = ["admin", "accountant", "librarian"];
const TEACH_OR_STAFF = [...STAFF_ROLES, "teacher"];

router.get("/", authenticateUser, authorizeRoles(TEACH_OR_STAFF), listAcademicTerms);
router.post("/", authenticateUser, authorizeRoles(STAFF_ROLES), createAcademicTerm);
router.get("/:id", authenticateUser, authorizeRoles(TEACH_OR_STAFF), getAcademicTerm);
router.put("/:id", authenticateUser, authorizeRoles(STAFF_ROLES), updateAcademicTerm);
router.delete("/:id", authenticateUser, authorizeRoles(STAFF_ROLES), deleteAcademicTerm);

router.use(errorHandler);

module.exports = router;
