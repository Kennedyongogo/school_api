const { StudentExamResult } = require("../models");
const { upsertResultFromExamAttempt } = require("../utils/gradingCalculator");

exports.listStudentExamResults = async (req, res) => {
  try {
    const where = {};
    if (req.query.student_id) where.student_id = req.query.student_id;
    if (req.query.subject_id) where.subject_id = req.query.subject_id;
    if (req.query.semester_id) where.semester_id = req.query.semester_id;
    const rows = await StudentExamResult.findAll({
      where,
      order: [["created_at", "DESC"]],
    });
    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getStudentExamResult = async (req, res) => {
  try {
    const row = await StudentExamResult.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Record not found" });
    return res.json({ success: true, data: row });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createStudentExamResult = async (req, res) => {
  try {
    const row = await StudentExamResult.create(req.body);
    return res.status(201).json({ success: true, data: row });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateStudentExamResult = async (req, res) => {
  try {
    const row = await StudentExamResult.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Record not found" });
    const allowed = [
      "marks_obtained",
      "total_marks",
      "percentage",
      "grade_letter",
      "gpa_earned",
      "is_best_attempt",
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

exports.deleteStudentExamResult = async (req, res) => {
  try {
    const row = await StudentExamResult.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Record not found" });
    await row.destroy();
    return res.json({ success: true, message: "Deleted" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.syncFromExamAttempt = async (req, res) => {
  try {
    const attemptId = req.params.attemptId;
    const { semester_id, exam_type_id, grading_system_type } = req.body;
    if (!semester_id || !exam_type_id) {
      return res.status(400).json({
        success: false,
        message: "semester_id and exam_type_id are required",
      });
    }
    const row = await upsertResultFromExamAttempt(attemptId, {
      semester_id,
      exam_type_id,
      grading_system_type: grading_system_type || "percentage",
    });
    return res.json({ success: true, data: row });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
