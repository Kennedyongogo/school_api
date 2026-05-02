const express = require("express");
const router = express.Router();
const {
  listPublished,
  getPublishedBySlug,
  listNews,
  getNews,
  createNews,
  updateNews,
  deleteNews,
  generatePosterForNews,
} = require("../controllers/newsController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const { errorHandler } = require("../middleware/errorHandler");

const STAFF_ROLES = ["admin", "accountant", "librarian"];
const TEACH_OR_STAFF = [...STAFF_ROLES, "teacher"];

router.get("/published", listPublished);
router.get("/published/slug/:slug", getPublishedBySlug);

router.get("/", authenticateUser, authorizeRoles(TEACH_OR_STAFF), listNews);
router.post("/", authenticateUser, authorizeRoles(STAFF_ROLES), createNews);

router.post("/:id/generate-poster", authenticateUser, authorizeRoles(STAFF_ROLES), generatePosterForNews);

router.get("/:id", authenticateUser, authorizeRoles(TEACH_OR_STAFF), getNews);
router.put("/:id", authenticateUser, authorizeRoles(STAFF_ROLES), updateNews);
router.delete("/:id", authenticateUser, authorizeRoles(STAFF_ROLES), deleteNews);

router.use(errorHandler);

module.exports = router;
