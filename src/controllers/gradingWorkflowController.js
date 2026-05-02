const { SubjectAverage, OverallAverage, ReportCard, Student } = require("../models");
const {
  recalculateSubjectAverage,
  recalculateOverallAverage,
  recalculateClassPositions,
  recalculateGradePositions,
  recalculateSubjectRanksForSection,
  recalculateSubjectRanksForGradeLevel,
  generateReportCard,
} = require("../utils/gradingCalculator");

exports.postRecalculateSubjectAverage = async (req, res) => {
  try {
    const { student_id, subject_id, semester_id, grading_system_type } = req.body;
    if (!student_id || !subject_id || !semester_id) {
      return res.status(400).json({
        success: false,
        message: "student_id, subject_id, and semester_id are required",
      });
    }
    const row = await recalculateSubjectAverage(
      student_id,
      subject_id,
      semester_id,
      grading_system_type || "percentage"
    );
    return res.json({ success: true, data: row });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.postRecalculateOverallAverage = async (req, res) => {
  try {
    const { student_id, semester_id, grading_system_type } = req.body;
    if (!student_id || !semester_id) {
      return res.status(400).json({
        success: false,
        message: "student_id and semester_id are required",
      });
    }
    const row = await recalculateOverallAverage(
      student_id,
      semester_id,
      grading_system_type || "percentage"
    );
    return res.json({ success: true, data: row });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.postRecalculateClassPositions = async (req, res) => {
  try {
    const { section_id, semester_id, grading_system_type } = req.body;
    if (!section_id || !semester_id) {
      return res.status(400).json({
        success: false,
        message: "section_id and semester_id are required",
      });
    }
    const count = await recalculateClassPositions(
      section_id,
      semester_id,
      grading_system_type || "percentage"
    );
    return res.json({ success: true, data: { students_ranked: count } });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.postRecalculateGradePositions = async (req, res) => {
  try {
    const { grade_level_id, semester_id, grading_system_type } = req.body;
    if (!grade_level_id || !semester_id) {
      return res.status(400).json({
        success: false,
        message: "grade_level_id and semester_id are required",
      });
    }
    const count = await recalculateGradePositions(
      grade_level_id,
      semester_id,
      grading_system_type || "percentage"
    );
    return res.json({ success: true, data: { students_ranked: count } });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.postRecalculateSubjectRanksSection = async (req, res) => {
  try {
    const { section_id, subject_id, semester_id } = req.body;
    if (!section_id || !subject_id || !semester_id) {
      return res.status(400).json({
        success: false,
        message: "section_id, subject_id, and semester_id are required",
      });
    }
    await recalculateSubjectRanksForSection(section_id, subject_id, semester_id);
    return res.json({ success: true, message: "Subject ranks updated for section cohort" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.postRecalculateSubjectRanksGrade = async (req, res) => {
  try {
    const { grade_level_id, subject_id, semester_id } = req.body;
    if (!grade_level_id || !subject_id || !semester_id) {
      return res.status(400).json({
        success: false,
        message: "grade_level_id, subject_id, and semester_id are required",
      });
    }
    await recalculateSubjectRanksForGradeLevel(grade_level_id, subject_id, semester_id);
    return res.json({ success: true, message: "Subject ranks updated for grade cohort" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.postGenerateReportCard = async (req, res) => {
  try {
    const {
      student_id,
      semester_id,
      grading_system_type,
      enrollment_section_id,
      teacher_comments,
      principal_signature,
    } = req.body;
    if (!student_id || !semester_id) {
      return res.status(400).json({
        success: false,
        message: "student_id and semester_id are required",
      });
    }
    const result = await generateReportCard(student_id, semester_id, grading_system_type || "percentage", {
      enrollmentSectionId: enrollment_section_id || null,
      teacherComments: teacher_comments,
      principalSignature: principal_signature,
    });
    return res.json({ success: true, data: result });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.getReportCard = async (req, res) => {
  try {
    const row = await ReportCard.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Report card not found" });
    return res.json({ success: true, data: row });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.listReportCardsForStudent = async (req, res) => {
  try {
    const { student_id } = req.params;
    const rows = await ReportCard.findAll({
      where: { student_id },
      order: [["generated_date", "DESC"]],
    });
    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyGradingSummary = async (req, res) => {
  try {
    const student = await Student.findOne({ where: { user_id: req.userId } });
    if (!student) {
      return res.status(404).json({ success: false, message: "Student profile not found" });
    }
    const semesterId = req.query.semester_id;
    const subjectWhere = { student_id: student.id };
    const overallWhere = { student_id: student.id };
    if (semesterId) {
      subjectWhere.semester_id = semesterId;
      overallWhere.semester_id = semesterId;
    }
    const subjectAverages = await SubjectAverage.findAll({
      where: subjectWhere,
      order: [["semester_id", "DESC"]],
    });
    const overallAverages = await OverallAverage.findAll({
      where: overallWhere,
      order: [["semester_id", "DESC"]],
    });
    return res.json({
      success: true,
      data: {
        student_id: student.id,
        subject_averages: subjectAverages,
        overall_averages: overallAverages,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
