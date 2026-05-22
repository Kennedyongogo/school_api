const fs = require("fs");
const path = require("path");
const { Exam, ExamSubmission, Student } = require("../models");
const { convertToRelativePath } = require("../utils/filePath");
const { assertCanAccessExam, loadExamForAccess } = require("../services/examScheduleAccess");
const findStudentByUser = async (userId) => {
  if (!userId) return null;
  return Student.findOne({ where: { user_id: userId } });
};
const {
  isPdfFormExam,
  buildPdfExamSchema,
  fillPdfFromAnswers,
  buildFlatPdfAnswerSheet,
  isFlatPdfExam,
  PDF_SOURCE_FLAT,
  gradePdfAnswers,
  readFileBytes,
} = require("../utils/examPdfForm");

async function assertPdfFormExam(exam) {
  if (!exam) {
    const err = new Error("Exam not found.");
    err.statusCode = 404;
    throw err;
  }
  if (!isPdfFormExam(exam)) {
    const err = new Error("This exam is not a PDF form exam.");
    err.statusCode = 400;
    throw err;
  }
}

exports.uploadExamPdfTemplate = async (req, res) => {
  try {
    const exam = await Exam.findByPk(req.params.id);
    if (!exam) return res.status(404).json({ success: false, message: "Exam not found" });
    if (!req.file) return res.status(400).json({ success: false, message: "PDF file is required." });

    const pdfBytes = await fs.promises.readFile(req.file.path);
    const { schema, fieldCount, pdf_source_type } = await buildPdfExamSchema(pdfBytes);

    const relPath = convertToRelativePath(req.file.path);
    if (exam.pdf_template_path && exam.pdf_template_path !== relPath) {
      const oldAbs = path.join(__dirname, "..", "..", String(exam.pdf_template_path).replace(/^\/+/, ""));
      await fs.promises.unlink(oldAbs).catch(() => {});
    }

    const layout =
      exam.exam_layout_json && typeof exam.exam_layout_json === "object" ? { ...exam.exam_layout_json } : {};
    layout.pdf_source_type = pdf_source_type || PDF_SOURCE_FLAT;

    await exam.update({
      exam_type: "pdf_form",
      pdf_template_path: relPath,
      pdf_field_schema_json: schema,
      exam_layout_json: layout,
      updated_by: req.user?.id || null,
    });

    const updated = await Exam.findByPk(exam.id);
    const flat = pdf_source_type === PDF_SOURCE_FLAT;
    return res.json({
      success: true,
      data: {
        pdf_template_path: updated.pdf_template_path,
        pdf_field_schema_json: updated.pdf_field_schema_json,
        field_count: fieldCount,
        pdf_source_type: pdf_source_type || PDF_SOURCE_FLAT,
        message: flat
          ? `Uploaded. ${fieldCount} answer field(s) were created from your exam text (Q1, Q2, …). Teachers can type exams in Word and save as PDF — no special form setup needed.`
          : `Uploaded with ${fieldCount} embedded PDF form field(s).`,
      },
    });
  } catch (error) {
    if (req.file?.path) await fs.promises.unlink(req.file.path).catch(() => {});
    console.error("[exam] pdf-template upload failed:", error);
    return res.status(400).json({ success: false, message: error.message || "PDF upload failed." });
  }
};

