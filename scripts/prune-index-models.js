/**
 * One-off: strip unused models from src/models/index.js
 * Run: node scripts/prune-index-models.js
 */
const fs = require("fs");
const path = require("path");

const INDEX = path.join(__dirname, "../src/models/index.js");

const REMOVE = new Set([
  "StudentParent", "GradeLevel", "Section", "Subject", "ClassAssignment", "Enrollment",
  "StudentAnswer", "TemporaryAnswer", "GradingScale", "GradingAssignment", "AssessmentComponent",
  "AcademicYear", "Semester", "AssessmentExamType", "SubjectAverage", "OverallAverage",
  "ReportCard", "ReportCardItem", "GradeFormula", "AttendanceTracking", "RealTimeActivity",
  "Syllabus", "SyllabusChapter", "TeacherAttendance", "ClassSession", "ClassAttendance",
  "LessonProgress", "OnlineSessionTracking",
  "InstallmentPlan", "StudentInstallmentPlan", "InstallmentPayment", "FeeDiscount",
  "PaymentReminder", "AccountStatus", "PaymentGracePeriod", "DeactivationLog",
  "CurriculumSubjectGradingBand", "Program", "AdmissionSettings", "EventRegistration",
  "LiveClassPoll", "LiveClassPollResponse",
  "Course", "Lesson", "LessonCompletion", "LessonResource", "CourseAssignment",
  "AssignmentSubmission", "CourseDiscussion", "DiscussionReply", "CourseEnrollment",
  "NotificationTemplate", "EmailQueue", "SmsQueue", "NotificationPreference", "BulkNotification",
  "CertificateTemplate", "IssuedCertificate", "CertificateVerification", "Badge", "EarnedBadge",
  "PaymentGateway", "WebhookLog", "RefundRequest", "SubscriptionPlan", "Subscription",
  "SystemSetting", "FeatureFlag", "AuditLog", "BackupLog", "ScheduledJob", "ApiUsage", "MaintenanceMode",
  "StudentEngagement", "TeacherPerformance", "ExamAnalytics", "FinancialReport", "DailyReport",
  "SupportTicket", "TicketReply", "KnowledgeBase", "Coupon", "CouponUsage", "Referral",
  "BackgroundJob", "ExportJob", "ImportJob",
]);

const REMOVE_FILES = {
  StudentParent: "studentParent",
  GradeLevel: "gradeLevel",
  Section: "section",
  Subject: "subject",
  ClassAssignment: "classAssignment",
  Enrollment: "enrollment",
  StudentAnswer: "studentAnswer",
  TemporaryAnswer: "temporaryAnswer",
  GradingScale: "gradingScale",
  GradingAssignment: "gradingAssignment",
  AssessmentComponent: "assessmentComponent",
  AcademicYear: "academicYear",
  Semester: "semester",
  AssessmentExamType: "examType",
  SubjectAverage: "subjectAverage",
  OverallAverage: "overallAverage",
  ReportCard: "reportCard",
  ReportCardItem: "reportCardItem",
  GradeFormula: "gradeFormula",
  AttendanceTracking: "attendanceTracking",
  RealTimeActivity: "realTimeActivity",
  Syllabus: "syllabus",
  SyllabusChapter: "syllabusChapter",
  TeacherAttendance: "teacherAttendance",
  ClassSession: "classSession",
  ClassAttendance: "classAttendance",
  LessonProgress: "lessonProgress",
  OnlineSessionTracking: "onlineSessionTracking",
  InstallmentPlan: "installmentPlan",
  StudentInstallmentPlan: "studentInstallmentPlan",
  InstallmentPayment: "installmentPayment",
  FeeDiscount: "feeDiscount",
  PaymentReminder: "paymentReminder",
  AccountStatus: "accountStatus",
  PaymentGracePeriod: "paymentGracePeriod",
  DeactivationLog: "deactivationLog",
  CurriculumSubjectGradingBand: "curriculumSubjectGradingBand",
  Program: "program",
  AdmissionSettings: "admissionSettings",
  EventRegistration: "eventRegistration",
  LiveClassPoll: "liveClassPoll",
  LiveClassPollResponse: "liveClassPollResponse",
  Course: "course",
  Lesson: "lesson",
  LessonCompletion: "lessonCompletion",
  LessonResource: "lessonResource",
  CourseAssignment: "courseAssignment",
  AssignmentSubmission: "assignmentSubmission",
  CourseDiscussion: "courseDiscussion",
  DiscussionReply: "discussionReply",
  CourseEnrollment: "courseEnrollment",
  NotificationTemplate: "notificationTemplate",
  EmailQueue: "emailQueue",
  SmsQueue: "smsQueue",
  NotificationPreference: "notificationPreference",
  BulkNotification: "bulkNotification",
  CertificateTemplate: "certificateTemplate",
  IssuedCertificate: "issuedCertificate",
  CertificateVerification: "certificateVerification",
  Badge: "badge",
  EarnedBadge: "earnedBadge",
  PaymentGateway: "paymentGateway",
  WebhookLog: "webhookLog",
  RefundRequest: "refundRequest",
  SubscriptionPlan: "subscriptionPlan",
  Subscription: "subscription",
  SystemSetting: "systemSetting",
  FeatureFlag: "featureFlag",
  AuditLog: "auditLog",
  BackupLog: "backupLog",
  ScheduledJob: "scheduledJob",
  ApiUsage: "apiUsage",
  MaintenanceMode: "maintenanceMode",
  StudentEngagement: "studentEngagement",
  TeacherPerformance: "teacherPerformance",
  ExamAnalytics: "examAnalytics",
  FinancialReport: "financialReport",
  DailyReport: "dailyReport",
  SupportTicket: "supportTicket",
  TicketReply: "ticketReply",
  KnowledgeBase: "knowledgeBase",
  Coupon: "coupon",
  CouponUsage: "couponUsage",
  Referral: "referral",
  BackgroundJob: "backgroundJob",
  ExportJob: "exportJob",
  ImportJob: "importJob",
};

