const { sequelize } = require("../config/database");

const User = require("./user")(sequelize);
const Teacher = require("./teacher")(sequelize);
const Student = require("./student")(sequelize);
const Parent = require("./parent")(sequelize);
const StudentParent = require("./studentParent")(sequelize);
const SchoolAdmin = require("./schoolAdmin")(sequelize);
const GradeLevel = require("./gradeLevel")(sequelize);
const Department = require("./department")(sequelize);
const Section = require("./section")(sequelize);
const Subject = require("./subject")(sequelize);
const ClassAssignment = require("./classAssignment")(sequelize);
const Enrollment = require("./enrollment")(sequelize);
const Exam = require("./exam")(sequelize);
const ExamSchedule = require("./examSchedule")(sequelize);
const ExamQuestion = require("./examQuestion")(sequelize);
const ExamAttempt = require("./examAttempt")(sequelize);
const StudentAnswer = require("./studentAnswer")(sequelize);
const ExamSubmission = require("./examSubmission")(sequelize);
const ExamAnswer = require("./examAnswer")(sequelize);
const TemporaryAnswer = require("./temporaryAnswer")(sequelize);
const ProctoringSession = require("./proctoringSession")(sequelize);
const ProctoringEvent = require("./proctoringEvent")(sequelize);
const ProctoringRecording = require("./proctoringRecording")(sequelize);
const GradingScale = require("./gradingScale")(sequelize);
const AcademicYear = require("./academicYear")(sequelize);
const Semester = require("./semester")(sequelize);
const AssessmentExamType = require("./examType")(sequelize);
const StudentExamResult = require("./studentExamResult")(sequelize);
const SubjectAverage = require("./subjectAverage")(sequelize);
const OverallAverage = require("./overallAverage")(sequelize);
const ReportCard = require("./reportCard")(sequelize);
const ReportCardItem = require("./reportCardItem")(sequelize);
const GradeFormula = require("./gradeFormula")(sequelize);
const AttendanceTracking = require("./attendanceTracking")(sequelize);
const RealTimeActivity = require("./realTimeActivity")(sequelize);
const ExamSessionLog = require("./examSessionLog")(sequelize);
const Syllabus = require("./syllabus")(sequelize);
const SyllabusChapter = require("./syllabusChapter")(sequelize);
const TeacherAttendance = require("./teacherAttendance")(sequelize);
const TeacherDepartment = require("./teacherDepartment")(sequelize);
const TeacherCurriculumJoin = require("./teacherCurriculumJoin")(sequelize);
const TeacherCurriculumSubject = require("./teacherCurriculumSubject")(
  sequelize,
);
const TeacherTeachingCurriculumClass =
  require("./teacherTeachingCurriculumClass")(sequelize);
const ClassSession = require("./classSession")(sequelize);
const ClassAttendance = require("./classAttendance")(sequelize);
const LessonProgress = require("./lessonProgress")(sequelize);
const OnlineSessionTracking = require("./onlineSessionTracking")(sequelize);
const FeeStructure = require("./feeStructure")(sequelize);
const AcademicTerm = require("./academicTerm")(sequelize);
const InstallmentPlan = require("./installmentPlan")(sequelize);
const StudentInstallmentPlan = require("./studentInstallmentPlan")(sequelize);
const Installment = require("./installment")(sequelize);
const InstallmentPayment = require("./installmentPayment")(sequelize);
const FeeDiscount = require("./feeDiscount")(sequelize);
const PaymentReminder = require("./paymentReminder")(sequelize);
const AccountStatus = require("./accountStatus")(sequelize);
const PaymentGracePeriod = require("./paymentGracePeriod")(sequelize);
const DeactivationLog = require("./deactivationLog")(sequelize);
const Curriculum = require("./curriculum")(sequelize);
const CurriculumClass = require("./curriculumClass")(sequelize);
const CurriculumClassLevel = require("./curriculumClassLevel")(sequelize);
const CurriculumSubject = require("./curriculumSubject")(sequelize);
const CurriculumSubjectTopic = require("./curriculumSubjectTopic")(sequelize);
const CurriculumSubjectSubtopic = require("./curriculumSubjectSubtopic")(
  sequelize,
);
const CurriculumSubjectGradingBand = require("./curriculumSubjectGradingBand")(
  sequelize,
);
const CurriculumClassTimetable = require("./curriculumClassTimetable")(
  sequelize,
);
const CurriculumClassTimetableLesson =
  require("./curriculumClassTimetableLesson")(sequelize);
const Program = require("./program")(sequelize);
const News = require("./news")(sequelize);
const SchoolEvent = require("./schoolEvent")(sequelize);
const EventRegistration = require("./eventRegistration")(sequelize);
const AdmissionApplication = require("./admissionApplication")(sequelize);
const AdmissionSettings = require("./admissionSettings")(sequelize);
const LiveClass = require("./liveClass")(sequelize);
const LiveClassRecording = require("./liveClassRecording")(sequelize);
const LiveClassAttendance = require("./liveClassAttendance")(sequelize);
const LiveClassChat = require("./liveClassChat")(sequelize);
const LiveClassPoll = require("./liveClassPoll")(sequelize);
const LiveClassPollResponse = require("./liveClassPollResponse")(sequelize);
const Course = require("./course")(sequelize);
const Lesson = require("./lesson")(sequelize);
const LessonCompletion = require("./lessonCompletion")(sequelize);
const LessonResource = require("./lessonResource")(sequelize);
const CourseAssignment = require("./courseAssignment")(sequelize);
const AssignmentSubmission = require("./assignmentSubmission")(sequelize);
const CourseDiscussion = require("./courseDiscussion")(sequelize);
const DiscussionReply = require("./discussionReply")(sequelize);
const CourseEnrollment = require("./courseEnrollment")(sequelize);
const NotificationTemplate = require("./notificationTemplate")(sequelize);
const EmailQueue = require("./emailQueue")(sequelize);
const SmsQueue = require("./smsQueue")(sequelize);
const InAppNotification = require("./inAppNotification")(sequelize);
const NotificationPreference = require("./notificationPreference")(sequelize);
const BulkNotification = require("./bulkNotification")(sequelize);
const CertificateTemplate = require("./certificateTemplate")(sequelize);
const IssuedCertificate = require("./issuedCertificate")(sequelize);
const CertificateVerification = require("./certificateVerification")(sequelize);
const Badge = require("./badge")(sequelize);
const EarnedBadge = require("./earnedBadge")(sequelize);
const PaymentGateway = require("./paymentGateway")(sequelize);
const WebhookLog = require("./webhookLog")(sequelize);
const RefundRequest = require("./refundRequest")(sequelize);
const SubscriptionPlan = require("./subscriptionPlan")(sequelize);
const Subscription = require("./subscription")(sequelize);
const SystemSetting = require("./systemSetting")(sequelize);
const FeatureFlag = require("./featureFlag")(sequelize);
const AuditLog = require("./auditLog")(sequelize);
const BackupLog = require("./backupLog")(sequelize);
const ScheduledJob = require("./scheduledJob")(sequelize);
const ApiUsage = require("./apiUsage")(sequelize);
const MaintenanceMode = require("./maintenanceMode")(sequelize);
const StudentEngagement = require("./studentEngagement")(sequelize);
const TeacherPerformance = require("./teacherPerformance")(sequelize);
const ExamAnalytics = require("./examAnalytics")(sequelize);
const FinancialReport = require("./financialReport")(sequelize);
const DailyReport = require("./dailyReport")(sequelize);
const SupportTicket = require("./supportTicket")(sequelize);
const TicketReply = require("./ticketReply")(sequelize);
const KnowledgeBase = require("./knowledgeBase")(sequelize);
const Coupon = require("./coupon")(sequelize);
const CouponUsage = require("./couponUsage")(sequelize);
const Referral = require("./referral")(sequelize);
const BackgroundJob = require("./backgroundJob")(sequelize);
const ExportJob = require("./exportJob")(sequelize);
const ImportJob = require("./importJob")(sequelize);
const SchoolProfile = require("./schoolProfile")(sequelize);
const ExamTemplate = require("./examTemplate")(sequelize);

