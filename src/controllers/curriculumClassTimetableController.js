const { Op } = require("sequelize");
const {
  Curriculum,
  CurriculumClass,
  CurriculumClassLevel,
  CurriculumClassTimetable,
  CurriculumClassTimetableLesson,
  CurriculumSubject,
  AcademicYear,
  Teacher,
  User,
  TeacherCurriculumSubject,
} = require("../models");

const userSafe = { attributes: { exclude: ["password_hash"] } };

const lessonInclude = [
  {
    model: CurriculumSubject,
    as: "curriculum_subject",
    attributes: ["id", "name", "curriculum_id", "curriculum_class_id", "subject_id"],
  },
  {
    model: Teacher,
    as: "teacher",
    required: false,
    include: [{ model: User, as: "user", ...userSafe }],
  },
];

const academicYearInclude = { model: AcademicYear, as: "academic_year", required: false };
const curriculumClassLevelInclude = {
  model: CurriculumClassLevel,
  as: "curriculum_class_level",
  required: false,
  attributes: ["id", "name", "level_order", "curriculum_class_id"],
};

const timetableIncludesBase = [academicYearInclude, curriculumClassLevelInclude];

const timetableLessonsInclude = {
  model: CurriculumClassTimetableLesson,
  as: "lessons",
  separate: true,
  order: [
    ["lesson_date", "ASC"],
    ["starts_at", "ASC"],
  ],
  include: lessonInclude,
};

function isoWeekdayFromDateOnly(dateOnlyStr) {
  const parts = String(dateOnlyStr).trim().split("-").map(Number);
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return null;
  const [y, m, d] = parts;
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return dow === 0 ? 7 : dow;
}

