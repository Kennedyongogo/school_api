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
  Exam,
  ExamAttempt,
  ExamSubmission,
  ExamAnswer,
  ExamQuestion,
  StudentExamResult,
} = require("../models");
const { Op, Sequelize } = require("sequelize");

const userSafe = { attributes: { exclude: ["password_hash"] } };
const { getLessonJoinWindow } = require("../utils/lessonJoinWindow");
const { examAccessPolicyForMode, normalizeMode } = require("../utils/examProctoring");
const {
  autoSubmitElapsedDraftIfNeeded,
  buildStudentExamAccess,
} = require("../utils/examSubmissionDuration");

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
          attributes: ["id", "meeting_id", "join_url", "host_url", "session_status", "platform", "created_at"],
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
      const joinWindow =
        live && String(l.delivery_mode || "").toLowerCase() === "online"
          ? getLessonJoinWindow({
              lesson_date: l.lesson_date,
              starts_at: l.starts_at,
              ends_at: l.ends_at,
              session_status: live.session_status,
            })
          : { can_join: false, reason: null };
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
              meeting_id: live.meeting_id,
              join_url: live.join_url,
              session_status: live.session_status,
              platform: live.platform,
              created_at: live.created_at,
              can_join: joinWindow.can_join,
              join_blocked_reason: joinWindow.reason,
              join_opens_at: joinWindow.opens_at,
              join_closes_at: joinWindow.closes_at,
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
      status: "published",
      session_status: { [Op.in]: ["scheduled", "live", "completed"] },
    };
    if (student.curriculum_id) where.curriculum_id = student.curriculum_id;

    const rows = await Exam.findAll({
      where,
      include: [
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
      order: [["start_time", "DESC"]],
    });

    const examIds = rows.map((r) => r.id);
    const [attempts, submissions] = await Promise.all([
      examIds.length
        ? ExamAttempt.findAll({
            where: { student_id: student.id, exam_id: examIds },
            attributes: ["id", "exam_id", "status", "start_time", "end_time", "submitted_at", "is_cancelled", "cancellation_reason"],
            order: [["created_at", "DESC"]],
          })
        : [],
      examIds.length
        ? ExamSubmission.findAll({
            where: { student_id: student.id, exam_id: examIds },
            attributes: ["id", "exam_id", "status", "started_at", "submitted_at"],
            order: [["created_at", "DESC"]],
          })
        : [],
    ]);

    const attemptByExam = new Map();
    for (const a of attempts) {
      if (!attemptByExam.has(a.exam_id)) attemptByExam.set(a.exam_id, a);
    }
    const submissionByExam = new Map();
    for (const s of submissions) {
      if (!submissionByExam.has(s.exam_id)) submissionByExam.set(s.exam_id, s);
    }

    for (const r of rows) {
      let sub = submissionByExam.get(r.id);
      if (sub?.status === "draft") {
        sub = await autoSubmitElapsedDraftIfNeeded(sub, r, student.id);
        submissionByExam.set(r.id, sub);
      }
    }

    const data = rows.map((r) => {
      const att = attemptByExam.get(r.id);
      const sub = submissionByExam.get(r.id);
      const access = buildStudentExamAccess(r, sub, r);
      const attendance =
        att || sub
          ? {
              status: att?.is_cancelled
                ? "Disqualified"
                : sub?.status === "submitted" || att?.submitted_at || sub?.submitted_at
                  ? "Submitted"
                  : "Attended",
              started_at: att?.start_time || sub?.started_at || null,
              submitted_at: att?.submitted_at || sub?.submitted_at || null,
              attempt_status: att?.status || null,
              is_cancelled: !!att?.is_cancelled,
              cancellation_reason: att?.cancellation_reason || null,
            }
          : { status: "Pending" };
      return {
        id: r.id,
        exam_id: r.id,
        start_time: r.start_time,
        end_time: r.end_time,
        timezone: r.timezone,
        status: r.session_status,
        session_status: r.session_status,
        proctoring_mode: r.proctoring_mode,
        requires_webcam: r.requires_webcam,
        prevent_tab_switch: r.prevent_tab_switch,
        effective_requires_webcam: !!r.requires_webcam,
        effective_prevent_tab_switch: !!r.prevent_tab_switch,
        meeting_provider: r.meeting_provider,
        meeting_id: r.meeting_id,
        meeting_join_url: r.meeting_join_url,
        video_mode:
          String(r.meeting_provider || "").toLowerCase() === "livekit"
            ? "livekit"
            : String(r.meeting_provider || "").toLowerCase() === "webrtc"
              ? "webrtc"
              : "external",
        exam_access_policy: examAccessPolicyForMode(normalizeMode(r.proctoring_mode) || "record_only"),
        curriculum: r.curriculum || null,
        curriculum_class: r.curriculum_class || null,
        curriculum_class_level: r.curriculum_class_level || null,
        exam: {
          id: r.id,
          title: r.title,
          status: r.status,
          duration_minutes: r.duration_minutes,
          requires_webcam: r.requires_webcam,
          prevent_tab_switch: r.prevent_tab_switch,
        },
        teacher: r.teacher || null,
        attendance,
        can_open: access.can_open,
        open_block_reason: access.open_block_reason,
        duration_minutes: access.duration_minutes,
        duration_deadline: access.duration_deadline,
        duration_elapsed: access.duration_elapsed,
        remaining_seconds: access.remaining_seconds,
        submission_status: access.submission_status,
      };
    });

    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Could not load exams." });
  }
};

exports.getMyStudentExamResult = async (req, res) => {
  try {
    const examId = req.params.examScheduleId || req.params.examId;
    if (!examId) {
      return res.status(400).json({ success: false, message: "exam id is required." });
    }

    const student = await Student.findOne({
      where: { user_id: req.user?.id },
      attributes: ["id", "curriculum_id", "curriculum_class_id"],
    });
    if (!student) {
      return res.status(404).json({ success: false, message: "Student profile not found." });
    }

    const exam = await Exam.findByPk(examId, { attributes: ["id", "title"] });
    if (!exam) {
      return res.status(404).json({ success: false, message: "Exam not found." });
    }

    const result = await StudentExamResult.findOne({
      where: { exam_id: exam.id, student_id: student.id },
      include: [
        {
          model: CurriculumSubject,
          as: "curriculum_subject",
          attributes: ["id", "name"],
        },
      ],
    });
    if (!result) {
      return res.status(404).json({ success: false, message: "Exam result not found. The exam may not have been graded yet." });
    }

    // Find the submission to get answers
    const submission = await ExamSubmission.findOne({
      where: { exam_id: exam.id, student_id: student.id, status: "submitted" },
    });

    let questions = [];
    if (submission) {
      // Get answers with marks
      const answers = await ExamAnswer.findAll({
        where: { submission_id: submission.id },
        include: [
          {
            model: ExamQuestion,
            as: "question",
            required: true,
            attributes: ["id", "question_text", "marks"],
          },
        ],
        order: [["created_at", "ASC"]],
      });

      questions = answers.map((a) => ({
        question: a.question.question_text,
        score: Number(a.marks_obtained || 0),
        maxScore: Number(a.question.marks || 0),
      }));
    }

    const data = {
      totalScore: Number(result.marks_obtained || 0),
      totalMax: 100, // Assuming max is 100, or could calculate from questions
      grade: result.grade,
      questions,
    };

    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Could not load exam result." });
  }
};

