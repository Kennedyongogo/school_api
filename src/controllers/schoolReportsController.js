const { Op } = require("sequelize");
const {
  TeacherAttendance,
  ClassAttendance,
  ClassSession,
  SyllabusChapter,
  LessonProgress,
} = require("../models");

exports.getTeacherAttendanceReport = async (req, res) => {
  try {
    const start = req.query.start_date || req.query.start;
    const end = req.query.end_date || req.query.end;
    if (!start || !end) {
      return res.status(400).json({ success: false, message: "start_date and end_date are required" });
    }

    const rows = await TeacherAttendance.findAll({
      where: { date: { [Op.between]: [start, end] } },
    });

    const byTeacher = {};
    for (const r of rows) {
      const id = r.teacher_id;
      if (!byTeacher[id]) {
        byTeacher[id] = {
          teacher_id: id,
          total_days: 0,
          present_days: 0,
          late_days: 0,
          absent_days: 0,
          on_leave_days: 0,
        };
      }
      const agg = byTeacher[id];
      agg.total_days += 1;
      if (r.status === "present") agg.present_days += 1;
      if (r.status === "late") agg.late_days += 1;
      if (r.status === "absent") agg.absent_days += 1;
      if (r.status === "on_leave") agg.on_leave_days += 1;
    }

    return res.json({
      success: true,
      data: {
        period: { start_date: start, end_date: end },
        summary_by_teacher: Object.values(byTeacher),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getClassAttendanceReport = async (req, res) => {
  try {
    const start = req.query.start_date || req.query.start;
    const end = req.query.end_date || req.query.end;
    if (!start || !end) {
      return res.status(400).json({ success: false, message: "start_date and end_date are required" });
    }

    const sessions = await ClassSession.findAll({
      where: { session_date: { [Op.between]: [start, end] } },
      attributes: ["id"],
    });
    const sessionIds = sessions.map((s) => s.id);
    if (!sessionIds.length) {
      return res.json({
        success: true,
        data: {
          period: { start_date: start, end_date: end },
          total_records: 0,
          present_count: 0,
          absent_count: 0,
          late_count: 0,
          excused_count: 0,
        },
      });
    }

    const rows = await ClassAttendance.findAll({
      where: { class_session_id: { [Op.in]: sessionIds } },
    });

    let present = 0;
    let absent = 0;
    let late = 0;
    let excused = 0;
    for (const r of rows) {
      if (r.status === "present") present += 1;
      else if (r.status === "absent") absent += 1;
      else if (r.status === "late") late += 1;
      else if (r.status === "excused") excused += 1;
    }

    return res.json({
      success: true,
      data: {
        period: { start_date: start, end_date: end },
        session_count: sessionIds.length,
        total_records: rows.length,
        present_count: present,
        absent_count: absent,
        late_count: late,
        excused_count: excused,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSyllabusProgressReport = async (req, res) => {
  try {
    const syllabusId = req.query.syllabus_id;
    if (!syllabusId) {
      return res.status(400).json({ success: false, message: "syllabus_id is required" });
    }

    const chapters = await SyllabusChapter.findAll({ where: { syllabus_id: syllabusId } });
    const total = chapters.length;
    const completed = chapters.filter((c) => c.is_completed).length;

    const chapterIds = chapters.map((c) => c.id);
    const lessonRows =
      chapterIds.length === 0
        ? []
        : await LessonProgress.findAll({
            where: { syllabus_chapter_id: { [Op.in]: chapterIds } },
          });

    return res.json({
      success: true,
      data: {
        syllabus_id: syllabusId,
        total_chapters: total,
        completed_chapters: completed,
        completion_percentage: total ? Math.round((completed / total) * 100) : 0,
        lesson_progress_records: lessonRows.length,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDailySummary = async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().slice(0, 10);

    const teacherRows = await TeacherAttendance.findAll({ where: { date } });
    const teachers_checked_in = teacherRows.filter((r) => r.check_in_time != null).length;

    const sessionsToday = await ClassSession.count({ where: { session_date: date } });

    const sessions = await ClassSession.findAll({
      where: { session_date: date },
      attributes: ["id"],
    });
    const sids = sessions.map((s) => s.id);
    let attendance_records_today = 0;
    let students_present_today = 0;
    if (sids.length) {
      const att = await ClassAttendance.findAll({
        where: { class_session_id: { [Op.in]: sids }, status: "present" },
      });
      attendance_records_today = att.length;
      students_present_today = new Set(att.map((a) => a.student_id)).size;
    }

    const overallSnapshots = await OverallAverage.count({
      where: {},
    });

    return res.json({
      success: true,
      data: {
        date,
        teachers_with_attendance_row: teacherRows.length,
        teachers_checked_in,
        class_sessions_scheduled: sessionsToday,
        attendance_present_records: attendance_records_today,
        distinct_students_present: students_present_today,
        overall_average_snapshots_total: overallSnapshots,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
