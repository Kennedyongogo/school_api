const express = require("express");
const router = express.Router();
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const { registerCrud } = require("../utils/makeCrudHandlers");
const { errorHandler } = require("../middleware/errorHandler");
const models = require("../models");

const { STAFF_ROLES, ADMIN_PORTAL_API_ROLES, ALL_USER_ROLES } = require("../constants/userRoles");
const TEACH_OR_STAFF = [...STAFF_ROLES, "teacher"];

const authAll = [authenticateUser, authorizeRoles(ALL_USER_ROLES)];
const authStaff = [authenticateUser, authorizeRoles(ADMIN_PORTAL_API_ROLES)];
const authTeach = [authenticateUser, authorizeRoles(TEACH_OR_STAFF)];

registerCrud(router, "/live-classes", models.LiveClass, authTeach);
registerCrud(router, "/live-class-recordings", models.LiveClassRecording, authTeach);
registerCrud(router, "/live-class-attendances", models.LiveClassAttendance, authAll);
registerCrud(router, "/live-class-chats", models.LiveClassChat, authAll);
registerCrud(router, "/live-class-polls", models.LiveClassPoll, authTeach);
registerCrud(router, "/live-class-poll-responses", models.LiveClassPollResponse, authAll);

registerCrud(router, "/lms/courses", models.Course, authTeach);
registerCrud(router, "/lms/lessons", models.Lesson, authTeach);
registerCrud(router, "/lms/lesson-completions", models.LessonCompletion, authAll);
registerCrud(router, "/lms/lesson-resources", models.LessonResource, authTeach);
registerCrud(router, "/lms/assignments", models.CourseAssignment, authTeach);
registerCrud(router, "/lms/assignment-submissions", models.AssignmentSubmission, authAll);
registerCrud(router, "/lms/discussions", models.CourseDiscussion, authAll);
registerCrud(router, "/lms/discussion-replies", models.DiscussionReply, authAll);
registerCrud(router, "/lms/enrollments", models.CourseEnrollment, authAll);

registerCrud(router, "/notifications/templates", models.NotificationTemplate, authStaff);
registerCrud(router, "/notifications/email-queue", models.EmailQueue, authStaff);
registerCrud(router, "/notifications/sms-queue", models.SmsQueue, authStaff);
registerCrud(router, "/notifications/in-app", models.InAppNotification, authAll);
registerCrud(router, "/notifications/preferences", models.NotificationPreference, authAll);
registerCrud(router, "/notifications/bulk", models.BulkNotification, authStaff);

registerCrud(router, "/certificates/templates", models.CertificateTemplate, authStaff);
registerCrud(router, "/certificates/issued", models.IssuedCertificate, authStaff);
registerCrud(router, "/certificates/verifications", models.CertificateVerification, authAll);
registerCrud(router, "/badges", models.Badge, authTeach);
registerCrud(router, "/earned-badges", models.EarnedBadge, authTeach);

registerCrud(router, "/payments/gateways", models.PaymentGateway, authStaff);
registerCrud(router, "/payments/webhook-logs", models.WebhookLog, authStaff);
registerCrud(router, "/payments/refund-requests", models.RefundRequest, authStaff);
registerCrud(router, "/payments/subscription-plans", models.SubscriptionPlan, authStaff);
registerCrud(router, "/payments/subscriptions", models.Subscription, authStaff);

registerCrud(router, "/system/settings", models.SystemSetting, authStaff);
registerCrud(router, "/system/feature-flags", models.FeatureFlag, authStaff);
registerCrud(router, "/system/audit-logs", models.AuditLog, authStaff, {
  order: [["timestamp", "DESC"]],
});
registerCrud(router, "/system/backup-logs", models.BackupLog, authStaff);
registerCrud(router, "/system/scheduled-jobs", models.ScheduledJob, authStaff);
registerCrud(router, "/system/api-usage", models.ApiUsage, authStaff, {
  order: [["timestamp", "DESC"]],
});
registerCrud(router, "/system/maintenance-mode", models.MaintenanceMode, authStaff);

registerCrud(router, "/analytics/student-engagement", models.StudentEngagement, authStaff);
registerCrud(router, "/analytics/teacher-performance", models.TeacherPerformance, authStaff);
registerCrud(router, "/analytics/exams", models.ExamAnalytics, authStaff);
registerCrud(router, "/analytics/financial-reports", models.FinancialReport, authStaff);
registerCrud(router, "/analytics/daily-reports", models.DailyReport, authStaff);

registerCrud(router, "/support/tickets", models.SupportTicket, authAll);
registerCrud(router, "/support/replies", models.TicketReply, authAll);
registerCrud(router, "/support/knowledge-base", models.KnowledgeBase, authTeach);

registerCrud(router, "/promotions/coupons", models.Coupon, authStaff);
registerCrud(router, "/promotions/coupon-usages", models.CouponUsage, authStaff);
registerCrud(router, "/promotions/referrals", models.Referral, authStaff);

registerCrud(router, "/jobs/background", models.BackgroundJob, authStaff);
registerCrud(router, "/jobs/exports", models.ExportJob, authStaff);
registerCrud(router, "/jobs/imports", models.ImportJob, authStaff);

router.use(errorHandler);

module.exports = router;
