const express = require("express");
const router = express.Router();
const {
  listOnlineSessionTracking,
  getOnlineSessionTracking,
  createOnlineSessionTracking,
  updateOnlineSessionTracking,
  deleteOnlineSessionTracking,
} = require("../controllers/onlineSessionTrackingController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const { errorHandler } = require("../middleware/errorHandler");
const { checkStudentAccountAccess } = require("../middleware/checkStudentAccountAccess");

const STAFF_ROLES = ["admin", "accountant", "librarian"];
const TEACH_OR_STAFF = [...STAFF_ROLES, "teacher"];
const WITH_STUDENT = [...TEACH_OR_STAFF, "student"];

router.get("/", authenticateUser, checkStudentAccountAccess, authorizeRoles(WITH_STUDENT), listOnlineSessionTracking);
router.post("/", authenticateUser, checkStudentAccountAccess, authorizeRoles(WITH_STUDENT), createOnlineSessionTracking);
router.get("/:id", authenticateUser, checkStudentAccountAccess, authorizeRoles(WITH_STUDENT), getOnlineSessionTracking);
router.put("/:id", authenticateUser, checkStudentAccountAccess, authorizeRoles(WITH_STUDENT), updateOnlineSessionTracking);
router.delete("/:id", authenticateUser, checkStudentAccountAccess, authorizeRoles(TEACH_OR_STAFF), deleteOnlineSessionTracking);

router.use(errorHandler);

module.exports = router;