function usesRemoved(line) {
  for (const name of REMOVE) {
    if (new RegExp(`\\b${name}\\b`).test(line)) return true;
  }
  return false;
}

function pruneRequires(src) {
  const lines = src.split("\n");
  const out = [];
  let skip = 0;
  for (let i = 0; i < lines.length; i++) {
    if (skip > 0) {
      skip--;
      continue;
    }
    const line = lines[i];
    if (line.startsWith("const { sequelize }")) {
      out.push(line);
      continue;
    }
    if (!line.startsWith("const ") || !line.includes("require(")) {
      if (line === "const models = {") break;
      continue;
    }
    const m = line.match(/^const (\w+) = /);
    if (!m) continue;
    if (REMOVE.has(m[1])) {
      if (line.includes("(") && !line.includes(")(sequelize)")) {
        let j = i;
        while (j < lines.length && !lines[j].includes(")(sequelize)")) j++;
        skip = j - i;
      }
      continue;
    }
    out.push(line);
    if (line.includes("(") && !line.includes(")(sequelize)")) {
      let j = i + 1;
      while (j < lines.length && !lines[j].includes(")(sequelize)")) {
        out.push(lines[j]);
        j++;
      }
      i = j;
      if (j < lines.length) out.push(lines[j]);
    }
  }
  return out;
}

function pruneModelsBlock(src) {
  const start = src.indexOf("const models = {");
  const end = src.indexOf("};", start) + 2;
  const block = src.slice(start, end);
  const lines = block.split("\n");
  const kept = lines.filter((line) => {
    const m = line.match(/^\s+(\w+),?\s*$/);
    if (!m) return true;
    return !REMOVE.has(m[1]);
  });
  return src.slice(0, start) + kept.join("\n") + src.slice(end);
}

function pruneSyncBlock(src) {
  return src.replace(/^\s*await \w+\.sync\([^)]*\);\s*$/gm, (line) => {
    const m = line.match(/await (\w+)\.sync/);
    if (m && REMOVE.has(m[1])) return "";
    return line;
  });
}

function pruneAssociations(src) {
  const start = src.indexOf("const setupAssociations = () => {");
  const end = src.indexOf("\n};", start) + 3;
  const head = src.slice(0, start);
  const tail = src.slice(end);
  const body = src.slice(start, end);

  const statements = [];
  let buf = [];
  let depth = 0;
  const lines = body.split("\n");
  for (const line of lines) {
    buf.push(line);
    depth += (line.match(/\{/g) || []).length;
    depth -= (line.match(/\}/g) || []).length;
    if (depth === 0 && line.trim().endsWith(");")) {
      statements.push(buf.join("\n"));
      buf = [];
    }
  }
  if (buf.length) statements.push(buf.join("\n"));

  const kept = statements.filter((st) => {
    if (!st.trim() || st.includes("setupAssociations")) return true;
    return !usesRemoved(st);
  });

  const newBody = kept.join("\n");
  return head + newBody + tail;
}

let src = fs.readFileSync(INDEX, "utf8");
const header = pruneRequires(src).join("\n") + "\n\n";
src = fs.readFileSync(INDEX, "utf8");
let out = header + src.slice(src.indexOf("const models = {"));
out = pruneModelsBlock(out);
out = pruneSyncBlock(out);
out = pruneAssociations(out);
out = out.replace(/\n{4,}/g, "\n\n\n");
fs.writeFileSync(INDEX, out);
console.log("Pruned", INDEX);

module.exports = { REMOVE, REMOVE_FILES };
