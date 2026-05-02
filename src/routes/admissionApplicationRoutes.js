const express = require("express");
const router = express.Router();
const {
  submitPublicApplication,
  listApplications,
  getApplication,
  updateApplication,
  deleteApplication,
} = require("../controllers/admissionApplicationController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const { errorHandler } = require("../middleware/errorHandler");

const STAFF_ROLES = ["admin", "accountant", "librarian"];
const TEACH_OR_STAFF = [...STAFF_ROLES, "teacher"];

router.post("/submit", submitPublicApplication);

router.get("/", authenticateUser, authorizeRoles(TEACH_OR_STAFF), listApplications);
router.get("/:id", authenticateUser, authorizeRoles(TEACH_OR_STAFF), getApplication);
router.put("/:id", authenticateUser, authorizeRoles(STAFF_ROLES), updateApplication);
router.delete("/:id", authenticateUser, authorizeRoles(STAFF_ROLES), deleteApplication);

router.use(errorHandler);

module.exports = router;
