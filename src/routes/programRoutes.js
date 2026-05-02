const express = require("express");
const router = express.Router();
const {
  listPrograms,
  listPublicByCurriculum,
  getProgram,
  createProgram,
  updateProgram,
  deleteProgram,
} = require("../controllers/programController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const { errorHandler } = require("../middleware/errorHandler");

const STAFF_ROLES = ["admin", "accountant", "librarian"];
const TEACH_OR_STAFF = [...STAFF_ROLES, "teacher"];

router.get("/public/by-curriculum/:curriculum_id", listPublicByCurriculum);

router.get("/", authenticateUser, authorizeRoles(TEACH_OR_STAFF), listPrograms);
router.post("/", authenticateUser, authorizeRoles(STAFF_ROLES), createProgram);
router.get("/:id", authenticateUser, authorizeRoles(TEACH_OR_STAFF), getProgram);
router.put("/:id", authenticateUser, authorizeRoles(STAFF_ROLES), updateProgram);
router.delete("/:id", authenticateUser, authorizeRoles(STAFF_ROLES), deleteProgram);

router.use(errorHandler);

module.exports = router;
