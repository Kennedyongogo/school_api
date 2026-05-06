const {
  Student,
  CurriculumClassTimetableLesson,
  CurriculumClassTimetable,
  CurriculumClass,
  CurriculumClassLevel,
  Curriculum,
  CurriculumSubject,
  Teacher,
  User,
  LiveClass,
  LiveClassAttendance,
  ExamSchedule,
  Exam,
  ExamAttempt,
  ExamSubmission,
} = require("../models");

const userSafe = { attributes: { exclude: ["password_hash"] } };

exports.listMyStudentTimetableLessons = async (req, res) => {
  try {
    const student = await Student.findOne({
      where: { user_id: req.user?.id },
      attributes: ["id", "curriculum_id", "curriculum_class_id"],
    });
    if (!student) {
      return res.status(404).json({ success: false, message: "Student profile not found." });
    }
    if (!student.curriculum_class_id) {
      return res.json({ success: true, data: [] });
    }

    const lessons = await CurriculumClassTimetableLesson.findAll({
      include: [
        {
          model: CurriculumClassTimetable,
          as: "timetable",
          attributes: ["id", "name", "curriculum_class_id"],
          required: true,
          where: { curriculum_class_id: student.curriculum_class_id },
          include: [
            {
              model: CurriculumClass,
              as: "curriculum_class",
              attributes: ["id", "name", "code", "curriculum_id"],
              include: [{ model: Curriculum, as: "curriculum", attributes: ["id", "name", "type"] }],
            },
          ],
        },
        { model: CurriculumSubject, as: "curriculum_subject", attributes: ["id", "name"] },
        {
          model: Teacher,
          as: "teacher",
          required: false,
          attributes: ["id"],
          include: [{ model: User, as: "user", ...userSafe }],
        },
        {
          model: LiveClass,
          as: "live_sessions",
          required: false,
          separate: true,
          limit: 1,
          order: [["created_at", "DESC"]],
          attributes: ["id", "join_url", "host_url", "session_status", "platform", "created_at"],
          include: [
            {
              model: LiveClassAttendance,
              as: "live_attendances",
              required: false,
              where: { student_id: student.id },
              attributes: ["id", "join_time", "leave_time", "duration_minutes"],
            },
          ],
        },
      ],
      order: [
        ["lesson_date", "ASC"],
        ["starts_at", "ASC"],
      ],
    });

    const data = lessons.map((l) => {
      const live = Array.isArray(l.live_sessions) && l.live_sessions.length ? l.live_sessions[0] : null;
      const attendance =
        live && Array.isArray(live.live_attendances) && live.live_attendances.length
          ? live.live_attendances[0]
          : null;
      const attendanceLabel = attendance
        ? "Attended"
        : l.delivery_mode === "online"
        ? "Pending"
        : "Pending";
      return {
        id: l.id,
        lesson_date: l.lesson_date,
        starts_at: l.starts_at,
        ends_at: l.ends_at,
        delivery_mode: l.delivery_mode,
        room: l.room,
        notes: l.notes,
        curriculum: l.timetable?.curriculum_class?.curriculum || null,
        curriculum_class: l.timetable?.curriculum_class || null,
        subject: l.curriculum_subject || null,
        teacher: l.teacher || null,
        attendance: attendance
          ? {
              status: attendanceLabel,
              join_time: attendance.join_time,
              leave_time: attendance.leave_time,
              duration_minutes: attendance.duration_minutes,
            }
          : { status: attendanceLabel },
        live_session: live
          ? {
              id: live.id,
              join_url: live.join_url,
              session_status: live.session_status,
              platform: live.platform,
              created_at: live.created_at,
            }
          : null,
      };
    });

    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Could not load lessons." });
  }
};

exports.listMyStudentExamSchedules = async (req, res) => {
  try {
    const student = await Student.findOne({
      where: { user_id: req.user?.id },
      attributes: ["id", "curriculum_id", "curriculum_class_id"],
    });
    if (!student) {
      return res.status(404).json({ success: false, message: "Student profile not found." });
    }
    if (!student.curriculum_class_id) {
      return res.json({ success: true, data: [] });
    }

    const where = {
      is_active: true,
      curriculum_class_id: student.curriculum_class_id,
    };
    if (student.curriculum_id) where.curriculum_id = student.curriculum_id;

    const rows = await ExamSchedule.findAll({
      where,
      include: [
        { model: Exam, as: "exam", attributes: ["id", "title", "status"] },
        { model: Curriculum, as: "curriculum", attributes: ["id", "name", "type"] },
        { model: CurriculumClass, as: "curriculum_class", attributes: ["id", "name", "code"] },
        { model: CurriculumClassLevel, as: "curriculum_class_level", attributes: ["id", "name"] },
        {
          model: Teacher,
          as: "teacher",
          required: false,
          attributes: ["id"],
          include: [{ model: User, as: "user", ...userSafe }],
        },
      ],
      order: [["start_time", "ASC"]],
    });

    const scheduleIds = rows.map((r) => r.id);
    const [attempts, submissions] = await Promise.all([
      scheduleIds.length
        ? ExamAttempt.findAll({
            where: { student_id: student.id, exam_schedule_id: scheduleIds },
            attributes: ["id", "exam_schedule_id", "status", "start_time", "end_time", "submitted_at"],
            order: [["created_at", "DESC"]],
          })
        : [],
      ExamSubmission.findAll({
        where: { student_id: student.id },
        attributes: ["id", "exam_id", "status", "started_at", "submitted_at"],
        order: [["created_at", "DESC"]],
      }),
    ]);

    const attemptBySchedule = new Map();
    for (const a of attempts) {
      if (!attemptBySchedule.has(a.exam_schedule_id)) attemptBySchedule.set(a.exam_schedule_id, a);
    }
    const submissionByExam = new Map();
    for (const s of submissions) {
      if (!submissionByExam.has(s.exam_id)) submissionByExam.set(s.exam_id, s);
    }

    const data = rows.map((r) => {
      const att = attemptBySchedule.get(r.id);
      const sub = submissionByExam.get(r.exam_id);
      const attendance =
        att || sub
          ? {
              status: "Attended",
              started_at: att?.start_time || sub?.started_at || null,
              submitted_at: att?.submitted_at || sub?.submitted_at || null,
            }
          : { status: "Pending" };
      return {
        id: r.id,
        start_time: r.start_time,
        end_time: r.end_time,
        timezone: r.timezone,
        status: r.status,
        proctoring_mode: r.proctoring_mode,
        requires_webcam: r.requires_webcam,
        prevent_tab_switch: r.prevent_tab_switch,
        meeting_provider: r.meeting_provider,
        meeting_join_url: r.meeting_join_url,
        curriculum: r.curriculum || null,
        curriculum_class: r.curriculum_class || null,
        curriculum_class_level: r.curriculum_class_level || null,
        exam: r.exam || null,
        teacher: r.teacher || null,
        attendance,
      };
    });

    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Could not load exams." });
  }
};

