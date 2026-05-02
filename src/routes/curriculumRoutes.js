const express = require("express");
const router = express.Router();
const {
  listPublicActive,
  listCurricula,
  getCurriculum,
  createCurriculum,
  updateCurriculum,
  deleteCurriculum,
} = require("../controllers/curriculumController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const { errorHandler } = require("../middleware/errorHandler");

const STAFF_ROLES = ["admin", "accountant", "librarian"];
const TEACH_OR_STAFF = [...STAFF_ROLES, "teacher"];

router.get("/public/active", listPublicActive);

router.get("/", authenticateUser, authorizeRoles(TEACH_OR_STAFF), listCurricula);
router.post("/", authenticateUser, authorizeRoles(STAFF_ROLES), createCurriculum);
router.get("/:id", authenticateUser, authorizeRoles(TEACH_OR_STAFF), getCurriculum);
router.put("/:id", authenticateUser, authorizeRoles(STAFF_ROLES), updateCurriculum);
router.delete("/:id", authenticateUser, authorizeRoles(STAFF_ROLES), deleteCurriculum);

router.use(errorHandler);

module.exports = router;
