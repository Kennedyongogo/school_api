const {
  LiveClass,
  LiveClassLobbyEntry,
  Student,
  CurriculumClassTimetableLesson,
  CurriculumClassTimetable,
  CurriculumSubject,
  CurriculumClass,
} = require("../models");

const TT_LESSON_MEETING_RE =
  /^tt-lesson-([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;

const liveClassAccessInclude = [
  {
    model: CurriculumClassTimetableLesson,
    as: "timetable_lesson",
    required: false,
    attributes: ["id", "lesson_date", "starts_at", "ends_at", "curriculum_subject_id"],
    include: [
      {
        model: CurriculumClassTimetable,
        as: "timetable",
        required: false,
        attributes: ["id", "curriculum_class_id"],
      },
      {
        model: CurriculumSubject,
        as: "curriculum_subject",
        required: false,
        attributes: ["id", "name", "curriculum_class_id"],
      },
    ],
  },
];

function parseLessonIdFromMeetingId(meetingId) {
  const m = String(meetingId || "").match(TT_LESSON_MEETING_RE);
  return m ? m[1] : null;
}

async function attachTimetableLessonIfNeeded(live) {
  const lessonId = live?.curriculum_class_timetable_lesson_id;
  if (!lessonId || live?.timetable_lesson) return;
  const lesson = await CurriculumClassTimetableLesson.findByPk(lessonId, {
    attributes: ["id", "lesson_date", "starts_at", "ends_at", "curriculum_subject_id"],
    include: liveClassAccessInclude[0].include,
  });
  if (lesson) live.setDataValue("timetable_lesson", lesson);
}

/**
 * Recover timetable link when FK was cleared (e.g. lesson row deleted with ON DELETE SET NULL)
 * but meeting_id still encodes the lesson (tt-lesson-{uuid}-…).
 */
async function isStudentAdmittedToLobby(liveClassId, userId) {
  if (!liveClassId || !userId) return false;
  const entry = await LiveClassLobbyEntry.findOne({
    where: { live_class_id: liveClassId, user_id: userId, status: "admitted" },
    attributes: ["id", "left_at"],
    order: [["admitted_at", "DESC"]],
  });
  return !!entry && !entry.left_at;
}

async function ensureLiveClassLessonLink(live) {
  if (!live?.id) return null;

  if (live.timetable_lesson?.id) {
    const fromInclude = live.timetable_lesson.id;
    if (!live.curriculum_class_timetable_lesson_id) {
      live.setDataValue("curriculum_class_timetable_lesson_id", fromInclude);
    }
    return fromInclude;
  }

  let lessonId = live.curriculum_class_timetable_lesson_id || null;
  if (!lessonId) {
    const row = await LiveClass.findByPk(live.id, {
      attributes: ["curriculum_class_timetable_lesson_id", "meeting_id"],
    });
    lessonId = row?.curriculum_class_timetable_lesson_id || null;
    if (lessonId) {
      live.setDataValue("curriculum_class_timetable_lesson_id", lessonId);
      if (!live.meeting_id && row.meeting_id) live.setDataValue("meeting_id", row.meeting_id);
    }
  }

  if (lessonId) {
    await attachTimetableLessonIfNeeded(live);
    return lessonId;
  }

  const parsed = parseLessonIdFromMeetingId(live.meeting_id);
  if (!parsed) return null;

  const lessonExists = await CurriculumClassTimetableLesson.findByPk(parsed, { attributes: ["id"] });
  if (!lessonExists) return null;

  await LiveClass.update(
    { curriculum_class_timetable_lesson_id: parsed },
    { where: { id: live.id, curriculum_class_timetable_lesson_id: null } }
  );
  live.setDataValue("curriculum_class_timetable_lesson_id", parsed);
  await attachTimetableLessonIfNeeded(live);
  return parsed;
}

async function loadLiveClassForAccess(liveClassId) {
  const live = await LiveClass.findByPk(liveClassId, {
    attributes: [
      "id",
      "session_status",
      "teacher_id",
      "meeting_id",
      "platform",
      "curriculum_class_timetable_lesson_id",
    ],
    include: liveClassAccessInclude,
  });
  if (!live) return null;
  await ensureLiveClassLessonLink(live);
  return live;
}

/** Same rule as portal timetable list: lesson belongs to a timetable for the student's class. */
async function isLessonVisibleToStudentClass(lessonId, studentCurriculumClassId) {
  if (!lessonId || !studentCurriculumClassId) return false;
  const count = await CurriculumClassTimetableLesson.count({
    where: { id: lessonId },
    include: [
      {
        model: CurriculumClassTimetable,
        as: "timetable",
        required: true,
        where: { curriculum_class_id: studentCurriculumClassId },
      },
    ],
  });
  return count > 0;
}

function audienceClassIdsFromLive(live) {
  const ids = new Set();
  const fromTimetable = live?.timetable_lesson?.timetable?.curriculum_class_id;
  const fromSubject = live?.timetable_lesson?.curriculum_subject?.curriculum_class_id;
  if (fromTimetable) ids.add(String(fromTimetable));
  if (fromSubject) ids.add(String(fromSubject));
  return ids;
}

async function buildClassMismatchMessage(studentCurriculumClassId, live) {
  const lessonClassId =
    live?.timetable_lesson?.timetable?.curriculum_class_id ||
    live?.timetable_lesson?.curriculum_subject?.curriculum_class_id ||
    null;

  const [studentClass, lessonClass] = await Promise.all([
    studentCurriculumClassId
      ? CurriculumClass.findByPk(studentCurriculumClassId, { attributes: ["id", "name", "code"] })
      : null,
    lessonClassId ? CurriculumClass.findByPk(lessonClassId, { attributes: ["id", "name", "code"] }) : null,
  ]);

  const label = (cc) => {
    if (!cc) return null;
    const name = cc.name ? String(cc.name).trim() : "";
    const code = cc.code ? String(cc.code).trim() : "";
    if (name && code) return `${name} (${code})`;
    return name || code || null;
  };

  const yours = label(studentClass);
  const sessionFor = label(lessonClass);

  if (yours && sessionFor) {
    return `This online class is for ${sessionFor}, but your portal class is ${yours}. Ask the school office to confirm your class assignment matches this lesson.`;
  }
  return "This online class is not for your registered class.";
}

/**
 * @returns {Promise<{ role: 'student', studentId: string }>}
 */
async function assertStudentCanAccessLiveClass(student, live, options = {}) {
  if (!student) {
    const err = new Error("Student profile not found.");
    err.statusCode = 404;
    throw err;
  }
  if (!student.curriculum_class_id) {
    const err = new Error("Your profile has no class placement.");
    err.statusCode = 403;
    throw err;
  }

  const userId = options.userId || student.user_id || null;
  if (userId && live?.id && (await isStudentAdmittedToLobby(live.id, userId))) {
    await ensureLiveClassLessonLink(live);
    return { role: "student", studentId: student.id };
  }

  const lessonId = live?.curriculum_class_timetable_lesson_id || (await ensureLiveClassLessonLink(live));
  if (!lessonId) {
    const err = new Error(
      "This live session is not linked to a timetable lesson. Ask your teacher to start the online class again from the timetable."
    );
    err.statusCode = 403;
    throw err;
  }

  const audienceIds = audienceClassIdsFromLive(live);
  const studentClassId = String(student.curriculum_class_id);

  if (audienceIds.has(studentClassId)) {
    return { role: "student", studentId: student.id };
  }

  const visibleOnTimetable = await isLessonVisibleToStudentClass(lessonId, student.curriculum_class_id);
  if (visibleOnTimetable) {
    return { role: "student", studentId: student.id };
  }

  const err = new Error(await buildClassMismatchMessage(student.curriculum_class_id, live));
  err.statusCode = 403;
  throw err;
}

module.exports = {
  liveClassAccessInclude,
  loadLiveClassForAccess,
  ensureLiveClassLessonLink,
  parseLessonIdFromMeetingId,
  isLessonVisibleToStudentClass,
  audienceClassIdsFromLive,
  isStudentAdmittedToLobby,
  assertStudentCanAccessLiveClass,
};
