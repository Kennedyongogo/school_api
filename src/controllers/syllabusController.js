const { Op } = require("sequelize");
const {
  Syllabus,
  SyllabusChapter,
  ClassAssignment,
  Enrollment,
  Student,
  Parent,
  Teacher,
} = require("../models");
const { STAFF_ROLES } = require("../constants/userRoles");

const TEACH_OR_STAFF_ROLES = [...STAFF_ROLES, "teacher"];

async function teacherProfile(req) {
  return Teacher.findOne({ where: { user_id: req.user.id } });
}

const chapterInclude = {
  model: SyllabusChapter,
  as: "syllabus_chapters",
  separate: true,
  order: [["chapter_number", "ASC"]],
};

async function assertSyllabusEditor(req, syllabus) {
  const staff = STAFF_ROLES.includes(req.user.role);
  if (staff) return true;
  if (req.user.role !== "teacher") return false;
  const t = await teacherProfile(req);
  if (!t) return false;
  const ca = await ClassAssignment.findByPk(syllabus.class_assignment_id);
  return !!(ca && ca.teacher_id === t.id);
}

async function assertCanViewClassAssignment(req, classAssignmentId, studentId) {
  const staff = TEACH_OR_STAFF_ROLES.includes(req.user.role);
  if (staff) return true;

  const ca = await ClassAssignment.findByPk(classAssignmentId);
  if (!ca) return false;

  if (req.user.role === "student") {
    const profile = await Student.findOne({ where: { user_id: req.user.id } });
    if (!profile || profile.id !== studentId) return false;
    const en = await Enrollment.findOne({
      where: { student_id: profile.id, section_id: ca.section_id, is_active: true },
    });
    return !!en;
  }

  if (req.user.role === "parent") {
    const parent = await Parent.findOne({ where: { user_id: req.user.id } });
    if (!parent) return false;
    const link = await Parent.findOne({
      where: {
        user_id: parent.user_id,
        student_ids: { [Op.contains]: [studentId] },
      },
    });
    if (!link) return false;
    const en = await Enrollment.findOne({
      where: { student_id: studentId, section_id: ca.section_id, is_active: true },
    });
    return !!en;
  }

  return false;
}

