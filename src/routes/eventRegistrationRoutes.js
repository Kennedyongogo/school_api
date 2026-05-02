const express = require("express");
const router = express.Router();
const {
  registerPublic,
  listRegistrations,
  getRegistration,
  updateRegistration,
  deleteRegistration,
} = require("../controllers/eventRegistrationController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const { errorHandler } = require("../middleware/errorHandler");

const STAFF_ROLES = ["admin", "accountant", "librarian"];
const TEACH_OR_STAFF = [...STAFF_ROLES, "teacher"];

router.post("/register", registerPublic);

router.get("/", authenticateUser, authorizeRoles(TEACH_OR_STAFF), listRegistrations);
router.get("/:id", authenticateUser, authorizeRoles(TEACH_OR_STAFF), getRegistration);
router.put("/:id", authenticateUser, authorizeRoles(STAFF_ROLES), updateRegistration);
router.delete("/:id", authenticateUser, authorizeRoles(STAFF_ROLES), deleteRegistration);

router.use(errorHandler);

module.exports = router;