/** Add calendar days to a YYYY-MM-DD string (UTC date arithmetic). */
function addDaysToIsoDate(isoDateStr, daysToAdd) {
  const parts = String(isoDateStr).trim().split("-").map(Number);
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return isoDateStr;
  const [y, m, d] = parts;
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + Number(daysToAdd) || 0);
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(dt.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

function serverLocalTodayIso() {
  const n = new Date();
  const yy = n.getFullYear();
  const mm = String(n.getMonth() + 1).padStart(2, "0");
  const dd = String(n.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

function timeToSeconds(val) {
  if (val == null || val === "") return null;
  if (typeof val === "string") {
    const t = val.trim().slice(0, 8);
    const segs = t.split(":");
    const hh = Number(segs[0]);
    const mm = Number(segs[1] ?? 0);
    const ss = Number(segs[2] ?? 0);
    if (!Number.isFinite(hh) || !Number.isFinite(mm)) return null;
    return hh * 3600 + mm * 60 + (Number.isFinite(ss) ? ss : 0);
  }
  if (val instanceof Date) {
    return val.getUTCHours() * 3600 + val.getUTCMinutes() * 60 + val.getUTCSeconds();
  }
  return null;
}

function normalizeDeliveryMode(raw) {
  const s = raw == null ? "" : String(raw).trim().toLowerCase();
  if (s === "online") return "online";
  return "physical";
}

function intervalsOverlap(aStart, aEnd, bStart, bEnd) {
  const as = timeToSeconds(aStart);
  const ae = timeToSeconds(aEnd);
  const bs = timeToSeconds(bStart);
  const be = timeToSeconds(bEnd);
  if (as == null || ae == null || bs == null || be == null) return false;
  if (ae <= as || be <= bs) return false;
  return as < be && bs < ae;
}

async function assertNoTeacherOverlap({ teacherId, lessonDate, startsAt, endsAt, excludeLessonId }) {
  if (!teacherId || !lessonDate || startsAt == null || endsAt == null || startsAt === "" || endsAt === "") return;

  const rows = await CurriculumClassTimetableLesson.findAll({
    where: {
      teacher_id: teacherId,
      lesson_date: lessonDate,
      starts_at: { [Op.ne]: null },
      ends_at: { [Op.ne]: null },
      ...(excludeLessonId ? { id: { [Op.ne]: excludeLessonId } } : {}),
    },
    attributes: ["id", "starts_at", "ends_at"],
  });

  for (const r of rows) {
    if (intervalsOverlap(startsAt, endsAt, r.starts_at, r.ends_at)) {
      const err = new Error(
        "This teacher already has a lesson that overlaps this time on that date (including other curricula)."
      );
      err.statusCode = 409;
      throw err;
    }
  }
}

async function teacherMayTeachLesson({ teacherId, curriculumSubjectId }) {
  const tcs = await TeacherCurriculumSubject.findOne({
    where: { teacher_id: teacherId, curriculum_subject_id: curriculumSubjectId },
  });
  if (tcs) return { ok: true };
  return {
    ok: false,
    message: "Teacher must be assigned to this curriculum subject",
  };
}

async function loadCurriculumClass(curriculumId, classId) {
  return CurriculumClass.findOne({
    where: { id: classId, curriculum_id: curriculumId },
    attributes: ["id", "curriculum_id", "name", "code"],
  });
}

async function subjectAllowedForCurriculumClass(curriculumClass, curriculumSubjectId) {
  const sub = await CurriculumSubject.findByPk(curriculumSubjectId);
  if (!sub || sub.curriculum_id !== curriculumClass.curriculum_id) {
    return { ok: false, message: "curriculum_subject does not belong to this curriculum" };
  }
  if (sub.curriculum_class_id != null && sub.curriculum_class_id !== curriculumClass.id) {
    return { ok: false, message: "curriculum_subject is scoped to a different curriculum class" };
  }
  return { ok: true, subject: sub };
}

async function loadTimetableInClass(curriculumId, classId, timetableId) {
  const curriculumClass = await loadCurriculumClass(curriculumId, classId);
  if (!curriculumClass) return { error: { status: 404, message: "Curriculum class not found" } };
  const timetable = await CurriculumClassTimetable.findOne({
    where: { id: timetableId, curriculum_class_id: classId },
  });
  if (!timetable) return { error: { status: 404, message: "Timetable not found" } };
  return { curriculumClass, timetable };
}

const dayViewLessonInclude = [
  {
    model: CurriculumClassTimetable,
    as: "timetable",
    attributes: ["id", "name", "curriculum_class_id"],
    include: [
      {
        model: CurriculumClass,
        as: "curriculum_class",
        attributes: ["id", "name", "code", "curriculum_id"],
        include: [{ model: Curriculum, as: "curriculum", attributes: ["id", "name"] }],
      },
      {
        model: CurriculumClassLevel,
        as: "curriculum_class_level",
        required: false,
        attributes: ["id", "name", "level_order"],
      },
    ],
  },
  {
    model: CurriculumSubject,
    as: "curriculum_subject",
    attributes: ["id", "name"],
  },
  {
    model: Teacher,
    as: "teacher",
    required: false,
    include: [{ model: User, as: "user", ...userSafe }],
  },
];

exports.listTimetableLessonsByDate = async (req, res) => {
  try {
    const raw = req.query.date;
    const date = raw != null ? String(raw).trim() : "";
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        success: false,
        message: "date query parameter is required (YYYY-MM-DD)",
      });
    }
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limitRaw = parseInt(req.query.limit, 10) || 10;
    const limit = Math.min(100, Math.max(1, limitRaw));
    const offset = (page - 1) * limit;

    const total = await CurriculumClassTimetableLesson.count({ where: { lesson_date: date } });

    const rows = await CurriculumClassTimetableLesson.findAll({
      where: { lesson_date: date },
      include: dayViewLessonInclude,
      order: [["starts_at", "ASC"], ["created_at", "ASC"]],
      limit,
      offset,
    });

    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    return res.json({
      success: true,
      data: rows,
      pagination: {
        page,
        limit,
        total,
        total_pages: totalPages,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/** Online-only timetable slots from `from` through `from + days` (for admin live hub). */
exports.listOnlineTimetableLessonsUpcoming = async (req, res) => {
  try {
    let from = req.query.from != null ? String(req.query.from).trim() : "";
    if (!from || !/^\d{4}-\d{2}-\d{2}$/.test(from)) {
      from = serverLocalTodayIso();
    }
    const days = Math.min(90, Math.max(1, parseInt(req.query.days, 10) || 28));
    const toIso = addDaysToIsoDate(from, days);
    const limit = Math.min(120, Math.max(1, parseInt(req.query.limit, 10) || 60));

    const rows = await CurriculumClassTimetableLesson.findAll({
      where: {
        delivery_mode: "online",
        lesson_date: { [Op.between]: [from, toIso] },
      },
      include: dayViewLessonInclude,
      order: [
        ["lesson_date", "ASC"],
        ["starts_at", "ASC"],
      ],
      limit,
    });

    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.listTeachersForCurriculumTimetable = async (req, res) => {
  try {
    const { curriculumId } = req.params;
    const subjectId = req.query.curriculum_subject_id;
    if (!subjectId || String(subjectId).trim() === "") {
      return res.status(400).json({
        success: false,
        message: "curriculum_subject_id query parameter is required",
      });
    }
    const cur = await Curriculum.findByPk(curriculumId, { attributes: ["id"] });
    if (!cur) {
      return res.status(404).json({ success: false, message: "Curriculum not found" });
    }
    const sub = await CurriculumSubject.findByPk(subjectId, { attributes: ["id", "curriculum_id"] });
    if (!sub || sub.curriculum_id !== curriculumId) {
      return res.status(400).json({
        success: false,
        message: "curriculum_subject does not belong to this curriculum",
      });
    }
    const rows = await Teacher.findAll({
      include: [
        {
          model: CurriculumSubject,
          as: "teaching_curriculum_subjects",
          where: { id: subjectId },
          attributes: [],
          through: { attributes: [] },
          required: true,
        },
        { model: User, as: "user", ...userSafe },
      ],
    });
    rows.sort((a, b) => {
      const na = (a.user?.full_name || a.user?.username || "").toLowerCase();
      const nb = (b.user?.full_name || b.user?.username || "").toLowerCase();
      return na.localeCompare(nb);
    });
    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.listCurriculumClassTimetables = async (req, res) => {
  try {
    const { curriculumId, classId } = req.params;
    const cc = await loadCurriculumClass(curriculumId, classId);
    if (!cc) {
      return res.status(404).json({ success: false, message: "Curriculum class not found" });
    }
    const includeLessons = req.query.include_lessons !== "false";
    const rows = await CurriculumClassTimetable.findAll({
      where: { curriculum_class_id: classId },
      include: includeLessons ? [...timetableIncludesBase, timetableLessonsInclude] : timetableIncludesBase,
      order: [["created_at", "DESC"]],
    });
    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createCurriculumClassTimetable = async (req, res) => {
  try {
    const { curriculumId, classId } = req.params;
    const cc = await loadCurriculumClass(curriculumId, classId);
    if (!cc) {
      return res.status(404).json({ success: false, message: "Curriculum class not found" });
    }
    const {
      curriculum_class_level_id: levelId,
      name,
      is_active,
      academic_year_id: ayBody,
    } = req.body;

    if (!levelId) {
      return res.status(400).json({ success: false, message: "curriculum_class_level_id is required" });
    }
    const level = await CurriculumClassLevel.findOne({
      where: { id: levelId, curriculum_class_id: classId },
    });
    if (!level) {
      return res.status(400).json({
        success: false,
        message: "curriculum_class_level does not belong to this curriculum class",
      });
    }

    let ayId = ayBody;
    if (ayId) {
      const ay = await AcademicYear.findByPk(ayId);
      if (!ay) {
        return res.status(400).json({ success: false, message: "Invalid academic_year_id" });
      }
    } else {
      ayId = null;
    }

    const row = await CurriculumClassTimetable.create({
      curriculum_class_id: classId,
      curriculum_class_level_id: levelId,
      academic_year_id: ayId || null,
      name: name ?? null,
      is_active: is_active !== undefined ? !!is_active : true,
    });
    const created = await CurriculumClassTimetable.findByPk(row.id, {
      include: [...timetableIncludesBase, timetableLessonsInclude],
    });
    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.getCurriculumClassTimetable = async (req, res) => {
  try {
    const { curriculumId, classId, timetableId } = req.params;
    const { error, timetable } = await loadTimetableInClass(curriculumId, classId, timetableId);
    if (error) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    const row = await CurriculumClassTimetable.findByPk(timetable.id, {
      include: [
        ...timetableIncludesBase,
        { model: CurriculumClass, as: "curriculum_class", attributes: ["id", "name", "code", "curriculum_id"] },
        timetableLessonsInclude,
      ],
    });
    return res.json({ success: true, data: row });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateCurriculumClassTimetable = async (req, res) => {
  try {
    const { curriculumId, classId, timetableId } = req.params;
    const { error, timetable } = await loadTimetableInClass(curriculumId, classId, timetableId);
    if (error) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    const patch = {};
    if (req.body.name !== undefined) patch.name = req.body.name;
    if (req.body.is_active !== undefined) patch.is_active = !!req.body.is_active;

    if (req.body.curriculum_class_level_id !== undefined) {
      const lid = req.body.curriculum_class_level_id;
      if (lid === null || lid === "") {
        patch.curriculum_class_level_id = null;
      } else {
        const level = await CurriculumClassLevel.findOne({
          where: { id: lid, curriculum_class_id: classId },
        });
        if (!level) {
          return res.status(400).json({
            success: false,
            message: "curriculum_class_level does not belong to this curriculum class",
          });
        }
        patch.curriculum_class_level_id = lid;
      }
    }

    if (req.body.academic_year_id !== undefined) {
      if (req.body.academic_year_id === null || req.body.academic_year_id === "") {
        patch.academic_year_id = null;
      } else {
        const ay = await AcademicYear.findByPk(req.body.academic_year_id);
        if (!ay) {
          return res.status(400).json({ success: false, message: "Invalid academic_year_id" });
        }
        patch.academic_year_id = req.body.academic_year_id;
      }
    }
    await timetable.update(patch);
    const updated = await CurriculumClassTimetable.findByPk(timetable.id, {
      include: [...timetableIncludesBase, timetableLessonsInclude],
    });
    return res.json({ success: true, data: updated });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteCurriculumClassTimetable = async (req, res) => {
  try {
    const { curriculumId, classId, timetableId } = req.params;
    const { error, timetable } = await loadTimetableInClass(curriculumId, classId, timetableId);
    if (error) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    await timetable.destroy();
    return res.json({ success: true, message: "Timetable deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createTimetableLesson = async (req, res) => {
  try {
    const { curriculumId, classId, timetableId } = req.params;
    const { curriculumClass, timetable, error } = await loadTimetableInClass(curriculumId, classId, timetableId);
    if (error) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    const {
      lesson_date,
      day_of_week,
      period_index,
      starts_at,
      ends_at,
      curriculum_subject_id,
      teacher_id,
      room,
      notes,
      teacher_attended,
      delivery_mode,
    } = req.body;

    if (!lesson_date || typeof lesson_date !== "string") {
      return res.status(400).json({ success: false, message: "lesson_date is required (YYYY-MM-DD)" });
    }
    if (!curriculum_subject_id) {
      return res.status(400).json({ success: false, message: "curriculum_subject_id is required" });
    }
    if (starts_at == null || ends_at == null || String(starts_at).trim() === "" || String(ends_at).trim() === "") {
      return res.status(400).json({ success: false, message: "starts_at and ends_at are required" });
    }

    const ss = timeToSeconds(starts_at);
    const es = timeToSeconds(ends_at);
    if (ss == null || es == null || es <= ss) {
      return res.status(400).json({ success: false, message: "Invalid times: end must be after start" });
    }

    let d = day_of_week != null ? Number(day_of_week) : null;
    if (d != null && (!Number.isInteger(d) || d < 1 || d > 7)) {
      return res.status(400).json({ success: false, message: "day_of_week must be 1–7 when provided" });
    }
    if (d == null) {
      d = isoWeekdayFromDateOnly(lesson_date);
      if (d == null) {
        return res.status(400).json({ success: false, message: "Invalid lesson_date" });
      }
    }

    let p = period_index != null ? Number(period_index) : null;
    if (p != null && (!Number.isInteger(p) || p < 1)) {
      return res.status(400).json({ success: false, message: "period_index must be a positive integer when provided" });
    }

    const allowed = await subjectAllowedForCurriculumClass(curriculumClass, curriculum_subject_id);
    if (!allowed.ok) {
      return res.status(400).json({ success: false, message: allowed.message });
    }

    if (teacher_id) {
      const tm = await teacherMayTeachLesson({
        teacherId: teacher_id,
        curriculumSubjectId: curriculum_subject_id,
      });
      if (!tm.ok) {
        return res.status(400).json({ success: false, message: tm.message });
      }
      try {
        await assertNoTeacherOverlap({
          teacherId: teacher_id,
          lessonDate: lesson_date,
          startsAt: starts_at,
          endsAt: ends_at,
        });
      } catch (e) {
        const code = e.statusCode || 400;
        return res.status(code).json({ success: false, message: e.message });
      }
    }

    const row = await CurriculumClassTimetableLesson.create({
      timetable_id: timetable.id,
      lesson_date,
      day_of_week: d,
      period_index: p,
      starts_at,
      ends_at,
      curriculum_subject_id,
      teacher_id: teacher_id || null,
      room: room ?? null,
      notes: notes ?? null,
      teacher_attended: teacher_attended !== undefined ? !!teacher_attended : false,
      delivery_mode: normalizeDeliveryMode(delivery_mode),
    });

    const created = await CurriculumClassTimetableLesson.findByPk(row.id, { include: lessonInclude });
    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateTimetableLesson = async (req, res) => {
  try {
    const { curriculumId, classId, timetableId, lessonId } = req.params;
    const { curriculumClass, timetable, error } = await loadTimetableInClass(curriculumId, classId, timetableId);
    if (error) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    const lesson = await CurriculumClassTimetableLesson.findOne({
      where: { id: lessonId, timetable_id: timetable.id },
    });
    if (!lesson) {
      return res.status(404).json({ success: false, message: "Lesson not found" });
    }

    const patch = {};
    if (req.body.lesson_date !== undefined) {
      if (!req.body.lesson_date) {
        return res.status(400).json({ success: false, message: "lesson_date cannot be empty" });
      }
      patch.lesson_date = req.body.lesson_date;
    }
    if (req.body.day_of_week !== undefined) {
      if (req.body.day_of_week === null) {
        patch.day_of_week = null;
      } else {
        const d = Number(req.body.day_of_week);
        if (!Number.isInteger(d) || d < 1 || d > 7) {
          return res.status(400).json({ success: false, message: "day_of_week must be 1–7" });
        }
        patch.day_of_week = d;
      }
    }
    if (req.body.period_index !== undefined) {
      if (req.body.period_index === null || req.body.period_index === "") {
        patch.period_index = null;
      } else {
        const p = Number(req.body.period_index);
        if (!Number.isInteger(p) || p < 1) {
          return res.status(400).json({ success: false, message: "period_index must be a positive integer" });
        }
        patch.period_index = p;
      }
    }
    if (req.body.starts_at !== undefined) patch.starts_at = req.body.starts_at || null;
    if (req.body.ends_at !== undefined) patch.ends_at = req.body.ends_at || null;
    if (req.body.room !== undefined) patch.room = req.body.room;
    if (req.body.notes !== undefined) patch.notes = req.body.notes;
    if (req.body.teacher_attended !== undefined) patch.teacher_attended = !!req.body.teacher_attended;
    if (req.body.delivery_mode !== undefined) patch.delivery_mode = normalizeDeliveryMode(req.body.delivery_mode);

    const overlapDate = patch.lesson_date ?? lesson.lesson_date;
    const overlapStart = patch.starts_at !== undefined ? patch.starts_at : lesson.starts_at;
    const overlapEnd = patch.ends_at !== undefined ? patch.ends_at : lesson.ends_at;

    if (overlapDate && overlapStart && overlapEnd) {
      const ss = timeToSeconds(overlapStart);
      const es = timeToSeconds(overlapEnd);
      if (ss == null || es == null || es <= ss) {
        return res.status(400).json({ success: false, message: "Invalid times: end must be after start" });
      }
    }

    if (patch.lesson_date !== undefined && patch.day_of_week === undefined && lesson.day_of_week != null) {
      const iw = isoWeekdayFromDateOnly(patch.lesson_date);
      if (iw != null) patch.day_of_week = iw;
    }

    if (req.body.curriculum_subject_id !== undefined) {
      const allowed = await subjectAllowedForCurriculumClass(curriculumClass, req.body.curriculum_subject_id);
      if (!allowed.ok) {
        return res.status(400).json({ success: false, message: allowed.message });
      }
      patch.curriculum_subject_id = req.body.curriculum_subject_id;
    }

    const effectiveSubject =
      patch.curriculum_subject_id !== undefined ? patch.curriculum_subject_id : lesson.curriculum_subject_id;

    if (req.body.teacher_id !== undefined) {
      const tid = req.body.teacher_id || null;
      patch.teacher_id = tid;
      if (tid) {
        const tm = await teacherMayTeachLesson({
          teacherId: tid,
          curriculumSubjectId: effectiveSubject,
        });
        if (!tm.ok) {
          return res.status(400).json({ success: false, message: tm.message });
        }
      }
    } else if (lesson.teacher_id && patch.curriculum_subject_id !== undefined) {
      const tm = await teacherMayTeachLesson({
        teacherId: lesson.teacher_id,
        curriculumSubjectId: effectiveSubject,
      });
      if (!tm.ok) {
        return res.status(400).json({ success: false, message: tm.message });
      }
    }

    const effectiveTeacher =
      patch.teacher_id !== undefined ? patch.teacher_id : lesson.teacher_id;

    if (effectiveTeacher && overlapDate && overlapStart && overlapEnd) {
      try {
        await assertNoTeacherOverlap({
          teacherId: effectiveTeacher,
          lessonDate: overlapDate,
          startsAt: overlapStart,
          endsAt: overlapEnd,
          excludeLessonId: lesson.id,
        });
      } catch (e) {
        const code = e.statusCode || 400;
        return res.status(code).json({ success: false, message: e.message });
      }
    }

    await lesson.update(patch);
    const updated = await CurriculumClassTimetableLesson.findByPk(lesson.id, { include: lessonInclude });
    return res.json({ success: true, data: updated });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteTimetableLesson = async (req, res) => {
  try {
    const { curriculumId, classId, timetableId, lessonId } = req.params;
    const { timetable, error } = await loadTimetableInClass(curriculumId, classId, timetableId);
    if (error) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    const lesson = await CurriculumClassTimetableLesson.findOne({
      where: { id: lessonId, timetable_id: timetable.id },
    });
    if (!lesson) {
      return res.status(404).json({ success: false, message: "Lesson not found" });
    }
    await lesson.destroy();
    return res.json({ success: true, message: "Lesson removed" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
