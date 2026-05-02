const express = require("express");
const router = express.Router();
const {
  listSchoolAdmins,
  getSchoolAdmin,
  createSchoolAdmin,
  updateSchoolAdmin,
  deleteSchoolAdmin,
} = require("../controllers/schoolAdminController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const { errorHandler } = require("../middleware/errorHandler");

const STAFF_READ = ["admin", "accountant", "librarian"];

router.get("/", authenticateUser, authorizeRoles(STAFF_READ), listSchoolAdmins);
router.post("/", authenticateUser, authorizeRoles(["admin"]), createSchoolAdmin);
router.get("/:id", authenticateUser, authorizeRoles(STAFF_READ), getSchoolAdmin);
router.put("/:id", authenticateUser, authorizeRoles(["admin"]), updateSchoolAdmin);
router.delete("/:id", authenticateUser, authorizeRoles(["admin"]), deleteSchoolAdmin);

router.use(errorHandler);

module.exports = router;
