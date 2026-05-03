const { SyllabusChapter, Syllabus, ClassAssignment, Teacher } = require("../models");
const { STAFF_ROLES } = require("../constants/userRoles");

async function teacherProfile(req) {
  return Teacher.findOne({ where: { user_id: req.user.id } });
}

async function canEditChapter(req, chapter) {
  const staff = STAFF_ROLES.includes(req.user.role);
  if (staff) return true;
  if (req.user.role !== "teacher") return false;
  const syllabus = await Syllabus.findByPk(chapter.syllabus_id);
  if (!syllabus) return false;
  const t = await teacherProfile(req);
  if (!t) return false;
  const ca = await ClassAssignment.findByPk(syllabus.class_assignment_id);
  return !!(ca && ca.teacher_id === t.id);
}

exports.listChapters = async (req, res) => {
  try {
    const where = {};
    if (req.query.syllabus_id) where.syllabus_id = req.query.syllabus_id;
    const rows = await SyllabusChapter.findAll({
      where,
      order: [
        ["syllabus_id", "ASC"],
        ["chapter_number", "ASC"],
      ],
    });
    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getChapter = async (req, res) => {
  try {
    const row = await SyllabusChapter.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Chapter not found" });
    return res.json({ success: true, data: row });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createChapter = async (req, res) => {
  try {
    const syllabus = await Syllabus.findByPk(req.body.syllabus_id);
    if (!syllabus) return res.status(400).json({ success: false, message: "Invalid syllabus_id" });
    const ok = await canEditChapter(req, { syllabus_id: syllabus.id });
    if (!ok) return res.status(403).json({ success: false, message: "Forbidden" });

    const row = await SyllabusChapter.create(req.body);
    return res.status(201).json({ success: true, data: row });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateChapter = async (req, res) => {
  try {
    const row = await SyllabusChapter.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Chapter not found" });
    const ok = await canEditChapter(req, row);
    if (!ok) return res.status(403).json({ success: false, message: "Forbidden" });

    const allowed = [
      "chapter_number",
      "chapter_name",
      "description",
      "learning_objectives",
      "key_topics",
      "estimated_weeks",
      "start_date",
      "end_date",
      "resources",
      "is_completed",
      "completed_at",
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

exports.deleteChapter = async (req, res) => {
  try {
    const row = await SyllabusChapter.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Chapter not found" });
    const ok = await canEditChapter(req, row);
    if (!ok) return res.status(403).json({ success: false, message: "Forbidden" });
    await row.destroy();
    return res.json({ success: true, message: "Deleted" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
