const express = require("express");
const router = express.Router();
const {
  listGradeFormulas,
  getGradeFormula,
  createGradeFormula,
  updateGradeFormula,
  deleteGradeFormula,
} = require("../controllers/gradeFormulaController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const { errorHandler } = require("../middleware/errorHandler");

const STAFF_ROLES = ["admin", "accountant", "librarian"];
const TEACH_OR_STAFF = [...STAFF_ROLES, "teacher"];

router.get("/", authenticateUser, authorizeRoles(TEACH_OR_STAFF), listGradeFormulas);
router.post("/", authenticateUser, authorizeRoles(STAFF_ROLES), createGradeFormula);
router.get("/:id", authenticateUser, authorizeRoles(TEACH_OR_STAFF), getGradeFormula);
router.put("/:id", authenticateUser, authorizeRoles(STAFF_ROLES), updateGradeFormula);
router.delete("/:id", authenticateUser, authorizeRoles(STAFF_ROLES), deleteGradeFormula);

router.use(errorHandler);

module.exports = router;
