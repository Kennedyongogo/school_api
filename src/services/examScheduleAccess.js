const { ExamSchedule, Student, Teacher } = require("../models");
const { STAFF_ROLES, ADMIN_PORTAL_API_ROLES } = require("../constants/userRoles");

const TEACH_OR_STAFF = [...STAFF_ROLES, "teacher"];

function isStaffRole(req) {
  return TEACH_OR_STAFF.includes(req.user?.role);
}

function isTeacherRole(req) {
  return req.user?.role === "teacher" || ADMIN_PORTAL_API_ROLES.includes(req.user?.role);
}

async function loadExamScheduleForAccess(scheduleId) {
  return ExamSchedule.findByPk(scheduleId, {
    attributes: [
      "id",
      "exam_id",
      "curriculum_class_id",
      "teacher_id",
      "start_time",
      "end_time",
      "status",
      "is_active",
      "allow_late_join_minutes",
      "meeting_id",
      "meeting_provider",
      "meeting_join_url",
      "meeting_host_url",
      "proctoring_mode",
    ],
  });
}

async function assertCanAccessExamSchedule(req, schedule) {
  if (!schedule) {
    const err = new Error("Exam schedule not found.");
    err.statusCode = 404;
    throw err;
  }
  if (!schedule.is_active) {
    const err = new Error("This exam schedule is inactive.");
    err.statusCode = 400;
    throw err;
  }
  if (isStaffRole(req)) {
    if (req.user?.role === "teacher" && schedule.teacher_id) {
      const teacher = await Teacher.findOne({ where: { user_id: req.user.id }, attributes: ["id"] });
      if (teacher && String(schedule.teacher_id) !== String(teacher.id)) {
        const err = new Error("Forbidden: this schedule is assigned to another invigilator.");
        err.statusCode = 403;
        throw err;
      }
    }
    return;
  }
  if (req.user?.role !== "student") {
    const err = new Error("Forbidden.");
    err.statusCode = 403;
    throw err;
  }
  const student = await Student.findOne({
    where: { user_id: req.user.id },
    attributes: ["id", "curriculum_class_id"],
  });
  if (!student) {
    const err = new Error("Student profile not found.");
    err.statusCode = 404;
    throw err;
  }
  if (!schedule.curriculum_class_id || String(student.curriculum_class_id) !== String(schedule.curriculum_class_id)) {
    const err = new Error("You are not enrolled in the class for this exam.");
    err.statusCode = 403;
    throw err;
  }
}

module.exports = {
  loadExamScheduleForAccess,
  assertCanAccessExamSchedule,
  isStaffRole,
  isTeacherRole,
};
