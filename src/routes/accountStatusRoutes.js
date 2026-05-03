const express = require("express");
const router = express.Router();
const { listAccountStatuses, getAccountStatus } = require("../controllers/accountStatusController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const { errorHandler } = require("../middleware/errorHandler");

const { STAFF_ROLES } = require("../constants/userRoles");
const TEACH_OR_STAFF = [...STAFF_ROLES, "teacher"];

router.get("/", authenticateUser, authorizeRoles(TEACH_OR_STAFF), listAccountStatuses);
router.get("/:id", authenticateUser, authorizeRoles(TEACH_OR_STAFF), getAccountStatus);

router.use(errorHandler);

module.exports = router;
