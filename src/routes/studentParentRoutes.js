const express = require("express");
const router = express.Router();
const { listLinks, createLink, deleteLink } = require("../controllers/studentParentController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const { errorHandler } = require("../middleware/errorHandler");

const { STAFF_ROLES, ADMIN_PORTAL_API_ROLES} = require("../constants/userRoles");
const TEACH_OR_STAFF = [...STAFF_ROLES, "teacher"];

router.get("/", authenticateUser, authorizeRoles(TEACH_OR_STAFF), listLinks);
router.post("/", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), createLink);
router.delete("/:id", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), deleteLink);

router.use(errorHandler);

module.exports = router;
