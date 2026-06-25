const {
  Student,
  User,
  Exam,
  ExamSubmission,
  ExamAnswer,
  ExamQuestion,
  StudentExamResult,
  CurriculumSubject,
} = require("../models");
const { isPdfFormExam } = require("./examPdfForm");

const userSafe = { attributes: { exclude: ["password_hash"] } };

function formatExamAnswerText(answer) {
  if (!answer) return "—";
  const text = String(answer.answer_text || "").trim();
  if (text) return text;
  const json = answer.answer_json;
  if (json && typeof json === "object") {
    if (Array.isArray(json.files) && json.files.length) {
      return json.files.map((f, i) => f.name || f.url || `File ${i + 1}`).join(", ");
    }
    if (Array.isArray(json)) return json.map((x) => String(x)).join(", ");
    if (json.selected != null) return String(json.selected);
    try {
      return JSON.stringify(json);
    } catch {
      return "—";
    }
  }
  return "—";
}

async function resolveStudentForPortalUser(userId) {
  return Student.findOne({
    where: { user_id: userId },
    attributes: ["id", "admission_number", "curriculum_id", "curriculum_class_id"],
    include: [{ model: User, as: "user", ...userSafe }],
  });
}

async function loadStudentExamResultForPortal({ userId, examId }) {
  const student = await resolveStudentForPortalUser(userId);
  if (!student) {
    return { error: { status: 404, message: "Student profile not found." } };
  }

  const exam = await Exam.findByPk(examId, {
    attributes: ["id", "title", "exam_type", "total_marks"],
  });
  if (!exam) {
    return { error: { status: 404, message: "Exam not found." } };
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
    return {
      error: {
        status: 404,
        code: "RESULT_NOT_PUBLISHED",
        message:
          "Your teacher hasn't published this result yet. Once marking is complete, your score and grade will show up here.",
      },
    };
  }

  const pdfForm = isPdfFormExam(exam);
  const totalMax = Math.max(0, Number(exam.total_marks || result.total_marks || 0)) || 100;
  const studentName =
    student.user?.full_name?.trim() ||
    student.user?.username?.trim() ||
    student.admission_number ||
    "Student";

  let questions = [];
  let submission = null;
  if (!pdfForm) {
    submission = await ExamSubmission.findOne({
      where: { exam_id: exam.id, student_id: student.id, status: "submitted" },
      attributes: ["id", "pdf_completed_file_path"],
    });
    if (submission) {
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

      questions = answers
        .filter((a) => a.question)
        .map((a) => ({
          question: a.question.question_text,
          answer: formatExamAnswerText(a),
          score: Number(a.marks_obtained || 0),
          maxScore: Number(a.question.marks || 0),
          comment: a.marker_comment || null,
        }));
    }
  } else {
    submission = await ExamSubmission.findOne({
      where: { exam_id: exam.id, student_id: student.id, status: "submitted" },
      attributes: ["id", "pdf_completed_file_path"],
    });
  }

  const totalScore = Number(result.marks_obtained ?? result.marks ?? 0);
  const data = {
    examId: exam.id,
    examTitle: exam.title || "Exam",
    examType: exam.exam_type || "questions",
    showQuestionBreakdown: !pdfForm,
    studentName,
    subjectName: result.curriculum_subject?.name || null,
    gradedAt: result.graded_at || null,
    totalScore,
    totalMax,
    percentage: totalMax > 0 ? Number(((totalScore / totalMax) * 100).toFixed(1)) : null,
    grade: result.grade_letter || result.grade,
    gradeRemarks: result.grade_remarks || null,
    points: result.points != null ? Number(result.points) : null,
    questions,
    canDownloadAnsweredPdf: Boolean(pdfForm && submission?.pdf_completed_file_path),
  };

  return { student, exam, result, submission, data };
}

module.exports = {
  formatExamAnswerText,
  resolveStudentForPortalUser,
  loadStudentExamResultForPortal,
};
