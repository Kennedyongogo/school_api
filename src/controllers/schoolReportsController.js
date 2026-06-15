const { Op } = require("sequelize");
const {
  CurriculumClassTimetableLesson,
  CurriculumClassTimetable,
  CurriculumClass,
  CurriculumClassLevel,
  Curriculum,
  CurriculumSubject,
  Exam,
  Teacher,
  User,
  LiveClassAttendance,
  LiveClass,
  Student,
  ExamAttempt,
  ExamSubmission,
} = require("../models");
const { isTeacherAttendedForHr } = require("../utils/examProctoring");

exports.getHrAttendanceOverview = async (req, res) => {
  try {
    const dateRaw = req.query.date != null ? String(req.query.date).trim() : "";
    const scopeRaw = req.query.scope != null ? String(req.query.scope).trim().toLowerCase() : "lessons";
    const scope = scopeRaw === "exams" ? "exams" : "lessons";
    const hasDateFilter = dateRaw !== "";
    if (hasDateFilter && !/^\d{4}-\d{2}-\d{2}$/.test(dateRaw)) {
      return res.status(400).json({ success: false, message: "date must be YYYY-MM-DD" });
    }

    if (scope === "exams") {
      const examWhere = hasDateFilter
        ? {
            start_time: {
              [Op.between]: [new Date(`${dateRaw}T00:00:00.000Z`), new Date(`${dateRaw}T23:59:59.999Z`)],
            },
          }
        : { start_time: { [Op.ne]: null } };

      const teacherRows = await Exam.findAll({
        where: examWhere,
        include: [
          { model: Curriculum, as: "curriculum", attributes: ["id", "name"] },
          { model: CurriculumClass, as: "curriculum_class", attributes: ["id", "name", "code"] },
          { model: CurriculumClassLevel, as: "curriculum_class_level", attributes: ["id", "name"] },
          {
            model: Teacher,
            as: "teacher",
            required: false,
            attributes: ["id"],
            include: [{ model: User, as: "user", attributes: ["id", "full_name", "username"] }],
          },
        ],
        order: [["start_time", "DESC"]],
      });

      const attempts = await ExamAttempt.findAll({
        include: [
          {
            model: Exam,
            as: "exam",
            required: true,
            where: examWhere,
            include: [{ model: CurriculumClass, as: "curriculum_class", attributes: ["id", "name", "code"] }],
          },
          {
            model: Student,
            as: "student",
            attributes: ["id", "admission_number"],
            include: [{ model: User, as: "user", attributes: ["id", "full_name", "username"] }],
          },
        ],
        order: [["created_at", "DESC"]],
      });

      const submissions = await ExamSubmission.findAll({
        where: hasDateFilter
          ? {
              created_at: {
                [Op.between]: [new Date(`${dateRaw}T00:00:00.000Z`), new Date(`${dateRaw}T23:59:59.999Z`)],
              },
            }
          : {},
        include: [
          {
            model: Student,
            as: "student",
            attributes: ["id", "admission_number"],
            include: [{ model: User, as: "user", attributes: ["id", "full_name", "username"] }],
          },
        ],
        order: [["created_at", "DESC"]],
      });

      return res.json({
        success: true,
        data: {
          scope,
          date: hasDateFilter ? dateRaw : null,
          date_filtered: hasDateFilter,
          teacher_attendance: teacherRows.map((r) => ({
            exam_id: r.id,
            exam_schedule_id: r.id,
            exam: { id: r.id, title: r.title },
            curriculum: r.curriculum || null,
            curriculum_class: r.curriculum_class || null,
            curriculum_class_level: r.curriculum_class_level || null,
            teacher: r.teacher || null,
            starts_at: r.start_time,
            ends_at: r.end_time,
            delivery_mode: "online",
            teacher_attended: isTeacherAttendedForHr(r),
            proctoring_mode: r.proctoring_mode,
          })),
          student_attendance: attempts.map((a) => ({
            attendance_id: a.id,
            student: a.student || null,
            join_time: a.start_time,
            leave_time: a.end_time,
            duration_minutes: a.time_spent_seconds != null ? Math.round(Number(a.time_spent_seconds) / 60) : null,
            status: a.start_time || a.status === "completed" ? "Attended" : "Pending",
            lesson: null,
            exam: a.exam || null,
            exam_schedule: a.exam || null,
          })),
          extra_submissions: submissions.length,
        },
      });
    }

    const teacherRows = await CurriculumClassTimetableLesson.findAll({
      where: hasDateFilter ? { lesson_date: dateRaw } : {},
      include: [
        {
          model: CurriculumClassTimetable,
          as: "timetable",
          attributes: ["id", "name"],
          include: [
            {
              model: CurriculumClass,
              as: "curriculum_class",
              attributes: ["id", "name", "code"],
              include: [{ model: Curriculum, as: "curriculum", attributes: ["id", "name"] }],
            },
          ],
        },
        { model: CurriculumSubject, as: "curriculum_subject", attributes: ["id", "name"] },
        {
          model: Teacher,
          as: "teacher",
          required: false,
          attributes: ["id"],
          include: [{ model: User, as: "user", attributes: ["id", "full_name", "username"] }],
        },
      ],
      order: [
        ["lesson_date", "DESC"],
        ["starts_at", "ASC"],
      ],
    });

    const studentRows = await LiveClassAttendance.findAll({
      include: [
        {
          model: LiveClass,
          as: "live_class",
          attributes: ["id"],
          required: true,
          include: [
            {
              model: CurriculumClassTimetableLesson,
              as: "timetable_lesson",
              required: true,
              where: hasDateFilter ? { lesson_date: dateRaw } : undefined,
              attributes: ["id", "lesson_date", "starts_at", "ends_at", "delivery_mode"],
              include: [
                { model: CurriculumSubject, as: "curriculum_subject", attributes: ["id", "name"] },
                {
                  model: CurriculumClassTimetable,
                  as: "timetable",
                  attributes: ["id", "name"],
                  include: [
                    {
                      model: CurriculumClass,
                      as: "curriculum_class",
                      attributes: ["id", "name", "code"],
                      include: [{ model: Curriculum, as: "curriculum", attributes: ["id", "name"] }],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          model: Student,
          as: "student",
          attributes: ["id", "admission_number"],
          include: [{ model: User, as: "user", attributes: ["id", "full_name", "username"] }],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    return res.json({
      success: true,
      data: {
        scope,
        date: hasDateFilter ? dateRaw : null,
        date_filtered: hasDateFilter,
        teacher_attendance: teacherRows.map((r) => ({
          lesson_id: r.id,
          lesson_date: r.lesson_date,
          curriculum: r.timetable?.curriculum_class?.curriculum || null,
          curriculum_class: r.timetable?.curriculum_class || null,
          subject: r.curriculum_subject || null,
          teacher: r.teacher || null,
          starts_at: r.starts_at,
          ends_at: r.ends_at,
          delivery_mode: r.delivery_mode,
          teacher_attended: !!r.teacher_attended,
        })),
        student_attendance: studentRows.map((a) => ({
          attendance_id: a.id,
          student: a.student || null,
          join_time: a.join_time,
          leave_time: a.leave_time,
          duration_minutes: a.duration_minutes,
          status: a.join_time ? "Attended" : "Pending",
          lesson: a.live_class?.timetable_lesson || null,
        })),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
