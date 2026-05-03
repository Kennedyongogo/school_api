const express = require("express");
const router = express.Router();
const {
  listPublished,
  listPublishedUpcoming,
  getPublishedBySlug,
  listSchoolEvents,
  getSchoolEvent,
  createSchoolEvent,
  updateSchoolEvent,
  deleteSchoolEvent,
  generatePosterForEvent,
} = require("../controllers/schoolEventController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const { errorHandler } = require("../middleware/errorHandler");

const { STAFF_ROLES, ADMIN_PORTAL_API_ROLES} = require("../constants/userRoles");
const TEACH_OR_STAFF = [...STAFF_ROLES, "teacher"];

router.get("/published/upcoming", listPublishedUpcoming);
router.get("/published", listPublished);
router.get("/published/slug/:slug", getPublishedBySlug);

router.get("/", authenticateUser, authorizeRoles(TEACH_OR_STAFF), listSchoolEvents);
router.post("/", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), createSchoolEvent);

router.post("/:id/generate-poster", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), generatePosterForEvent);

router.get("/:id", authenticateUser, authorizeRoles(TEACH_OR_STAFF), getSchoolEvent);
router.put("/:id", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), updateSchoolEvent);
router.delete("/:id", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), deleteSchoolEvent);

router.use(errorHandler);

module.exports = router;