const models = {
  User,
  Teacher,
  Student,
  Parent,
  StudentParent,
  SchoolAdmin,
  GradeLevel,
  Department,
  Section,
  Subject,
  ClassAssignment,
  Enrollment,
  Exam,
  ExamSchedule,
  ExamQuestion,
  ExamAttempt,
  StudentAnswer,
  ExamSubmission,
  ExamAnswer,
  TemporaryAnswer,
  ProctoringSession,
  ProctoringEvent,
  ProctoringRecording,
  GradingScale,
  AcademicYear,
  Semester,
  AssessmentExamType,
  StudentExamResult,
  SubjectAverage,
  OverallAverage,
  ReportCard,
  ReportCardItem,
  GradeFormula,
  AttendanceTracking,
  RealTimeActivity,
  ExamSessionLog,
  Syllabus,
  SyllabusChapter,
  TeacherAttendance,
  TeacherDepartment,
  TeacherCurriculumJoin,
  TeacherCurriculumSubject,
  TeacherTeachingCurriculumClass,
  ClassSession,
  ClassAttendance,
  LessonProgress,
  OnlineSessionTracking,
  FeeStructure,
  AcademicTerm,
  InstallmentPlan,
  StudentInstallmentPlan,
  Installment,
  InstallmentPayment,
  FeeDiscount,
  PaymentReminder,
  AccountStatus,
  PaymentGracePeriod,
  DeactivationLog,
  Curriculum,
  CurriculumClass,
  CurriculumClassLevel,
  CurriculumSubject,
  CurriculumSubjectTopic,
  CurriculumSubjectSubtopic,
  CurriculumSubjectGradingBand,
  CurriculumClassTimetable,
  CurriculumClassTimetableLesson,
  Program,
  News,
  SchoolEvent,
  EventRegistration,
  AdmissionApplication,
  AdmissionSettings,
  LiveClass,
  LiveClassRecording,
  LiveClassAttendance,
  LiveClassChat,
  LiveClassPoll,
  LiveClassPollResponse,
  Course,
  Lesson,
  LessonCompletion,
  LessonResource,
  CourseAssignment,
  AssignmentSubmission,
  CourseDiscussion,
  DiscussionReply,
  CourseEnrollment,
  NotificationTemplate,
  EmailQueue,
  SmsQueue,
  InAppNotification,
  NotificationPreference,
  BulkNotification,
  CertificateTemplate,
  IssuedCertificate,
  CertificateVerification,
  Badge,
  EarnedBadge,
  PaymentGateway,
  WebhookLog,
  RefundRequest,
  SubscriptionPlan,
  Subscription,
  SystemSetting,
  FeatureFlag,
  AuditLog,
  BackupLog,
  ScheduledJob,
  ApiUsage,
  MaintenanceMode,
  StudentEngagement,
  TeacherPerformance,
  ExamAnalytics,
  FinancialReport,
  DailyReport,
  SupportTicket,
  TicketReply,
  KnowledgeBase,
  Coupon,
  CouponUsage,
  Referral,
  BackgroundJob,
  ExportJob,
  ImportJob,
  SchoolProfile,
  ExamTemplate,
};

const initializeModels = async () => {
  try {
    console.log("🔄 Creating/updating school system tables...");
    await User.sync({ force: false, alter: false });
    await Teacher.sync({ force: false, alter: false });
    await Student.sync({ force: false, alter: false });
    await Parent.sync({ force: false, alter: false });
    await StudentParent.sync({ force: false, alter: false });
    await SchoolAdmin.sync({ force: false, alter: false });
    await GradeLevel.sync({ force: false, alter: false });
    await Department.sync({ force: false, alter: false });
    await AcademicYear.sync({ force: false, alter: false });
    await Semester.sync({ force: false, alter: false });
    await GradingScale.sync({ force: false, alter: false });
    await AssessmentExamType.sync({ force: false, alter: false });
    await GradeFormula.sync({ force: false, alter: false });
    await StudentExamResult.sync({ force: false, alter: false });
    await SubjectAverage.sync({ force: false, alter: false });
    await OverallAverage.sync({ force: false, alter: false });
    await ReportCard.sync({ force: false, alter: false });
    await ReportCardItem.sync({ force: false, alter: false });
    await Syllabus.sync({ force: false, alter: false });
    await SyllabusChapter.sync({ force: false, alter: false });
    await TeacherAttendance.sync({ force: false, alter: false });
    await ClassSession.sync({ force: false, alter: false });
    await ClassAttendance.sync({ force: false, alter: false });
    await LessonProgress.sync({ force: false, alter: false });
    await OnlineSessionTracking.sync({ force: false, alter: false });
    await FeeStructure.sync({ force: false, alter: false });
    await AcademicTerm.sync({ force: false, alter: false });
    await SchoolProfile.sync({ force: false, alter: false });
    await ExamTemplate.sync({ force: false, alter: false });
    await Exam.sync({ force: false, alter: false });
    await ExamSchedule.sync({ force: false, alter: true });
    await ExamQuestion.sync({ force: false, alter: false });
    await ExamSubmission.sync({ force: false, alter: false });
    await ExamAnswer.sync({ force: false, alter: false });
    await InstallmentPlan.sync({ force: false, alter: false });
    await StudentInstallmentPlan.sync({ force: false, alter: false });
    await Installment.sync({ force: false, alter: false });
    await InstallmentPayment.sync({ force: false, alter: false });
    await FeeDiscount.sync({ force: false, alter: false });
    await PaymentReminder.sync({ force: false, alter: false });
    await PaymentGracePeriod.sync({ force: false, alter: false });
    await AccountStatus.sync({ force: false, alter: false });
    await DeactivationLog.sync({ force: false, alter: false });
    await Curriculum.sync({ force: false, alter: false });
    await CurriculumClass.sync({ force: false, alter: false });
    await CurriculumClassLevel.sync({ force: false, alter: false });
    await CurriculumSubject.sync({ force: false, alter: false });
    await CurriculumSubjectTopic.sync({ force: false, alter: false });
    await CurriculumSubjectSubtopic.sync({ force: false, alter: false });
    await CurriculumSubjectGradingBand.sync({ force: false, alter: false });
    await TeacherDepartment.sync({ force: false, alter: false });
    await TeacherCurriculumJoin.sync({ force: false, alter: false });
    await TeacherCurriculumSubject.sync({ force: false, alter: false });
    await TeacherTeachingCurriculumClass.sync({ force: false, alter: false });
    await CurriculumClassTimetable.sync({ force: false, alter: false });
    await CurriculumClassTimetableLesson.sync({ force: false, alter: false });
    await Program.sync({ force: false, alter: false });
    await News.sync({ force: false, alter: false });
    await SchoolEvent.sync({ force: false, alter: false });
    await EventRegistration.sync({ force: false, alter: false });
    await AdmissionApplication.sync({ force: false, alter: false });
    await AdmissionSettings.sync({ force: false, alter: false });

    await PaymentGateway.sync({ force: false, alter: false });
    await WebhookLog.sync({ force: false, alter: false });
    await RefundRequest.sync({ force: false, alter: false });

    await NotificationTemplate.sync({ force: false, alter: false });
    await EmailQueue.sync({ force: false, alter: false });
    await SmsQueue.sync({ force: false, alter: false });
    await InAppNotification.sync({ force: false, alter: false });
    await NotificationPreference.sync({ force: false, alter: false });
    await BulkNotification.sync({ force: false, alter: false });

    await CertificateTemplate.sync({ force: false, alter: false });
    await IssuedCertificate.sync({ force: false, alter: false });
    await CertificateVerification.sync({ force: false, alter: false });
    await Badge.sync({ force: false, alter: false });
    await EarnedBadge.sync({ force: false, alter: false });

    await SubscriptionPlan.sync({ force: false, alter: false });
    await Subscription.sync({ force: false, alter: false });

    await SystemSetting.sync({ force: false, alter: false });
    await FeatureFlag.sync({ force: false, alter: false });
    await AuditLog.sync({ force: false, alter: false });
    await BackupLog.sync({ force: false, alter: false });
    await ScheduledJob.sync({ force: false, alter: false });
    await ApiUsage.sync({ force: false, alter: false });
    await MaintenanceMode.sync({ force: false, alter: false });

    await StudentEngagement.sync({ force: false, alter: false });
    await TeacherPerformance.sync({ force: false, alter: false });
    await ExamAnalytics.sync({ force: false, alter: false });
    await FinancialReport.sync({ force: false, alter: false });
    await DailyReport.sync({ force: false, alter: false });

    await SupportTicket.sync({ force: false, alter: false });
    await TicketReply.sync({ force: false, alter: false });
    await KnowledgeBase.sync({ force: false, alter: false });

    await Coupon.sync({ force: false, alter: false });
    await CouponUsage.sync({ force: false, alter: false });
    await Referral.sync({ force: false, alter: false });

    await BackgroundJob.sync({ force: false, alter: false });
    await ExportJob.sync({ force: false, alter: false });
    await ImportJob.sync({ force: false, alter: false });

    await Course.sync({ force: false, alter: false });
    await Lesson.sync({ force: false, alter: false });
    await LessonCompletion.sync({ force: false, alter: false });
    await LessonResource.sync({ force: false, alter: false });
    await CourseAssignment.sync({ force: false, alter: false });
    await AssignmentSubmission.sync({ force: false, alter: false });
    await CourseDiscussion.sync({ force: false, alter: false });
    await DiscussionReply.sync({ force: false, alter: false });
    await CourseEnrollment.sync({ force: false, alter: false });

    await LiveClass.sync({ force: false, alter: false });
    await LiveClassRecording.sync({ force: false, alter: false });
    await LiveClassAttendance.sync({ force: false, alter: false });
    await LiveClassChat.sync({ force: false, alter: false });
    await LiveClassPoll.sync({ force: false, alter: false });
    await LiveClassPollResponse.sync({ force: false, alter: false });

    console.log("✅ All models synced successfully");
  } catch (error) {
    console.error("❌ Error syncing models:", error);
    throw error;
  }
};