exports.updateExamPdfAnswerKey = async (req, res) => {
  try {
    const exam = await Exam.findByPk(req.params.id);
    if (!exam) return res.status(404).json({ success: false, message: "Exam not found" });
    await assertPdfFormExam(exam);
    const answerKey =
      req.body?.pdf_answer_key_json && typeof req.body.pdf_answer_key_json === "object"
        ? req.body.pdf_answer_key_json
        : req.body?.answer_key && typeof req.body.answer_key === "object"
        ? req.body.answer_key
        : {};
    await exam.update({ pdf_answer_key_json: answerKey, updated_by: req.user?.id || null });
    return res.json({ success: true, data: { pdf_answer_key_json: exam.pdf_answer_key_json } });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.getExamPdfTemplate = async (req, res) => {
  try {
    const exam = await loadExamForAccess(req.params.id);
    await assertCanAccessExam(req, exam);
    const full = await Exam.findByPk(exam.id, {
      attributes: ["id", "pdf_template_path", "pdf_field_schema_json", "exam_type"],
    });
    if (!full?.pdf_template_path) {
      return res.status(404).json({ success: false, message: "PDF template has not been uploaded yet." });
    }
    if (req.user?.role === "student" && !isPdfFormExam(full)) {
      return res.status(400).json({ success: false, message: "This exam is not available as a PDF exam." });
    }
    const bytes = await readFileBytes(full.pdf_template_path);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="exam-${full.id}.pdf"`);
    return res.send(bytes);
  } catch (error) {
    const code = error.statusCode || 500;
    return res.status(code).json({ success: false, message: error.message });
  }
};

exports.saveSubmissionPdfAnswers = async (req, res) => {
  try {
    const student = await findStudentByUser(req.user?.id);
    if (!student) return res.status(403).json({ success: false, message: "Student profile not found for this user." });

    const submission = await ExamSubmission.findByPk(req.params.submissionId, {
      include: [{ model: Exam, as: "exam" }],
    });
    if (!submission) return res.status(404).json({ success: false, message: "Submission not found" });
    if (submission.student_id !== student.id) {
      return res.status(403).json({ success: false, message: "You cannot edit this submission." });
    }
    if (submission.status !== "draft") {
      return res.status(400).json({ success: false, message: "Submission already submitted." });
    }
    await assertPdfFormExam(submission.exam);

    const fieldValues =
      req.body?.field_values && typeof req.body.field_values === "object"
        ? req.body.field_values
        : req.body?.pdf_answers && typeof req.body.pdf_answers === "object"
        ? req.body.pdf_answers
        : {};
    await submission.update({ pdf_answers_json: fieldValues });
    return res.json({ success: true, data: submission });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.buildCompletedPdfForSubmission = async (submission, exam) => {
  if (!exam?.pdf_template_path) throw new Error("PDF template is missing on this exam.");
  const answers =
    submission.pdf_answers_json && typeof submission.pdf_answers_json === "object" ? submission.pdf_answers_json : {};
  const schema = Array.isArray(exam.pdf_field_schema_json) ? exam.pdf_field_schema_json : [];

  if (isFlatPdfExam(exam)) {
    return buildFlatPdfAnswerSheet({
      title: exam.title || "Exam answers",
      schema,
      answers,
    });
  }

  const templateBytes = await readFileBytes(exam.pdf_template_path);
  try {
    return await fillPdfFromAnswers(templateBytes, answers);
  } catch (e) {
    if (String(e?.message || e).includes("FLAT_PDF")) {
      return buildFlatPdfAnswerSheet({ title: exam.title, schema, answers });
    }
    throw e;
  }
};

exports.finalizePdfFormSubmission = async (submission, exam) => {
  const filled = await exports.buildCompletedPdfForSubmission(submission, exam);
  const uploadDir = path.join(__dirname, "..", "..", "uploads", "exam-pdf-completed");
  await fs.promises.mkdir(uploadDir, { recursive: true });
  const suffix = isFlatPdfExam(exam) ? "answer-sheet" : "completed";
  const filename = `${suffix}-${submission.id}-${Date.now()}.pdf`;
  const abs = path.join(uploadDir, filename);
  await fs.promises.writeFile(abs, filled);
  const rel = convertToRelativePath(abs);
  const grading = gradePdfAnswers(
    exam.pdf_answer_key_json,
    submission.pdf_answers_json,
    Number(exam.total_marks) || 100
  );
  await submission.update({
    pdf_completed_file_path: rel,
    pdf_auto_score: grading.score,
    pdf_auto_grading_json: grading,
  });
  return { rel, grading };
};