exports.listSyllabi = async (req, res) => {
  try {
    const where = {};
    if (req.query.class_assignment_id) where.class_assignment_id = req.query.class_assignment_id;
    if (req.query.semester_id) where.semester_id = req.query.semester_id;
    if (req.query.academic_year_id) where.academic_year_id = req.query.academic_year_id;
    if (req.query.status) where.status = req.query.status;

    if (req.user.role === "student") {
      const profile = await Student.findOne({ where: { user_id: req.user.id } });
      if (!profile) return res.json({ success: true, data: [] });
      const enrollments = await Enrollment.findAll({
        where: { student_id: profile.id, is_active: true },
        attributes: ["section_id"],
      });
      const sectionIds = [...new Set(enrollments.map((e) => e.section_id))];
      if (!sectionIds.length) return res.json({ success: true, data: [] });
      const cas = await ClassAssignment.findAll({
        where: { section_id: { [Op.in]: sectionIds } },
        attributes: ["id"],
      });
      const caIds = cas.map((c) => c.id);
      where.class_assignment_id = { [Op.in]: caIds };
      where.status = "published";
    }

    if (req.user.role === "parent") {
      const parent = await Parent.findOne({ where: { user_id: req.user.id } });
      if (!parent) return res.json({ success: true, data: [] });
      const parentRow = await Parent.findOne({
        where: { user_id: parent.user_id },
        attributes: ["student_ids"],
      });
      const studentIds = parentRow?.student_ids?.filter(Boolean) || [];
      if (!studentIds.length) return res.json({ success: true, data: [] });
      const enrollments = await Enrollment.findAll({
        where: { student_id: { [Op.in]: studentIds }, is_active: true },
        attributes: ["section_id"],
      });
      const sectionIds = [...new Set(enrollments.map((e) => e.section_id))];
      if (!sectionIds.length) return res.json({ success: true, data: [] });
      const cas = await ClassAssignment.findAll({
        where: { section_id: { [Op.in]: sectionIds } },
        attributes: ["id"],
      });
      where.class_assignment_id = { [Op.in]: cas.map((c) => c.id) };
      where.status = "published";
    }

    const rows = await Syllabus.findAll({
      where,
      include: [chapterInclude],
      order: [["created_at", "DESC"]],
    });
    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSyllabus = async (req, res) => {
  try {
    const row = await Syllabus.findByPk(req.params.id, { include: [chapterInclude] });
    if (!row) return res.status(404).json({ success: false, message: "Syllabus not found" });

    if (req.user.role === "student") {
      const profile = await Student.findOne({ where: { user_id: req.user.id } });
      if (!profile) return res.status(403).json({ success: false, message: "Forbidden" });
      const ok = await assertCanViewClassAssignment(req, row.class_assignment_id, profile.id);
      if (!ok || row.status !== "published") {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }
    }

    if (req.user.role === "parent") {
      const sid = req.query.student_id;
      if (!sid) return res.status(400).json({ success: false, message: "student_id query required for parents" });
      const ok = await assertCanViewClassAssignment(req, row.class_assignment_id, sid);
      if (!ok || row.status !== "published") {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }
    }

    return res.json({ success: true, data: row });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createSyllabus = async (req, res) => {
  try {
    if (req.user.role === "teacher") {
      const ca = await ClassAssignment.findByPk(req.body.class_assignment_id);
      const t = await teacherProfile(req);
      if (!ca || !t || ca.teacher_id !== t.id) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }
    }

    const row = await Syllabus.create(req.body);
    const created = await Syllabus.findByPk(row.id, { include: [chapterInclude] });
    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateSyllabus = async (req, res) => {
  try {
    const row = await Syllabus.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Syllabus not found" });

    const editorOk = await assertSyllabusEditor(req, row);
    if (!editorOk) return res.status(403).json({ success: false, message: "Forbidden" });

    const allowed = [
      "class_assignment_id",
      "academic_year_id",
      "semester_id",
      "title",
      "description",
      "status",
      "published_by",
      "published_date",
    ];
    const patch = {};
    for (const k of allowed) {
      if (req.body[k] !== undefined) patch[k] = req.body[k];
    }
    await row.update(patch);
    const updated = await Syllabus.findByPk(row.id, { include: [chapterInclude] });
    return res.json({ success: true, data: updated });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteSyllabus = async (req, res) => {
  try {
    const row = await Syllabus.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Syllabus not found" });

    const editorOk = await assertSyllabusEditor(req, row);
    if (!editorOk) return res.status(403).json({ success: false, message: "Forbidden" });

    await row.destroy();
    return res.json({ success: true, message: "Deleted" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.addChapters = async (req, res) => {
  try {
    const syllabus = await Syllabus.findByPk(req.params.id);
    if (!syllabus) return res.status(404).json({ success: false, message: "Syllabus not found" });

    const ok = await assertSyllabusEditor(req, syllabus);
    if (!ok) return res.status(403).json({ success: false, message: "Forbidden" });

    const chapters = req.body.chapters;
    if (!Array.isArray(chapters) || chapters.length === 0) {
      return res.status(400).json({ success: false, message: "body.chapters must be a non-empty array" });
    }

    const created = [];
    for (const ch of chapters) {
      const row = await SyllabusChapter.create({
        syllabus_id: syllabus.id,
        chapter_number: ch.chapter_number ?? ch.chapterNumber,
        chapter_name: ch.chapter_name ?? ch.chapterName,
        description: ch.description,
        learning_objectives: ch.learning_objectives,
        key_topics: ch.key_topics ?? ch.keyTopics ?? [],
        estimated_weeks: ch.estimated_weeks ?? ch.estimatedWeeks ?? 1,
        start_date: ch.start_date ?? ch.startDate,
        end_date: ch.end_date ?? ch.endDate,
        resources: ch.resources ?? [],
      });
      created.push(row);
    }

    const updated = await Syllabus.findByPk(syllabus.id, { include: [chapterInclude] });
    return res.status(201).json({ success: true, data: { syllabus: updated, chapters_created: created.length } });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.getCurrentPublished = async (req, res) => {
  try {
    const classAssignmentId = req.query.class_assignment_id;
    if (!classAssignmentId) {
      return res.status(400).json({ success: false, message: "class_assignment_id is required" });
    }

    let studentId = req.query.student_id;
    if (req.user.role === "student") {
      const profile = await Student.findOne({ where: { user_id: req.user.id } });
      if (!profile) return res.status(403).json({ success: false, message: "Forbidden" });
      studentId = profile.id;
    }

    if (["student", "parent"].includes(req.user.role)) {
      if (!studentId) {
        return res.status(400).json({ success: false, message: "student_id is required for parent/student context" });
      }
      const can = await assertCanViewClassAssignment(req, classAssignmentId, studentId);
      if (!can) return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const row = await Syllabus.findOne({
      where: { class_assignment_id: classAssignmentId, status: "published" },
      include: [chapterInclude],
      order: [[{ model: SyllabusChapter, as: "syllabus_chapters" }, "chapter_number", "ASC"]],
    });

    if (!row) {
      return res.status(404).json({ success: false, message: "No published syllabus for this class assignment" });
    }

    return res.json({ success: true, data: row });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProgress = async (req, res) => {
  try {
    const syllabus = await Syllabus.findByPk(req.params.id, { include: [chapterInclude] });
    if (!syllabus) return res.status(404).json({ success: false, message: "Syllabus not found" });

    if (req.user.role === "student") {
      const profile = await Student.findOne({ where: { user_id: req.user.id } });
      if (!profile) return res.status(403).json({ success: false, message: "Forbidden" });
      const ok = await assertCanViewClassAssignment(req, syllabus.class_assignment_id, profile.id);
      if (!ok || syllabus.status !== "published") {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }
    }

    if (req.user.role === "parent") {
      const sid = req.query.student_id;
      if (!sid) return res.status(400).json({ success: false, message: "student_id query required for parents" });
      const ok = await assertCanViewClassAssignment(req, syllabus.class_assignment_id, sid);
      if (!ok || syllabus.status !== "published") {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }
    }

    const chapters = syllabus.syllabus_chapters || [];
    const total = chapters.length;
    const completed = chapters.filter((c) => c.is_completed).length;
    const percentage = total ? Math.round((completed / total) * 100) : 0;

    return res.json({
      success: true,
      data: {
        syllabus_id: syllabus.id,
        title: syllabus.title,
        total_chapters: total,
        completed_chapters: completed,
        completion_percentage: percentage,
        chapters,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