const setupAssociations = () => {
  try {
    User.hasOne(Student, {
      foreignKey: "user_id",
      onDelete: "CASCADE",
      as: "student_profile",
    });
    Student.belongsTo(User, { foreignKey: "user_id", as: "user" });

    User.hasOne(Teacher, {
      foreignKey: "user_id",
      onDelete: "CASCADE",
      as: "teacher_profile",
    });
    Teacher.belongsTo(User, { foreignKey: "user_id", as: "user" });

    User.hasOne(Parent, {
      foreignKey: "user_id",
      onDelete: "CASCADE",
      as: "parent_profile",
    });
    Parent.belongsTo(User, { foreignKey: "user_id", as: "user" });

    User.hasOne(SchoolAdmin, {
      foreignKey: "user_id",
      onDelete: "CASCADE",
      as: "school_admin_profile",
    });
    SchoolAdmin.belongsTo(User, { foreignKey: "user_id", as: "user" });

    Student.belongsToMany(Parent, {
      through: StudentParent,
      foreignKey: "student_id",
      otherKey: "parent_id",
      as: "parents",
    });
    Parent.belongsToMany(Student, {
      through: StudentParent,
      foreignKey: "parent_id",
      otherKey: "student_id",
      as: "students",
    });

    Teacher.hasMany(Student, {
      foreignKey: "class_teacher_id",
      as: "class_students",
    });
    Student.belongsTo(Teacher, {
      foreignKey: "class_teacher_id",
      as: "class_teacher",
    });

    Curriculum.hasMany(Student, {
      foreignKey: "curriculum_id",
      as: "students",
    });
    Student.belongsTo(Curriculum, {
      foreignKey: "curriculum_id",
      as: "curriculum",
    });

    CurriculumClass.hasMany(Student, {
      foreignKey: "curriculum_class_id",
      as: "students",
    });
    Student.belongsTo(CurriculumClass, {
      foreignKey: "curriculum_class_id",
      as: "curriculum_class",
    });

    Department.hasMany(Subject, {
      foreignKey: "department_id",
      as: "subjects",
    });
    Subject.belongsTo(Department, {
      foreignKey: "department_id",
      as: "department",
    });

    Department.belongsTo(Teacher, {
      foreignKey: "head_of_department",
      as: "HOD",
    });
    Teacher.hasMany(Department, {
      foreignKey: "head_of_department",
      as: "headed_departments",
    });

    GradeLevel.hasMany(Section, {
      foreignKey: "grade_level_id",
      as: "sections",
    });
    Section.belongsTo(GradeLevel, {
      foreignKey: "grade_level_id",
      as: "grade_level",
    });

    Section.belongsTo(Teacher, {
      foreignKey: "class_teacher_id",
      as: "ClassTeacher",
    });
    Teacher.hasMany(Section, {
      foreignKey: "class_teacher_id",
      as: "ClassesTeaching",
    });

    Section.hasMany(Enrollment, {
      foreignKey: "section_id",
      as: "enrollments",
    });
    Enrollment.belongsTo(Section, { foreignKey: "section_id", as: "section" });

    Student.hasMany(Enrollment, {
      foreignKey: "student_id",
      as: "enrollments",
    });
    Enrollment.belongsTo(Student, { foreignKey: "student_id", as: "student" });

    Section.hasMany(ClassAssignment, {
      foreignKey: "section_id",
      as: "class_assignments",
    });
    ClassAssignment.belongsTo(Section, {
      foreignKey: "section_id",
      as: "section",
    });

    Subject.hasMany(ClassAssignment, {
      foreignKey: "subject_id",
      as: "class_assignments",
    });
    ClassAssignment.belongsTo(Subject, {
      foreignKey: "subject_id",
      as: "subject",
    });

    Teacher.hasMany(ClassAssignment, {
      foreignKey: "teacher_id",
      as: "class_assignments",
    });
    ClassAssignment.belongsTo(Teacher, {
      foreignKey: "teacher_id",
      as: "teacher",
    });

    User.hasMany(Exam, { foreignKey: "created_by", as: "created_exams" });
    Exam.belongsTo(User, { foreignKey: "created_by", as: "creator" });
    ExamTemplate.hasMany(Exam, { foreignKey: "template_id", as: "exams" });
    Exam.belongsTo(ExamTemplate, { foreignKey: "template_id", as: "template" });

    Exam.hasMany(ExamSchedule, { foreignKey: "exam_id", as: "schedules" });
    ExamSchedule.belongsTo(Exam, { foreignKey: "exam_id", as: "exam" });
    Curriculum.hasMany(ExamSchedule, { foreignKey: "curriculum_id", as: "exam_schedules" });
    ExamSchedule.belongsTo(Curriculum, { foreignKey: "curriculum_id", as: "curriculum" });
    CurriculumClass.hasMany(ExamSchedule, { foreignKey: "curriculum_class_id", as: "exam_schedules" });
    ExamSchedule.belongsTo(CurriculumClass, { foreignKey: "curriculum_class_id", as: "curriculum_class" });
    CurriculumClassLevel.hasMany(ExamSchedule, { foreignKey: "curriculum_class_level_id", as: "exam_schedules" });
    ExamSchedule.belongsTo(CurriculumClassLevel, { foreignKey: "curriculum_class_level_id", as: "curriculum_class_level" });

    Teacher.hasMany(ExamSchedule, {
      foreignKey: "teacher_id",
      as: "exam_schedules",
    });
    ExamSchedule.belongsTo(Teacher, {
      foreignKey: "teacher_id",
      as: "teacher",
    });

    Exam.hasMany(ExamQuestion, { foreignKey: "exam_id", as: "questions" });
    ExamQuestion.belongsTo(Exam, { foreignKey: "exam_id", as: "exam" });

    Exam.hasMany(ExamAttempt, { foreignKey: "exam_id", as: "attempts" });
    ExamAttempt.belongsTo(Exam, { foreignKey: "exam_id", as: "exam" });

    Student.hasMany(ExamAttempt, {
      foreignKey: "student_id",
      as: "exam_attempts",
    });
    ExamAttempt.belongsTo(Student, { foreignKey: "student_id", as: "student" });

    ExamSchedule.hasMany(ExamAttempt, {
      foreignKey: "exam_schedule_id",
      as: "attempts",
    });
    ExamAttempt.belongsTo(ExamSchedule, {
      foreignKey: "exam_schedule_id",
      as: "exam_schedule",
    });

    ExamAttempt.hasMany(StudentAnswer, {
      foreignKey: "exam_attempt_id",
      as: "answers",
    });
    StudentAnswer.belongsTo(ExamAttempt, {
      foreignKey: "exam_attempt_id",
      as: "exam_attempt",
    });

    ExamQuestion.hasMany(StudentAnswer, {
      foreignKey: "question_id",
      as: "student_answers",
    });
    StudentAnswer.belongsTo(ExamQuestion, {
      foreignKey: "question_id",
      as: "question",
    });

    User.hasMany(StudentAnswer, {
      foreignKey: "graded_by",
      as: "graded_answers",
    });
    StudentAnswer.belongsTo(User, { foreignKey: "graded_by", as: "grader" });

    Exam.hasMany(ExamSubmission, {
      foreignKey: "exam_id",
      as: "submissions",
    });
    ExamSubmission.belongsTo(Exam, {
      foreignKey: "exam_id",
      as: "exam",
    });
    Student.hasMany(ExamSubmission, {
      foreignKey: "student_id",
      as: "exam_submissions",
    });
    ExamSubmission.belongsTo(Student, {
      foreignKey: "student_id",
      as: "student",
    });

    ExamSubmission.hasMany(ExamAnswer, {
      foreignKey: "submission_id",
      as: "answers",
    });
    ExamAnswer.belongsTo(ExamSubmission, {
      foreignKey: "submission_id",
      as: "submission",
    });
    ExamQuestion.hasMany(ExamAnswer, {
      foreignKey: "question_id",
      as: "exam_answers",
    });
    ExamAnswer.belongsTo(ExamQuestion, {
      foreignKey: "question_id",
      as: "question",
    });

    ExamAttempt.hasMany(TemporaryAnswer, {
      foreignKey: "exam_attempt_id",
      as: "temporary_answers",
    });
    TemporaryAnswer.belongsTo(ExamAttempt, {
      foreignKey: "exam_attempt_id",
      as: "exam_attempt",
    });

    ExamQuestion.hasMany(TemporaryAnswer, {
      foreignKey: "question_id",
      as: "temporary_answers",
    });
    TemporaryAnswer.belongsTo(ExamQuestion, {
      foreignKey: "question_id",
      as: "question",
    });

    ExamAttempt.hasOne(ProctoringSession, {
      foreignKey: "exam_attempt_id",
      as: "proctoring_session",
    });
    ProctoringSession.belongsTo(ExamAttempt, {
      foreignKey: "exam_attempt_id",
      as: "exam_attempt",
    });

    Student.hasMany(AttendanceTracking, {
      foreignKey: "student_id",
      as: "attendance_trackings",
    });
    AttendanceTracking.belongsTo(Student, {
      foreignKey: "student_id",
      as: "student",
    });

    ClassAssignment.hasMany(AttendanceTracking, {
      foreignKey: "class_assignment_id",
      as: "attendance_trackings",
    });
    AttendanceTracking.belongsTo(ClassAssignment, {
      foreignKey: "class_assignment_id",
      as: "class_assignment",
    });

    Student.hasMany(RealTimeActivity, {
      foreignKey: "student_id",
      as: "real_time_activities",
    });
    RealTimeActivity.belongsTo(Student, {
      foreignKey: "student_id",
      as: "student",
    });

    ExamAttempt.hasMany(ExamSessionLog, {
      foreignKey: "exam_attempt_id",
      as: "session_logs",
    });
    ExamSessionLog.belongsTo(ExamAttempt, {
      foreignKey: "exam_attempt_id",
      as: "exam_attempt",
    });

    ExamQuestion.hasMany(ExamSessionLog, {
      foreignKey: "question_id",
      as: "session_logs",
    });
    ExamSessionLog.belongsTo(ExamQuestion, {
      foreignKey: "question_id",
      as: "question",
    });

    ProctoringSession.hasMany(ProctoringEvent, {
      foreignKey: "proctoring_session_id",
      as: "events",
    });
    ProctoringEvent.belongsTo(ProctoringSession, {
      foreignKey: "proctoring_session_id",
      as: "proctoring_session",
    });

    ProctoringSession.hasMany(ProctoringRecording, {
      foreignKey: "proctoring_session_id",
      as: "recordings",
    });
    ProctoringRecording.belongsTo(ProctoringSession, {
      foreignKey: "proctoring_session_id",
      as: "proctoring_session",
    });

    User.hasMany(ProctoringEvent, {
      foreignKey: "resolved_by",
      as: "resolved_proctoring_events",
    });
    ProctoringEvent.belongsTo(User, {
      foreignKey: "resolved_by",
      as: "resolver",
    });

    AcademicYear.hasMany(Semester, {
      foreignKey: "academic_year_id",
      as: "semesters",
    });
    Semester.belongsTo(AcademicYear, {
      foreignKey: "academic_year_id",
      as: "academic_year",
    });

    GradeLevel.hasMany(GradeFormula, {
      foreignKey: "grade_level_id",
      as: "grade_formulas",
    });
    GradeFormula.belongsTo(GradeLevel, {
      foreignKey: "grade_level_id",
      as: "grade_level",
    });

    Student.hasMany(StudentExamResult, {
      foreignKey: "student_id",
      as: "exam_results",
    });
    StudentExamResult.belongsTo(Student, {
      foreignKey: "student_id",
      as: "student",
    });

    Subject.hasMany(StudentExamResult, {
      foreignKey: "subject_id",
      as: "student_exam_results",
    });
    StudentExamResult.belongsTo(Subject, {
      foreignKey: "subject_id",
      as: "subject",
    });

    ExamAttempt.hasMany(StudentExamResult, {
      foreignKey: "exam_attempt_id",
      as: "grading_records",
    });
    StudentExamResult.belongsTo(ExamAttempt, {
      foreignKey: "exam_attempt_id",
      as: "exam_attempt",
    });

    AssessmentExamType.hasMany(StudentExamResult, {
      foreignKey: "exam_type_id",
      as: "student_results",
    });
    StudentExamResult.belongsTo(AssessmentExamType, {
      foreignKey: "exam_type_id",
      as: "assessment_exam_type",
    });

    Semester.hasMany(StudentExamResult, {
      foreignKey: "semester_id",
      as: "student_exam_results",
    });
    StudentExamResult.belongsTo(Semester, {
      foreignKey: "semester_id",
      as: "semester",
    });

    Student.hasMany(SubjectAverage, {
      foreignKey: "student_id",
      as: "subject_averages",
    });
    SubjectAverage.belongsTo(Student, {
      foreignKey: "student_id",
      as: "student",
    });

    Subject.hasMany(SubjectAverage, {
      foreignKey: "subject_id",
      as: "subject_averages",
    });
    SubjectAverage.belongsTo(Subject, {
      foreignKey: "subject_id",
      as: "subject",
    });

    Semester.hasMany(SubjectAverage, {
      foreignKey: "semester_id",
      as: "subject_averages",
    });
    SubjectAverage.belongsTo(Semester, {
      foreignKey: "semester_id",
      as: "semester",
    });

    AcademicYear.hasMany(SubjectAverage, {
      foreignKey: "academic_year_id",
      as: "subject_averages",
    });
    SubjectAverage.belongsTo(AcademicYear, {
      foreignKey: "academic_year_id",
      as: "academic_year",
    });

    Student.hasMany(OverallAverage, {
      foreignKey: "student_id",
      as: "overall_averages",
    });
    OverallAverage.belongsTo(Student, {
      foreignKey: "student_id",
      as: "student",
    });

    Semester.hasMany(OverallAverage, {
      foreignKey: "semester_id",
      as: "overall_averages",
    });
    OverallAverage.belongsTo(Semester, {
      foreignKey: "semester_id",
      as: "semester",
    });

    AcademicYear.hasMany(OverallAverage, {
      foreignKey: "academic_year_id",
      as: "overall_averages",
    });
    OverallAverage.belongsTo(AcademicYear, {
      foreignKey: "academic_year_id",
      as: "academic_year",
    });

    Student.hasMany(ReportCard, {
      foreignKey: "student_id",
      as: "report_cards",
    });
    ReportCard.belongsTo(Student, { foreignKey: "student_id", as: "student" });

    Semester.hasMany(ReportCard, {
      foreignKey: "semester_id",
      as: "report_cards",
    });
    ReportCard.belongsTo(Semester, {
      foreignKey: "semester_id",
      as: "semester",
    });

    AcademicYear.hasMany(ReportCard, {
      foreignKey: "academic_year_id",
      as: "report_cards",
    });
    ReportCard.belongsTo(AcademicYear, {
      foreignKey: "academic_year_id",
      as: "academic_year",
    });

    ReportCard.hasMany(ReportCardItem, {
      foreignKey: "report_card_id",
      as: "items",
    });
    ReportCardItem.belongsTo(ReportCard, {
      foreignKey: "report_card_id",
      as: "report_card",
    });

    Subject.hasMany(ReportCardItem, {
      foreignKey: "subject_id",
      as: "report_card_items",
    });
    ReportCardItem.belongsTo(Subject, {
      foreignKey: "subject_id",
      as: "subject",
    });

    ClassAssignment.hasMany(Syllabus, {
      foreignKey: "class_assignment_id",
      as: "syllabi",
    });
    Syllabus.belongsTo(ClassAssignment, {
      foreignKey: "class_assignment_id",
      as: "class_assignment",
    });

    AcademicYear.hasMany(Syllabus, {
      foreignKey: "academic_year_id",
      as: "syllabi",
    });
    Syllabus.belongsTo(AcademicYear, {
      foreignKey: "academic_year_id",
      as: "academic_year",
    });

    Semester.hasMany(Syllabus, { foreignKey: "semester_id", as: "syllabi" });
    Syllabus.belongsTo(Semester, { foreignKey: "semester_id", as: "semester" });

    User.hasMany(Syllabus, {
      foreignKey: "published_by",
      as: "published_syllabi",
    });
    Syllabus.belongsTo(User, { foreignKey: "published_by", as: "publisher" });

    Syllabus.hasMany(SyllabusChapter, {
      foreignKey: "syllabus_id",
      as: "syllabus_chapters",
    });
    SyllabusChapter.belongsTo(Syllabus, {
      foreignKey: "syllabus_id",
      as: "syllabus",
    });

    Teacher.hasMany(TeacherAttendance, {
      foreignKey: "teacher_id",
      as: "teacher_attendances",
    });
    TeacherAttendance.belongsTo(Teacher, {
      foreignKey: "teacher_id",
      as: "teacher",
    });

    User.hasMany(TeacherAttendance, {
      foreignKey: "approved_by",
      as: "approved_teacher_attendances",
    });
    TeacherAttendance.belongsTo(User, {
      foreignKey: "approved_by",
      as: "approver",
    });

    ClassAssignment.hasMany(ClassSession, {
      foreignKey: "class_assignment_id",
      as: "class_sessions",
    });
    ClassSession.belongsTo(ClassAssignment, {
      foreignKey: "class_assignment_id",
      as: "class_assignment",
    });

    Teacher.hasMany(ClassSession, {
      foreignKey: "teacher_id",
      as: "class_sessions",
    });
    ClassSession.belongsTo(Teacher, {
      foreignKey: "teacher_id",
      as: "teacher",
    });

    Section.hasMany(ClassSession, {
      foreignKey: "section_id",
      as: "class_sessions",
    });
    ClassSession.belongsTo(Section, {
      foreignKey: "section_id",
      as: "section",
    });

    Subject.hasMany(ClassSession, {
      foreignKey: "subject_id",
      as: "class_sessions",
    });
    ClassSession.belongsTo(Subject, {
      foreignKey: "subject_id",
      as: "subject",
    });

    SyllabusChapter.hasMany(ClassSession, {
      foreignKey: "syllabus_chapter_id",
      as: "class_sessions",
    });
    ClassSession.belongsTo(SyllabusChapter, {
      foreignKey: "syllabus_chapter_id",
      as: "syllabus_chapter",
    });

    ClassSession.hasMany(ClassAttendance, {
      foreignKey: "class_session_id",
      as: "class_attendances",
    });
    ClassAttendance.belongsTo(ClassSession, {
      foreignKey: "class_session_id",
      as: "class_session",
    });

    Student.hasMany(ClassAttendance, {
      foreignKey: "student_id",
      as: "class_attendances",
    });
    ClassAttendance.belongsTo(Student, {
      foreignKey: "student_id",
      as: "student",
    });

    SyllabusChapter.hasMany(LessonProgress, {
      foreignKey: "syllabus_chapter_id",
      as: "lesson_progresses",
    });
    LessonProgress.belongsTo(SyllabusChapter, {
      foreignKey: "syllabus_chapter_id",
      as: "syllabus_chapter",
    });

    ClassSession.hasMany(LessonProgress, {
      foreignKey: "class_session_id",
      as: "lesson_progresses",
    });
    LessonProgress.belongsTo(ClassSession, {
      foreignKey: "class_session_id",
      as: "class_session",
    });

    ClassSession.hasMany(OnlineSessionTracking, {
      foreignKey: "class_session_id",
      as: "online_session_trackings",
    });
    OnlineSessionTracking.belongsTo(ClassSession, {
      foreignKey: "class_session_id",
      as: "class_session",
    });

    Student.hasMany(OnlineSessionTracking, {
      foreignKey: "student_id",
      as: "online_session_trackings",
    });
    OnlineSessionTracking.belongsTo(Student, {
      foreignKey: "student_id",
      as: "student",
    });

    Curriculum.hasMany(FeeStructure, {
      foreignKey: "curriculum_id",
      as: "fee_structures",
    });
    FeeStructure.belongsTo(Curriculum, {
      foreignKey: "curriculum_id",
      as: "curriculum",
    });
    CurriculumClass.hasMany(FeeStructure, {
      foreignKey: "curriculum_class_id",
      as: "fee_structures",
    });
    FeeStructure.belongsTo(CurriculumClass, {
      foreignKey: "curriculum_class_id",
      as: "curriculum_class",
    });
    CurriculumClassLevel.hasMany(FeeStructure, {
      foreignKey: "curriculum_class_level_id",
      as: "fee_structures",
    });
    FeeStructure.belongsTo(CurriculumClassLevel, {
      foreignKey: "curriculum_class_level_id",
      as: "curriculum_class_level",
    });

    AcademicYear.hasMany(AcademicTerm, {
      foreignKey: "academic_year_id",
      as: "academic_terms",
    });
    AcademicTerm.belongsTo(AcademicYear, {
      foreignKey: "academic_year_id",
      as: "academic_year",
    });

    AcademicTerm.hasMany(Installment, {
      foreignKey: "term_id",
      as: "installments",
    });
    Installment.belongsTo(AcademicTerm, { foreignKey: "term_id", as: "term" });

    AcademicTerm.hasMany(StudentInstallmentPlan, {
      foreignKey: "term_id",
      as: "student_installment_plans",
    });
    StudentInstallmentPlan.belongsTo(AcademicTerm, {
      foreignKey: "term_id",
      as: "term",
    });

    AcademicTerm.hasMany(FeeDiscount, {
      foreignKey: "term_id",
      as: "fee_discounts",
    });
    FeeDiscount.belongsTo(AcademicTerm, { foreignKey: "term_id", as: "term" });

    InstallmentPlan.hasMany(StudentInstallmentPlan, {
      foreignKey: "installment_plan_id",
      as: "student_installment_plans",
    });
    StudentInstallmentPlan.belongsTo(InstallmentPlan, {
      foreignKey: "installment_plan_id",
      as: "plan",
    });

    Student.hasMany(StudentInstallmentPlan, {
      foreignKey: "student_id",
      as: "student_installment_plans",
    });
    StudentInstallmentPlan.belongsTo(Student, {
      foreignKey: "student_id",
      as: "student",
    });

    AcademicYear.hasMany(StudentInstallmentPlan, {
      foreignKey: "academic_year_id",
      as: "student_installment_plans",
    });
    StudentInstallmentPlan.belongsTo(AcademicYear, {
      foreignKey: "academic_year_id",
      as: "academic_year",
    });

    Student.hasMany(Installment, {
      foreignKey: "student_id",
      as: "installments",
    });
    Installment.belongsTo(Student, { foreignKey: "student_id", as: "student" });

    AcademicYear.hasMany(Installment, {
      foreignKey: "academic_year_id",
      as: "installments",
    });
    Installment.belongsTo(AcademicYear, {
      foreignKey: "academic_year_id",
      as: "academic_year",
    });

    Installment.hasMany(InstallmentPayment, {
      foreignKey: "installment_id",
      as: "payments",
    });
    InstallmentPayment.belongsTo(Installment, {
      foreignKey: "installment_id",
      as: "installment",
    });

    Parent.hasMany(InstallmentPayment, {
      foreignKey: "parent_id",
      as: "installment_payments",
    });
    InstallmentPayment.belongsTo(Parent, {
      foreignKey: "parent_id",
      as: "parent",
    });

    Student.hasMany(InstallmentPayment, {
      foreignKey: "student_id",
      as: "installment_payments",
    });
    InstallmentPayment.belongsTo(Student, {
      foreignKey: "student_id",
      as: "student",
    });

    User.hasMany(InstallmentPayment, {
      foreignKey: "recorded_by",
      as: "recorded_installment_payments",
    });
    InstallmentPayment.belongsTo(User, {
      foreignKey: "recorded_by",
      as: "recorder",
    });

    Student.hasMany(FeeDiscount, {
      foreignKey: "student_id",
      as: "fee_discounts",
    });
    FeeDiscount.belongsTo(Student, { foreignKey: "student_id", as: "student" });

    AcademicYear.hasMany(FeeDiscount, {
      foreignKey: "academic_year_id",
      as: "fee_discounts",
    });
    FeeDiscount.belongsTo(AcademicYear, {
      foreignKey: "academic_year_id",
      as: "academic_year",
    });

    User.hasMany(FeeDiscount, {
      foreignKey: "approved_by",
      as: "approved_fee_discounts",
    });
    FeeDiscount.belongsTo(User, { foreignKey: "approved_by", as: "approver" });

    Installment.hasMany(PaymentReminder, {
      foreignKey: "installment_id",
      as: "payment_reminders",
    });
    PaymentReminder.belongsTo(Installment, {
      foreignKey: "installment_id",
      as: "installment",
    });

    Parent.hasMany(PaymentReminder, {
      foreignKey: "parent_id",
      as: "payment_reminders",
    });
    PaymentReminder.belongsTo(Parent, {
      foreignKey: "parent_id",
      as: "parent",
    });

    AcademicYear.hasMany(PaymentGracePeriod, {
      foreignKey: "academic_year_id",
      as: "payment_grace_periods",
    });
    PaymentGracePeriod.belongsTo(AcademicYear, {
      foreignKey: "academic_year_id",
      as: "academic_year",
    });

    AcademicTerm.hasMany(PaymentGracePeriod, {
      foreignKey: "term_id",
      as: "payment_grace_periods",
    });
    PaymentGracePeriod.belongsTo(AcademicTerm, {
      foreignKey: "term_id",
      as: "term",
    });

    Student.hasMany(AccountStatus, {
      foreignKey: "student_id",
      as: "account_status_history",
    });
    AccountStatus.belongsTo(Student, {
      foreignKey: "student_id",
      as: "student",
    });

    Student.hasMany(DeactivationLog, {
      foreignKey: "student_id",
      as: "deactivation_logs",
    });
    DeactivationLog.belongsTo(Student, {
      foreignKey: "student_id",
      as: "student",
    });

    Parent.hasMany(DeactivationLog, {
      foreignKey: "parent_id",
      as: "deactivation_logs",
    });
    DeactivationLog.belongsTo(Parent, {
      foreignKey: "parent_id",
      as: "parent",
    });

    Installment.hasMany(DeactivationLog, {
      foreignKey: "installment_id",
      as: "deactivation_logs",
    });
    DeactivationLog.belongsTo(Installment, {
      foreignKey: "installment_id",
      as: "installment",
    });

    User.hasMany(DeactivationLog, {
      foreignKey: "performed_by",
      as: "deactivation_actions",
    });
    DeactivationLog.belongsTo(User, {
      foreignKey: "performed_by",
      as: "performer",
    });

    Curriculum.hasMany(Program, {
      foreignKey: "curriculum_id",
      as: "programs",
    });
    Program.belongsTo(Curriculum, {
      foreignKey: "curriculum_id",
      as: "curriculum",
    });

    Curriculum.hasMany(CurriculumClass, {
      foreignKey: "curriculum_id",
      as: "curriculum_classes",
    });
    CurriculumClass.belongsTo(Curriculum, {
      foreignKey: "curriculum_id",
      as: "curriculum",
    });

    Curriculum.hasMany(CurriculumSubject, {
      foreignKey: "curriculum_id",
      as: "curriculum_subjects",
    });
    CurriculumSubject.belongsTo(Curriculum, {
      foreignKey: "curriculum_id",
      as: "curriculum",
    });
    CurriculumClass.hasMany(CurriculumClassLevel, {
      foreignKey: "curriculum_class_id",
      as: "curriculum_class_levels",
    });
    CurriculumClassLevel.belongsTo(CurriculumClass, {
      foreignKey: "curriculum_class_id",
      as: "curriculum_class",
    });

    CurriculumClass.hasMany(CurriculumSubject, {
      foreignKey: "curriculum_class_id",
      as: "curriculum_subjects",
    });
    CurriculumSubject.belongsTo(CurriculumClass, {
      foreignKey: "curriculum_class_id",
      as: "curriculum_class",
    });

    CurriculumClassLevel.hasMany(CurriculumSubject, {
      foreignKey: "curriculum_class_level_id",
      as: "curriculum_subjects",
    });
    CurriculumSubject.belongsTo(CurriculumClassLevel, {
      foreignKey: "curriculum_class_level_id",
      as: "curriculum_class_level",
    });

    Subject.hasMany(CurriculumSubject, {
      foreignKey: "subject_id",
      as: "curriculum_offerings",
    });
    CurriculumSubject.belongsTo(Subject, {
      foreignKey: "subject_id",
      as: "catalog_subject",
    });

    Teacher.belongsToMany(Department, {
      through: TeacherDepartment,
      foreignKey: "teacher_id",
      otherKey: "department_id",
      as: "departments",
    });
    Department.belongsToMany(Teacher, {
      through: TeacherDepartment,
      foreignKey: "department_id",
      otherKey: "teacher_id",
      as: "staff_teachers",
    });

    Teacher.belongsToMany(Curriculum, {
      through: TeacherCurriculumJoin,
      foreignKey: "teacher_id",
      otherKey: "curriculum_id",
      as: "teaching_curricula",
    });
    Curriculum.belongsToMany(Teacher, {
      through: TeacherCurriculumJoin,
      foreignKey: "curriculum_id",
      otherKey: "teacher_id",
      as: "teachers",
    });

    Teacher.belongsToMany(CurriculumSubject, {
      through: TeacherCurriculumSubject,
      foreignKey: "teacher_id",
      otherKey: "curriculum_subject_id",
      as: "teaching_curriculum_subjects",
    });
    CurriculumSubject.belongsToMany(Teacher, {
      through: TeacherCurriculumSubject,
      foreignKey: "curriculum_subject_id",
      otherKey: "teacher_id",
      as: "teachers",
    });

    Teacher.belongsTo(CurriculumClass, {
      foreignKey: "class_teacher_curriculum_class_id",
      as: "homeroom_curriculum_class",
    });
    CurriculumClass.hasMany(Teacher, {
      foreignKey: "class_teacher_curriculum_class_id",
      as: "homeroom_teachers",
    });

    Teacher.belongsToMany(CurriculumClass, {
      through: TeacherTeachingCurriculumClass,
      foreignKey: "teacher_id",
      otherKey: "curriculum_class_id",
      as: "teaching_curriculum_classes",
    });
    CurriculumClass.belongsToMany(Teacher, {
      through: TeacherTeachingCurriculumClass,
      foreignKey: "curriculum_class_id",
      otherKey: "teacher_id",
      as: "teachers_teaching_classes",
    });

    CurriculumClass.hasMany(CurriculumClassTimetable, {
      foreignKey: "curriculum_class_id",
      as: "timetables",
    });
    CurriculumClassTimetable.belongsTo(CurriculumClass, {
      foreignKey: "curriculum_class_id",
      as: "curriculum_class",
    });
    CurriculumClassLevel.hasMany(CurriculumClassTimetable, {
      foreignKey: "curriculum_class_level_id",
      as: "timetables",
    });
    CurriculumClassTimetable.belongsTo(CurriculumClassLevel, {
      foreignKey: "curriculum_class_level_id",
      as: "curriculum_class_level",
    });
    AcademicYear.hasMany(CurriculumClassTimetable, {
      foreignKey: "academic_year_id",
      as: "curriculum_class_timetables",
    });
    CurriculumClassTimetable.belongsTo(AcademicYear, {
      foreignKey: "academic_year_id",
      as: "academic_year",
    });
    CurriculumClassTimetable.hasMany(CurriculumClassTimetableLesson, {
      foreignKey: "timetable_id",
      as: "lessons",
      onDelete: "CASCADE",
    });
    CurriculumClassTimetableLesson.belongsTo(CurriculumClassTimetable, {
      foreignKey: "timetable_id",
      as: "timetable",
    });
    CurriculumClassTimetableLesson.belongsTo(CurriculumSubject, {
      foreignKey: "curriculum_subject_id",
      as: "curriculum_subject",
    });
    CurriculumClassTimetableLesson.belongsTo(Teacher, {
      foreignKey: "teacher_id",
      as: "teacher",
    });
    Teacher.hasMany(CurriculumClassTimetableLesson, {
      foreignKey: "teacher_id",
      as: "timetable_lessons",
    });
    CurriculumSubject.hasMany(CurriculumClassTimetableLesson, {
      foreignKey: "curriculum_subject_id",
      as: "timetable_lessons",
    });

    CurriculumClassTimetableLesson.hasMany(LiveClass, {
      foreignKey: "curriculum_class_timetable_lesson_id",
      as: "live_sessions",
    });
    LiveClass.belongsTo(CurriculumClassTimetableLesson, {
      foreignKey: "curriculum_class_timetable_lesson_id",
      as: "timetable_lesson",
    });

    CurriculumSubject.hasMany(CurriculumSubjectTopic, {
      foreignKey: "curriculum_subject_id",
      as: "topics",
    });
    CurriculumSubjectTopic.belongsTo(CurriculumSubject, {
      foreignKey: "curriculum_subject_id",
      as: "curriculum_subject",
    });
    CurriculumSubjectTopic.hasMany(CurriculumSubjectSubtopic, {
      foreignKey: "curriculum_subject_topic_id",
      as: "subtopics",
    });
    CurriculumSubjectSubtopic.belongsTo(CurriculumSubjectTopic, {
      foreignKey: "curriculum_subject_topic_id",
      as: "topic",
    });

    CurriculumSubject.hasMany(CurriculumSubjectGradingBand, {
      foreignKey: "curriculum_subject_id",
      as: "grading_bands",
    });
    CurriculumSubjectGradingBand.belongsTo(CurriculumSubject, {
      foreignKey: "curriculum_subject_id",
      as: "curriculum_subject",
    });

    GradeLevel.hasMany(Program, {
      foreignKey: "grade_level_id",
      as: "programs",
    });
    Program.belongsTo(GradeLevel, {
      foreignKey: "grade_level_id",
      as: "grade_level",
    });

    FeeStructure.hasMany(Program, {
      foreignKey: "fee_structure_id",
      as: "programs",
    });
    Program.belongsTo(FeeStructure, {
      foreignKey: "fee_structure_id",
      as: "fee_structure",
    });

    User.hasMany(News, { foreignKey: "published_by", as: "published_news" });
    News.belongsTo(User, { foreignKey: "published_by", as: "publisher" });

    User.hasMany(SchoolEvent, {
      foreignKey: "created_by",
      as: "created_events",
    });
    SchoolEvent.belongsTo(User, { foreignKey: "created_by", as: "creator" });

    SchoolEvent.hasMany(EventRegistration, {
      foreignKey: "event_id",
      as: "registrations",
    });
    EventRegistration.belongsTo(SchoolEvent, {
      foreignKey: "event_id",
      as: "event",
    });

    Student.hasMany(EventRegistration, {
      foreignKey: "student_id",
      as: "event_registrations",
    });
    EventRegistration.belongsTo(Student, {
      foreignKey: "student_id",
      as: "student",
    });

    Parent.hasMany(EventRegistration, {
      foreignKey: "parent_id",
      as: "event_registrations",
    });
    EventRegistration.belongsTo(Parent, {
      foreignKey: "parent_id",
      as: "parent",
    });

    User.hasMany(AdmissionApplication, {
      foreignKey: "processed_by",
      as: "processed_admissions",
    });
    AdmissionApplication.belongsTo(User, {
      foreignKey: "processed_by",
      as: "processor",
    });

    AcademicYear.hasMany(AdmissionSettings, {
      foreignKey: "academic_year_id",
      as: "admission_settings",
    });
    AdmissionSettings.belongsTo(AcademicYear, {
      foreignKey: "academic_year_id",
      as: "academic_year",
    });

    AcademicYear.hasMany(AdmissionApplication, {
      foreignKey: "academic_year_id",
      as: "admission_applications",
    });
    AdmissionApplication.belongsTo(AcademicYear, {
      foreignKey: "academic_year_id",
      as: "academic_year",
    });

    SchoolProfile.belongsTo(AcademicYear, {
      foreignKey: "current_academic_year_id",
      as: "current_academic_year",
    });
    SchoolProfile.belongsTo(AcademicTerm, {
      foreignKey: "current_term_id",
      as: "current_term",
    });
    SchoolProfile.belongsTo(User, { foreignKey: "updated_by", as: "updater" });
    SchoolProfile.hasMany(ExamTemplate, {
      foreignKey: "school_profile_id",
      as: "exam_templates",
    });
    ExamTemplate.belongsTo(SchoolProfile, {
      foreignKey: "school_profile_id",
      as: "school_profile",
    });
    User.hasMany(ExamTemplate, { foreignKey: "created_by", as: "created_exam_templates" });
    ExamTemplate.belongsTo(User, { foreignKey: "created_by", as: "creator" });
    User.hasMany(ExamTemplate, { foreignKey: "updated_by", as: "updated_exam_templates" });
    ExamTemplate.belongsTo(User, { foreignKey: "updated_by", as: "updater" });

    PaymentGateway.hasMany(WebhookLog, {
      foreignKey: "gateway_id",
      as: "webhook_logs",
    });
    WebhookLog.belongsTo(PaymentGateway, {
      foreignKey: "gateway_id",
      as: "gateway",
    });

    InstallmentPayment.hasMany(RefundRequest, {
      foreignKey: "payment_id",
      as: "refund_requests",
    });
    RefundRequest.belongsTo(InstallmentPayment, {
      foreignKey: "payment_id",
      as: "payment",
    });
    User.hasMany(RefundRequest, {
      foreignKey: "requested_by",
      as: "refund_requests_requested",
    });
    RefundRequest.belongsTo(User, {
      foreignKey: "requested_by",
      as: "requester",
    });
    User.hasMany(RefundRequest, {
      foreignKey: "approved_by",
      as: "refund_requests_approved",
    });
    RefundRequest.belongsTo(User, {
      foreignKey: "approved_by",
      as: "approver",
    });

    NotificationTemplate.hasMany(EmailQueue, {
      foreignKey: "template_id",
      as: "queued_emails",
    });
    EmailQueue.belongsTo(NotificationTemplate, {
      foreignKey: "template_id",
      as: "template",
    });

    User.hasMany(InAppNotification, {
      foreignKey: "user_id",
      as: "in_app_notifications",
    });
    InAppNotification.belongsTo(User, { foreignKey: "user_id", as: "user" });

    User.hasMany(NotificationPreference, {
      foreignKey: "user_id",
      as: "notification_preferences",
    });
    NotificationPreference.belongsTo(User, {
      foreignKey: "user_id",
      as: "user",
    });

    User.hasMany(BulkNotification, {
      foreignKey: "created_by",
      as: "bulk_notifications_created",
    });
    BulkNotification.belongsTo(User, {
      foreignKey: "created_by",
      as: "creator",
    });

    CertificateTemplate.hasMany(IssuedCertificate, {
      foreignKey: "template_id",
      as: "issued_certificates",
    });
    IssuedCertificate.belongsTo(CertificateTemplate, {
      foreignKey: "template_id",
      as: "template",
    });
    Student.hasMany(IssuedCertificate, {
      foreignKey: "student_id",
      as: "issued_certificates",
    });
    IssuedCertificate.belongsTo(Student, {
      foreignKey: "student_id",
      as: "student",
    });

    Badge.hasMany(EarnedBadge, { foreignKey: "badge_id", as: "earned_badges" });
    EarnedBadge.belongsTo(Badge, { foreignKey: "badge_id", as: "badge" });
    Student.hasMany(EarnedBadge, {
      foreignKey: "student_id",
      as: "earned_badges",
    });
    EarnedBadge.belongsTo(Student, { foreignKey: "student_id", as: "student" });
    User.hasMany(EarnedBadge, {
      foreignKey: "awarded_by",
      as: "badges_awarded",
    });
    EarnedBadge.belongsTo(User, { foreignKey: "awarded_by", as: "awarder" });

    SubscriptionPlan.hasMany(Subscription, {
      foreignKey: "plan_id",
      as: "subscriptions",
    });
    Subscription.belongsTo(SubscriptionPlan, {
      foreignKey: "plan_id",
      as: "plan",
    });
    Student.hasMany(Subscription, {
      foreignKey: "student_id",
      as: "subscriptions",
    });
    Subscription.belongsTo(Student, {
      foreignKey: "student_id",
      as: "student",
    });

    User.hasMany(FeatureFlag, {
      foreignKey: "created_by",
      as: "feature_flags_created",
    });
    FeatureFlag.belongsTo(User, { foreignKey: "created_by", as: "creator" });

    User.hasMany(AuditLog, { foreignKey: "user_id", as: "audit_logs" });
    AuditLog.belongsTo(User, { foreignKey: "user_id", as: "user" });

    User.hasMany(BackupLog, { foreignKey: "created_by", as: "backup_logs" });
    BackupLog.belongsTo(User, { foreignKey: "created_by", as: "creator" });

    User.hasMany(ApiUsage, { foreignKey: "user_id", as: "api_usage" });
    ApiUsage.belongsTo(User, { foreignKey: "user_id", as: "user" });

    User.hasMany(MaintenanceMode, {
      foreignKey: "enabled_by",
      as: "maintenance_modes_enabled",
    });
    MaintenanceMode.belongsTo(User, {
      foreignKey: "enabled_by",
      as: "enabler",
    });

    Student.hasMany(StudentEngagement, {
      foreignKey: "student_id",
      as: "engagements",
    });
    StudentEngagement.belongsTo(Student, {
      foreignKey: "student_id",
      as: "student",
    });

    Teacher.hasMany(TeacherPerformance, {
      foreignKey: "teacher_id",
      as: "performance_snapshots",
    });
    TeacherPerformance.belongsTo(Teacher, {
      foreignKey: "teacher_id",
      as: "teacher",
    });

    Exam.hasMany(ExamAnalytics, {
      foreignKey: "exam_id",
      as: "analytics_snapshots",
    });
    ExamAnalytics.belongsTo(Exam, { foreignKey: "exam_id", as: "exam" });

    User.hasMany(SupportTicket, {
      foreignKey: "user_id",
      as: "support_tickets_opened",
    });
    SupportTicket.belongsTo(User, { foreignKey: "user_id", as: "requester" });
    User.hasMany(SupportTicket, {
      foreignKey: "assigned_to",
      as: "support_tickets_assigned",
    });
    SupportTicket.belongsTo(User, {
      foreignKey: "assigned_to",
      as: "assignee",
    });

    SupportTicket.hasMany(TicketReply, {
      foreignKey: "ticket_id",
      as: "replies",
    });
    TicketReply.belongsTo(SupportTicket, {
      foreignKey: "ticket_id",
      as: "ticket",
    });
    User.hasMany(TicketReply, { foreignKey: "user_id", as: "ticket_replies" });
    TicketReply.belongsTo(User, { foreignKey: "user_id", as: "author" });

    Coupon.hasMany(CouponUsage, { foreignKey: "coupon_id", as: "usages" });
    CouponUsage.belongsTo(Coupon, { foreignKey: "coupon_id", as: "coupon" });
    User.hasMany(CouponUsage, { foreignKey: "user_id", as: "coupon_usages" });
    CouponUsage.belongsTo(User, { foreignKey: "user_id", as: "user" });

    User.hasMany(Referral, {
      foreignKey: "referrer_user_id",
      as: "referrals_sent",
    });
    Referral.belongsTo(User, {
      foreignKey: "referrer_user_id",
      as: "referrer",
    });
    User.hasMany(Referral, {
      foreignKey: "referred_user_id",
      as: "referrals_received",
    });
    Referral.belongsTo(User, {
      foreignKey: "referred_user_id",
      as: "referred_user",
    });

    User.hasMany(ExportJob, { foreignKey: "user_id", as: "export_jobs" });
    ExportJob.belongsTo(User, { foreignKey: "user_id", as: "user" });
    User.hasMany(ImportJob, { foreignKey: "user_id", as: "import_jobs" });
    ImportJob.belongsTo(User, { foreignKey: "user_id", as: "user" });

    Subject.hasMany(Course, { foreignKey: "subject_id", as: "lms_courses" });
    Course.belongsTo(Subject, { foreignKey: "subject_id", as: "subject" });
    GradeLevel.hasMany(Course, {
      foreignKey: "grade_level_id",
      as: "lms_courses",
    });
    Course.belongsTo(GradeLevel, {
      foreignKey: "grade_level_id",
      as: "grade_level",
    });
    Teacher.hasMany(Course, {
      foreignKey: "instructor_id",
      as: "instructed_courses",
    });
    Course.belongsTo(Teacher, {
      foreignKey: "instructor_id",
      as: "instructor",
    });

    Course.hasMany(Lesson, { foreignKey: "course_id", as: "lessons" });
    Lesson.belongsTo(Course, { foreignKey: "course_id", as: "course" });

    Lesson.hasMany(LessonCompletion, {
      foreignKey: "lesson_id",
      as: "completions",
    });
    LessonCompletion.belongsTo(Lesson, {
      foreignKey: "lesson_id",
      as: "lesson",
    });
    Student.hasMany(LessonCompletion, {
      foreignKey: "student_id",
      as: "lesson_completions",
    });
    LessonCompletion.belongsTo(Student, {
      foreignKey: "student_id",
      as: "student",
    });

    Lesson.hasMany(LessonResource, {
      foreignKey: "lesson_id",
      as: "resources",
    });
    LessonResource.belongsTo(Lesson, { foreignKey: "lesson_id", as: "lesson" });

    Lesson.hasMany(CourseAssignment, {
      foreignKey: "lesson_id",
      as: "assignments",
    });
    CourseAssignment.belongsTo(Lesson, {
      foreignKey: "lesson_id",
      as: "lesson",
    });

    CourseAssignment.hasMany(AssignmentSubmission, {
      foreignKey: "assignment_id",
      as: "submissions",
    });
    AssignmentSubmission.belongsTo(CourseAssignment, {
      foreignKey: "assignment_id",
      as: "assignment",
    });
    Student.hasMany(AssignmentSubmission, {
      foreignKey: "student_id",
      as: "assignment_submissions",
    });
    AssignmentSubmission.belongsTo(Student, {
      foreignKey: "student_id",
      as: "student",
    });
    User.hasMany(AssignmentSubmission, {
      foreignKey: "graded_by",
      as: "graded_assignment_submissions",
    });
    AssignmentSubmission.belongsTo(User, {
      foreignKey: "graded_by",
      as: "grader",
    });

    Lesson.hasMany(CourseDiscussion, {
      foreignKey: "lesson_id",
      as: "discussions",
    });
    CourseDiscussion.belongsTo(Lesson, {
      foreignKey: "lesson_id",
      as: "lesson",
    });
    User.hasMany(CourseDiscussion, {
      foreignKey: "user_id",
      as: "course_discussions",
    });
    CourseDiscussion.belongsTo(User, { foreignKey: "user_id", as: "author" });

    CourseDiscussion.hasMany(DiscussionReply, {
      foreignKey: "discussion_id",
      as: "replies",
    });
    DiscussionReply.belongsTo(CourseDiscussion, {
      foreignKey: "discussion_id",
      as: "discussion",
    });
    User.hasMany(DiscussionReply, {
      foreignKey: "user_id",
      as: "discussion_replies",
    });
    DiscussionReply.belongsTo(User, { foreignKey: "user_id", as: "author" });
    DiscussionReply.hasMany(DiscussionReply, {
      foreignKey: "parent_reply_id",
      as: "child_replies",
    });
    DiscussionReply.belongsTo(DiscussionReply, {
      foreignKey: "parent_reply_id",
      as: "parent_reply",
    });

    Course.hasMany(CourseEnrollment, {
      foreignKey: "course_id",
      as: "enrollments_lms",
    });
    CourseEnrollment.belongsTo(Course, {
      foreignKey: "course_id",
      as: "course",
    });
    Student.hasMany(CourseEnrollment, {
      foreignKey: "student_id",
      as: "course_enrollments",
    });
    CourseEnrollment.belongsTo(Student, {
      foreignKey: "student_id",
      as: "student",
    });

    ClassSession.hasMany(LiveClass, {
      foreignKey: "class_session_id",
      as: "live_classes",
    });
    LiveClass.belongsTo(ClassSession, {
      foreignKey: "class_session_id",
      as: "class_session",
    });
    Teacher.hasMany(LiveClass, {
      foreignKey: "teacher_id",
      as: "live_classes_hosted",
    });
    LiveClass.belongsTo(Teacher, { foreignKey: "teacher_id", as: "host" });

    LiveClass.hasMany(LiveClassRecording, {
      foreignKey: "live_class_id",
      as: "recordings",
    });
    LiveClassRecording.belongsTo(LiveClass, {
      foreignKey: "live_class_id",
      as: "live_class",
    });

    LiveClass.hasMany(LiveClassAttendance, {
      foreignKey: "live_class_id",
      as: "live_attendances",
    });
    LiveClassAttendance.belongsTo(LiveClass, {
      foreignKey: "live_class_id",
      as: "live_class",
    });
    Student.hasMany(LiveClassAttendance, {
      foreignKey: "student_id",
      as: "live_class_attendances",
    });
    LiveClassAttendance.belongsTo(Student, {
      foreignKey: "student_id",
      as: "student",
    });

    LiveClass.hasMany(LiveClassChat, {
      foreignKey: "live_class_id",
      as: "chat_messages",
    });
    LiveClassChat.belongsTo(LiveClass, {
      foreignKey: "live_class_id",
      as: "live_class",
    });
    User.hasMany(LiveClassChat, {
      foreignKey: "user_id",
      as: "live_class_chat_messages",
    });
    LiveClassChat.belongsTo(User, { foreignKey: "user_id", as: "author" });

    LiveClass.hasMany(LiveClassPoll, {
      foreignKey: "live_class_id",
      as: "polls",
    });
    LiveClassPoll.belongsTo(LiveClass, {
      foreignKey: "live_class_id",
      as: "live_class",
    });
    User.hasMany(LiveClassPoll, {
      foreignKey: "created_by",
      as: "live_polls_created",
    });
    LiveClassPoll.belongsTo(User, { foreignKey: "created_by", as: "creator" });

    LiveClassPoll.hasMany(LiveClassPollResponse, {
      foreignKey: "poll_id",
      as: "responses",
    });
    LiveClassPollResponse.belongsTo(LiveClassPoll, {
      foreignKey: "poll_id",
      as: "poll",
    });
    Student.hasMany(LiveClassPollResponse, {
      foreignKey: "student_id",
      as: "live_poll_responses",
    });
    LiveClassPollResponse.belongsTo(Student, {
      foreignKey: "student_id",
      as: "student",
    });

    console.log("✅ All associations set up successfully");
  } catch (error) {
    console.error("❌ Error during setupAssociations:", error);
    throw error;
  }
};

module.exports = { ...models, initializeModels, setupAssociations, sequelize };
