const { LessonProgress, ClassSession, Teacher } = require("../models");

async function teacherProfile(req) {
  return Teacher.findOne({ where: { user_id: req.user.id } });
}

async function assertLessonProgressEditor(req, progress) {
  const staff = ["admin", "accountant", "librarian"].includes(req.user.role);
  if (staff) return true;
  const session = await ClassSession.findByPk(progress.class_session_id);
  if (!session) return false;
  if (req.user.role !== "teacher") return false;
  const t = await teacherProfile(req);
  return !!(t && session.teacher_id === t.id);
}

exports.listLessonProgress = async (req, res) => {
  try {
    const where = {};
    if (req.query.class_session_id) where.class_session_id = req.query.class_session_id;
    if (req.query.syllabus_chapter_id) where.syllabus_chapter_id = req.query.syllabus_chapter_id;

    const rows = await LessonProgress.findAll({
      where,
      order: [["created_at", "DESC"]],
    });
    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getLessonProgress = async (req, res) => {
  try {
    const row = await LessonProgress.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, data: row });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createLessonProgress = async (req, res) => {
  try {
    const session = await ClassSession.findByPk(req.body.class_session_id);
    if (!session) return res.status(400).json({ success: false, message: "Invalid class_session_id" });

    const staff = ["admin", "accountant", "librarian"].includes(req.user.role);
    if (!staff) {
      if (req.user.role !== "teacher") {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }
      const t = await teacherProfile(req);
      if (!t || session.teacher_id !== t.id) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }
    }

    const row = await LessonProgress.create(req.body);
    return res.status(201).json({ success: true, data: row });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateLessonProgress = async (req, res) => {
  try {
    const row = await LessonProgress.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Not found" });
    const ok = await assertLessonProgressEditor(req, row);
    if (!ok) return res.status(403).json({ success: false, message: "Forbidden" });

    const allowed = [
      "percentage_covered",
      "topics_covered",
      "student_mastery_level",
      "additional_notes",
    ];
    const patch = {};
    for (const k of allowed) {
      if (req.body[k] !== undefined) patch[k] = req.body[k];
    }
    await row.update(patch);
    return res.json({ success: true, data: row });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteLessonProgress = async (req, res) => {
  try {
    const row = await LessonProgress.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Not found" });
    const ok = await assertLessonProgressEditor(req, row);
    if (!ok) return res.status(403).json({ success: false, message: "Forbidden" });
    await row.destroy();
    return res.json({ success: true, message: "Deleted" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
