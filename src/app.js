const express = require("express");
const path = require("path");
const cors = require("cors");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

const { initializeModels, setupAssociations } = require("./models");
const { User } = require("./models");
const { errorHandler } = require("./middleware/errorHandler");
const { injectSchoolContext } = require("./middleware/schoolContext");

const userRoutes = require("./routes/userRoutes");
const studentRoutes = require("./routes/studentRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
const parentRoutes = require("./routes/parentRoutes");
const studentParentRoutes = require("./routes/studentParentRoutes");
const schoolAdminRoutes = require("./routes/schoolAdminRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const gradeLevelRoutes = require("./routes/gradeLevelRoutes");
const sectionRoutes = require("./routes/sectionRoutes");
const subjectRoutes = require("./routes/subjectRoutes");
const classAssignmentRoutes = require("./routes/classAssignmentRoutes");
const enrollmentRoutes = require("./routes/enrollmentRoutes");
const examRoutes = require("./routes/examRoutes");
const examTemplateRoutes = require("./routes/examTemplateRoutes");
const examScheduleRoutes = require("./routes/examScheduleRoutes");
const examQuestionRoutes = require("./routes/examQuestionRoutes");
const examAttemptRoutes = require("./routes/examAttemptRoutes");
const studentAnswerRoutes = require("./routes/studentAnswerRoutes");
const temporaryAnswerRoutes = require("./routes/temporaryAnswerRoutes");
const proctoringSessionRoutes = require("./routes/proctoringSessionRoutes");
const proctoringEventRoutes = require("./routes/proctoringEventRoutes");
const proctoringRecordingRoutes = require("./routes/proctoringRecordingRoutes");
const academicYearRoutes = require("./routes/academicYearRoutes");
const semesterRoutes = require("./routes/semesterRoutes");
const gradingScaleRoutes = require("./routes/gradingScaleRoutes");
const assessmentExamTypeRoutes = require("./routes/assessmentExamTypeRoutes");
const gradeFormulaRoutes = require("./routes/gradeFormulaRoutes");
const studentExamResultRoutes = require("./routes/studentExamResultRoutes");
const gradingWorkflowRoutes = require("./routes/gradingWorkflowRoutes");
const gradingConfigurationRoutes = require("./routes/gradingConfigurationRoutes");
const subjectGradingScaleRoutes = require("./routes/subjectGradingScaleRoutes");
const overallGradingScaleRoutes = require("./routes/overallGradingScaleRoutes");
const examResultsRoutes = require("./routes/examResultsRoutes");
const reportCardRoutes = require("./routes/reportCardRoutes");
const realTimeTrackingRoutes = require("./routes/realTimeTrackingRoutes");
const realtimeRoutes = require("./routes/realtimeRoutes");
const attendanceTrackingRoutes = require("./routes/attendanceTrackingRoutes");
const examSessionLogRoutes = require("./routes/examSessionLogRoutes");
const syllabusRoutes = require("./routes/syllabusRoutes");
const syllabusChapterRoutes = require("./routes/syllabusChapterRoutes");
const classSessionRoutes = require("./routes/classSessionRoutes");
const classAttendanceRoutes = require("./routes/classAttendanceRoutes");
const teacherAttendanceRoutes = require("./routes/teacherAttendanceRoutes");
const lessonProgressRoutes = require("./routes/lessonProgressRoutes");
const onlineSessionTrackingRoutes = require("./routes/onlineSessionTrackingRoutes");
const schoolReportsRoutes = require("./routes/schoolReportsRoutes");
const feeStructureRoutes = require("./routes/feeStructureRoutes");
const academicTermRoutes = require("./routes/academicTermRoutes");
const installmentPlanRoutes = require("./routes/installmentPlanRoutes");
const studentInstallmentPlanRoutes = require("./routes/studentInstallmentPlanRoutes");
const installmentRoutes = require("./routes/installmentRoutes");
const installmentPaymentRoutes = require("./routes/installmentPaymentRoutes");
const feeDiscountRoutes = require("./routes/feeDiscountRoutes");
const paymentReminderRoutes = require("./routes/paymentReminderRoutes");
const paymentGracePeriodRoutes = require("./routes/paymentGracePeriodRoutes");
const accountStatusRoutes = require("./routes/accountStatusRoutes");
const deactivationLogRoutes = require("./routes/deactivationLogRoutes");
const studentAccountAdminRoutes = require("./routes/studentAccountAdminRoutes");
const curriculumRoutes = require("./routes/curriculumRoutes");
const programRoutes = require("./routes/programRoutes");
const newsRoutes = require("./routes/newsRoutes");
const schoolServiceRoutes = require("./routes/schoolServiceRoutes");
const portalReviewRoutes = require("./routes/portalReviewRoutes");
const schoolEventRoutes = require("./routes/schoolEventRoutes");
const admissionApplicationRoutes = require("./routes/admissionApplicationRoutes");
const admissionSettingsRoutes = require("./routes/admissionSettingsRoutes");
const platformModulesRoutes = require("./routes/platformModulesRoutes");
const schoolProfileRoutes = require("./routes/schoolProfileRoutes");
const schoolPortalRoutes = require("./routes/schoolPortalRoutes");
const publicRoutes = require("./routes/publicRoutes");

const app = express();

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cors());
app.use(injectSchoolContext);

// Static file serving
const profilesUploadPath = path.join(__dirname, "..", "uploads", "profiles");
const documentsUploadPath = path.join(__dirname, "..", "uploads", "documents");
const authorsUploadPath = path.join(__dirname, "..", "uploads", "authors");
const interestGalleryUploadPath = path.join(__dirname, "..", "uploads", "interest-gallery");
const miscUploadPath = path.join(__dirname, "..", "uploads", "misc");
const postsUploadPath = path.join(__dirname, "..", "uploads", "posts");
const servicesUploadPath = path.join(__dirname, "..", "uploads", "services");
const menuUploadPath = path.join(__dirname, "..", "uploads", "menu");
const projectsUploadPath = path.join(__dirname, "..", "uploads", "projects");
const marketplaceProfilesUploadPath = path.join(__dirname, "..", "uploads", "marketplace-profiles");
const trainingEventsUploadPath = path.join(__dirname, "..", "uploads", "training-events");
const grantsUploadPath = path.join(__dirname, "..", "uploads", "grants");
const partnersUploadPath = path.join(__dirname, "..", "uploads", "partners");
const marketplaceListingsUploadPath = path.join(__dirname, "..", "uploads", "marketplace-listings");
const proctoringRecordingsUploadPath = path.join(__dirname, "..", "uploads", "proctoring-recordings");
const postersUploadPath = path.join(__dirname, "..", "uploads", "posters");
const schoolLogosUploadPath = path.join(__dirname, "..", "uploads", "school-logos");
const teacherProfilesUploadPath = path.join(__dirname, "..", "uploads", "teacher-profiles");
const studentProfilesUploadPath = path.join(__dirname, "..", "uploads", "student-profiles");
const admissionDocumentsUploadPath = path.join(__dirname, "..", "uploads", "admission-documents");

console.log("📁 Upload Paths:");
console.log(
  "  - Profiles:",
  profilesUploadPath,
  "- Exists:",
  fs.existsSync(profilesUploadPath)
);
console.log(
  "  - Documents:",
  documentsUploadPath,
  "- Exists:",
  fs.existsSync(documentsUploadPath)
);
console.log(
  "  - Authors:",
  authorsUploadPath,
  "- Exists:",
  fs.existsSync(authorsUploadPath)
);
console.log(
  "  - Interest Gallery:",
  interestGalleryUploadPath,
  "- Exists:",
  fs.existsSync(interestGalleryUploadPath)
);
console.log(
  "  - Misc:",
  miscUploadPath,
  "- Exists:",
  fs.existsSync(miscUploadPath)
);
console.log(
  "  - Posts:",
  postsUploadPath,
  "- Exists:",
  fs.existsSync(postsUploadPath)
);
console.log(
  "  - School logos:",
  schoolLogosUploadPath,
  "- Exists:",
  fs.existsSync(schoolLogosUploadPath)
);
console.log(
  "  - Teacher profiles:",
  teacherProfilesUploadPath,
  "- Exists:",
  fs.existsSync(teacherProfilesUploadPath)
);
console.log(
  "  - Student profiles:",
  studentProfilesUploadPath,
  "- Exists:",
  fs.existsSync(studentProfilesUploadPath)
);
console.log(
  "  - Admission documents:",
  admissionDocumentsUploadPath,
  "- Exists:",
  fs.existsSync(admissionDocumentsUploadPath)
);
console.log(
  "  - Services:",
  servicesUploadPath,
  "- Exists:",
  fs.existsSync(servicesUploadPath)
);

// Serve static files
app.use("/uploads/profiles", express.static(profilesUploadPath));
app.use("/uploads/documents", express.static(documentsUploadPath));
app.use("/uploads/authors", express.static(authorsUploadPath));
app.use("/uploads/interest-gallery", express.static(interestGalleryUploadPath));
app.use("/uploads/misc", express.static(miscUploadPath));
app.use("/uploads/posts", express.static(postsUploadPath));
app.use("/uploads/services", express.static(servicesUploadPath));
app.use("/uploads/menu", express.static(menuUploadPath));
app.use("/uploads/projects", express.static(projectsUploadPath));
app.use("/uploads/marketplace-profiles", express.static(marketplaceProfilesUploadPath));
app.use("/uploads/training-events", express.static(trainingEventsUploadPath));
app.use("/uploads/grants", express.static(grantsUploadPath));
app.use("/uploads/partners", express.static(partnersUploadPath));
app.use("/uploads/marketplace-listings", express.static(marketplaceListingsUploadPath));
app.use("/uploads/proctoring-recordings", express.static(proctoringRecordingsUploadPath));
app.use("/uploads/posters", express.static(postersUploadPath));
app.use("/uploads/school-logos", express.static(schoolLogosUploadPath));
app.use("/uploads/teacher-profiles", cors(), express.static(teacherProfilesUploadPath));
app.use("/uploads/student-profiles", cors(), express.static(studentProfilesUploadPath));
app.use("/uploads/admission-documents", cors(), express.static(admissionDocumentsUploadPath));

// API routes
console.log("🔗 Registering API routes...");

app.use("/api/users", userRoutes);
console.log("✅ /api/users route registered");
app.use("/api/students", studentRoutes);
console.log("✅ /api/students route registered");
app.use("/api/teachers", teacherRoutes);
console.log("✅ /api/teachers route registered");
app.use("/api/parents", parentRoutes);
console.log("✅ /api/parents route registered");
app.use("/api/student-parents", studentParentRoutes);
console.log("✅ /api/student-parents route registered");
app.use("/api/school-admins", schoolAdminRoutes);
console.log("✅ /api/school-admins route registered");
app.use("/api/departments", departmentRoutes);
console.log("✅ /api/departments route registered");
app.use("/api/grade-levels", gradeLevelRoutes);
console.log("✅ /api/grade-levels route registered");
app.use("/api/sections", sectionRoutes);
console.log("✅ /api/sections route registered");
app.use("/api/subjects", subjectRoutes);
console.log("✅ /api/subjects route registered");
app.use("/api/class-assignments", classAssignmentRoutes);
console.log("✅ /api/class-assignments route registered");
app.use("/api/enrollments", enrollmentRoutes);
console.log("✅ /api/enrollments route registered");
app.use("/api/exams", examRoutes);
console.log("✅ /api/exams route registered");
app.use("/api/exam-templates", examTemplateRoutes);
console.log("✅ /api/exam-templates route registered");
app.use("/api/exam-schedules", examScheduleRoutes);
console.log("✅ /api/exam-schedules route registered");
app.use("/api/exam-questions", examQuestionRoutes);
console.log("✅ /api/exam-questions route registered");
app.use("/api/exam-attempts", examAttemptRoutes);
console.log("✅ /api/exam-attempts route registered");
app.use("/api/student-answers", studentAnswerRoutes);
console.log("✅ /api/student-answers route registered");
app.use("/api/temporary-answers", temporaryAnswerRoutes);
console.log("✅ /api/temporary-answers route registered");
app.use("/api/proctoring-sessions", proctoringSessionRoutes);
console.log("✅ /api/proctoring-sessions route registered");
app.use("/api/proctoring-events", proctoringEventRoutes);
console.log("✅ /api/proctoring-events route registered");
app.use("/api/proctoring-recordings", proctoringRecordingRoutes);
console.log("✅ /api/proctoring-recordings route registered");
app.use("/api/academic-years", academicYearRoutes);
console.log("✅ /api/academic-years route registered");
app.use("/api/semesters", semesterRoutes);
console.log("✅ /api/semesters route registered");
app.use("/api/grading-scales", gradingScaleRoutes);
console.log("✅ /api/grading-scales route registered");
app.use("/api/assessment-exam-types", assessmentExamTypeRoutes);
console.log("✅ /api/assessment-exam-types route registered");
app.use("/api/grade-formulas", gradeFormulaRoutes);
console.log("✅ /api/grade-formulas route registered");
app.use("/api/student-exam-results", studentExamResultRoutes);
console.log("✅ /api/student-exam-results route registered");
app.use("/api/grading", gradingWorkflowRoutes);
console.log("✅ /api/grading route registered");
app.use("/api/grading-config", gradingConfigurationRoutes);
console.log("✅ /api/grading-config route registered");
app.use("/api/grading/subject-scales", subjectGradingScaleRoutes);
console.log("✅ /api/grading/subject-scales route registered");
app.use("/api/grading/overall-scales", overallGradingScaleRoutes);
console.log("✅ /api/grading/overall-scales route registered");
app.use("/api", examResultsRoutes);
console.log("✅ /api/exams/:id/results routes registered");
app.use("/api/report-cards", reportCardRoutes);
console.log("✅ /api/report-cards route registered");
app.use("/api/real-time", realTimeTrackingRoutes);
console.log("✅ /api/real-time route registered");
app.use("/api/realtime", realtimeRoutes);
console.log("✅ /api/realtime route registered");
app.use("/api/attendance-tracking", attendanceTrackingRoutes);
console.log("✅ /api/attendance-tracking route registered");
app.use("/api/exam-session-logs", examSessionLogRoutes);
console.log("✅ /api/exam-session-logs route registered");
app.use("/api/syllabi", syllabusRoutes);
console.log("✅ /api/syllabi route registered");
app.use("/api/syllabus-chapters", syllabusChapterRoutes);
console.log("✅ /api/syllabus-chapters route registered");
app.use("/api/class-sessions", classSessionRoutes);
console.log("✅ /api/class-sessions route registered");
app.use("/api/class-attendances", classAttendanceRoutes);
console.log("✅ /api/class-attendances route registered");
app.use("/api/teacher-attendances", teacherAttendanceRoutes);
console.log("✅ /api/teacher-attendances route registered");
app.use("/api/lesson-progress", lessonProgressRoutes);
console.log("✅ /api/lesson-progress route registered");
app.use("/api/online-session-tracking", onlineSessionTrackingRoutes);
console.log("✅ /api/online-session-tracking route registered");
app.use("/api/reports", schoolReportsRoutes);
console.log("✅ /api/reports route registered");
app.use("/api/fee-structures", feeStructureRoutes);
console.log("✅ /api/fee-structures route registered");
app.use("/api/academic-terms", academicTermRoutes);
console.log("✅ /api/academic-terms route registered");
app.use("/api/installment-plans", installmentPlanRoutes);
console.log("✅ /api/installment-plans route registered");
app.use("/api/student-installment-plans", studentInstallmentPlanRoutes);
console.log("✅ /api/student-installment-plans route registered");
app.use("/api/installments", installmentRoutes);
console.log("✅ /api/installments route registered");
app.use("/api/installment-payments", installmentPaymentRoutes);
console.log("✅ /api/installment-payments route registered");
app.use("/api/fee-discounts", feeDiscountRoutes);
console.log("✅ /api/fee-discounts route registered");
app.use("/api/payment-reminders", paymentReminderRoutes);
console.log("✅ /api/payment-reminders route registered");
app.use("/api/payment-grace-periods", paymentGracePeriodRoutes);
console.log("✅ /api/payment-grace-periods route registered");
app.use("/api/account-statuses", accountStatusRoutes);
console.log("✅ /api/account-statuses route registered");
app.use("/api/deactivation-logs", deactivationLogRoutes);
console.log("✅ /api/deactivation-logs route registered");
app.use("/api/student-account-admin", studentAccountAdminRoutes);
console.log("✅ /api/student-account-admin route registered");
app.use("/api/curricula", curriculumRoutes);
console.log("✅ /api/curricula route registered");
app.use("/api/programs", programRoutes);
console.log("✅ /api/programs route registered");
app.use("/api/news", newsRoutes);
console.log("✅ /api/news route registered");
app.use("/api/school-services", schoolServiceRoutes);
console.log("✅ /api/school-services route registered");
app.use("/api/portal-reviews", portalReviewRoutes);
console.log("✅ /api/portal-reviews route registered");
app.use("/api/events", schoolEventRoutes);
console.log("✅ /api/events route registered");
app.use("/api/admission-applications", admissionApplicationRoutes);
console.log("✅ /api/admission-applications route registered");
app.use("/api/admission-settings", admissionSettingsRoutes);
console.log("✅ /api/admission-settings route registered");
app.use("/api/platform", platformModulesRoutes);
console.log("✅ /api/platform route registered (LMS, live classes, notifications, etc.)");
app.use("/api/school-profile", schoolProfileRoutes);
console.log("✅ /api/school-profile route registered");
app.use("/api/school-portal", schoolPortalRoutes);
console.log("✅ /api/school-portal route registered");
app.use("/api/public", publicRoutes);
console.log("✅ /api/public route registered");

// Forgot password endpoint
app.post("/api/auth/forgot", async (req, res) => {
  try {
    const emailAddr = req.body.Email || req.body.email;

    if (!emailAddr) {
      return res.status(400).json({
        success: false,
        error: "Email is required",
      });
    }

    const user = await User.findOne({ where: { email: emailAddr } });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "No account found with this email address",
      });
    }

    // Generate a new random password (8 characters)
    const newPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await user.update({ password_hash: hashedPassword });

    // Send email with new password
    try {
      // Create transporter (using Gmail SMTP)
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "ongogokennedy89@gmail.com", // Your Gmail
          pass: "mnfj zxio cgxw zefv", // Your Gmail App Password
        },
      });

      // Email content
      const mailOptions = {
        from: "ongogokennedy89@gmail.com", // Your Gmail
        to: emailAddr,
        subject: "Password Reset - Mwalimu Hope Foundation Admin Portal",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Password Reset Request</h2>
            <p>Hello ${user.full_name},</p>
            <p>Your password has been reset for the Mwalimu Hope Foundation Admin Portal.</p>
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #666; margin-top: 0;">Your New Login Credentials:</h3>
              <p><strong>Email:</strong> ${emailAddr}</p>
              <p><strong>New Password:</strong> <code style="background-color: #e9e9e9; padding: 2px 6px; border-radius: 3px;">${newPassword}</code></p>
            </div>
            <p>Please login with these credentials and change your password immediately for security reasons.</p>
            <p>If you did not request this password reset, please contact the administrator immediately.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">This is an automated message from Mwalimu Hope Foundation Admin Portal.</p>
          </div>
        `,
      };

      // Send email
      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      // Don't fail the request if email fails, just log it silently
    }

    res.status(200).json({
      success: true,
      message: "Password reset email sent",
    });
  } catch (error) {
    console.error("Error in forgot password:", error);
    res.status(500).json({
      success: false,
      error: "Error processing password reset",
    });
  }
});
console.log("✅ /api/auth/forgot route registered");

console.log("✅ All API routes registered");

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// 404 handler for API routes (must be after all other routes)
app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({
      success: false,
      message: "API endpoint not found",
      path: req.originalUrl,
    });
  }
  next();
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Create upload directories if they don't exist
const createUploadDirectories = () => {
  const uploadDirs = [
    path.join(__dirname, "..", "uploads"),
    path.join(__dirname, "..", "uploads", "profiles"),
    path.join(__dirname, "..", "uploads", "documents"),
    path.join(__dirname, "..", "uploads", "interest-gallery"),
    path.join(__dirname, "..", "uploads", "misc"),
    path.join(__dirname, "..", "uploads", "menu"),
    path.join(__dirname, "..", "uploads", "marketplace-profiles"),
    path.join(__dirname, "..", "uploads", "training-events"),
    path.join(__dirname, "..", "uploads", "grants"),
    path.join(__dirname, "..", "uploads", "partners"),
    path.join(__dirname, "..", "uploads", "marketplace-listings"),
    path.join(__dirname, "..", "uploads", "proctoring-recordings"),
    path.join(__dirname, "..", "uploads", "posters"),
    path.join(__dirname, "..", "uploads", "posters", "news"),
    path.join(__dirname, "..", "uploads", "posters", "events"),
    path.join(__dirname, "..", "uploads", "school-logos"),
    path.join(__dirname, "..", "uploads", "teacher-profiles"),
    path.join(__dirname, "..", "uploads", "student-profiles"),
    path.join(__dirname, "..", "uploads", "admission-documents"),
  ];

  uploadDirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Created upload directory: ${dir}`);
    }
  });
};

// Initialize models and associations
const initializeApp = async () => {
  try {
    console.log("🚀 Initializing application...");

    // Create upload directories
    createUploadDirectories();
    console.log("✅ Upload directories ready");

    // Initialize database models
    await initializeModels();
    console.log("✅ Database models initialized");

    // Setup model associations
    setupAssociations();
    console.log("✅ Model associations configured");

    console.log("✅ Application initialized successfully");
    return true;
  } catch (error) {
    console.error("❌ Error initializing application:", error);
    console.error("❌ Full error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
      parent: error.parent?.message,
      original: error.original?.message,
    });
    throw error;
  }
};

// Export the initialization promise
const appInitialized = initializeApp();

module.exports = { app, appInitialized };
