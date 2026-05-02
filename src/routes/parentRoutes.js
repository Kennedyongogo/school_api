const express = require("express");
const router = express.Router();
const {
  listParents,
  getParent,
  getMyParentProfile,
  getMyStudentsFeeOverview,
  createParent,
  updateParent,
  deleteParent,
} = require("../controllers/parentController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const { errorHandler } = require("../middleware/errorHandler");

const STAFF_ROLES = ["admin", "accountant", "librarian"];

router.get("/me", authenticateUser, authorizeRoles(["parent"]), getMyParentProfile);
router.get(
  "/me/students-fee-overview",
  authenticateUser,
  authorizeRoles(["parent"]),
  getMyStudentsFeeOverview
);
router.get("/", authenticateUser, authorizeRoles(STAFF_ROLES), listParents);
router.post("/", authenticateUser, authorizeRoles(STAFF_ROLES), createParent);
router.get("/:id", authenticateUser, authorizeRoles(STAFF_ROLES), getParent);
router.put("/:id", authenticateUser, authorizeRoles(STAFF_ROLES), updateParent);
router.delete("/:id", authenticateUser, authorizeRoles(["admin"]), deleteParent);

router.use(errorHandler);

module.exports = router;
