const express = require("express");
const router = express.Router();
const {
  login,
  register,
  me,
  listUsers,
  getUserById,
  createUser,
  updateUser,
  changePassword,
  toggleActive,
  deleteUser,
} = require("../controllers/userController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const { errorHandler } = require("../middleware/errorHandler");

const STAFF_ROLES = ["admin", "accountant", "librarian"];

router.post("/login", login);
router.post("/register", register);

router.get("/me", authenticateUser, me);

router.post("/", authenticateUser, authorizeRoles(STAFF_ROLES), createUser);
router.get("/", authenticateUser, authorizeRoles(STAFF_ROLES), listUsers);

router.get("/:id", authenticateUser, getUserById);
router.put("/:id", authenticateUser, updateUser);
router.put("/:id/password", authenticateUser, changePassword);
router.put("/:id/toggle-status", authenticateUser, authorizeRoles(STAFF_ROLES), toggleActive);
router.delete("/:id", authenticateUser, authorizeRoles(["admin"]), deleteUser);

router.use(errorHandler);

module.exports = router;
