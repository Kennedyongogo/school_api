const express = require("express");
const router = express.Router();
const {
  generateReportCards,
  listReportCardsForStudent,
  getReportCard,
  publishReportCard,
} = require("../controllers/reportCardController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const { errorHandler } = require("../middleware/errorHandler");
const { STAFF_ROLES, ADMIN_PORTAL_API_ROLES } = require("../constants/userRoles");

const TEACH_OR_STAFF = [...STAFF_ROLES, "teacher"];

router.post("/generate", authenticateUser, authorizeRoles(TEACH_OR_STAFF), generateReportCards);
router.get("/student/:studentId", authenticateUser, authorizeRoles(TEACH_OR_STAFF), listReportCardsForStudent);
router.get("/:id", authenticateUser, authorizeRoles(TEACH_OR_STAFF), getReportCard);
router.post("/:id/publish", authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES), publishReportCard);

router.use(errorHandler);

module.exports = router;
