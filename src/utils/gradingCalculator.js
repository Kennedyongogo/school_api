const { Op } = require("sequelize");
const {
  GradingScale,
  StudentExamResult,
  AssessmentExamType,
  SubjectAverage,
  OverallAverage,
  Semester,
  Enrollment,
  Section,
  Subject,
  ReportCard,
  ReportCardItem,
  ExamAttempt,
  Exam,
} = require("../models");

async function resolveGradeBand(percentage, gradingSystemType) {
  const p = Number(percentage);
  if (Number.isNaN(p)) return null;
  const scales = await GradingScale.findAll({
    where: { system_type: gradingSystemType, is_active: true },
    order: [["min_percentage", "DESC"]],
  });
  for (const s of scales) {
    const min = Number(s.min_percentage);
    const max = Number(s.max_percentage);
    if (p >= min && p <= max) return s;
  }
  return null;
}

function remarksFromPercentage(pct) {
  const p = Number(pct);
  if (p >= 90) return "Excellent";
  if (p >= 75) return "Good";
  if (p >= 60) return "Satisfactory";
  if (p >= 40) return "Needs Improvement";
  return "Poor";
}

async function recalculateSubjectAverage(studentId, subjectId, semesterId, gradingSystemType = "percentage") {
  const semester = await Semester.findByPk(semesterId);
  if (!semester) throw new Error("Semester not found");

  const results = await StudentExamResult.findAll({
    where: { student_id: studentId, subject_id: subjectId, semester_id: semesterId },
    include: [{ model: AssessmentExamType, as: "assessment_exam_type" }],
  });

  let totalWeighted = 0;
  let totalWeight = 0;
  let totalScore = 0;
  let totalPossible = 0;

  for (const r of results) {
    const et = r.assessment_exam_type;
    const weight = et ? Number(et.weight_percentage) / 100 : 0;
    const denom = Number(r.total_marks);
    const pct = denom > 0 ? (Number(r.marks_obtained) / denom) * 100 : 0;
    totalWeighted += pct * weight;
    totalWeight += weight;
    totalScore += Number(r.marks_obtained);
    totalPossible += denom;
  }

  const averagePercentage =
    totalWeight > 0 ? totalWeighted / totalWeight : totalPossible > 0 ? (totalScore / totalPossible) * 100 : 0;

  const band = await resolveGradeBand(averagePercentage, gradingSystemType);

  const payload = {
    student_id: studentId,
    subject_id: subjectId,
    semester_id: semesterId,
    academic_year_id: semester.academic_year_id,
    total_score: totalScore,
    total_possible: totalPossible,
    average_percentage: Number(averagePercentage.toFixed(2)),
    weighted_score: Number(averagePercentage.toFixed(2)),
    grade_letter: band ? band.grade_letter : null,
    gpa_equivalent: band && band.gpa_value != null ? band.gpa_value : null,
  };

  let row = await SubjectAverage.findOne({
    where: { student_id: studentId, subject_id: subjectId, semester_id: semesterId },
  });
  if (row) await row.update(payload);
  else row = await SubjectAverage.create(payload);

  for (const r of results) {
    const pct = Number(r.total_marks) > 0 ? (Number(r.marks_obtained) / Number(r.total_marks)) * 100 : 0;
    const b = await resolveGradeBand(pct, gradingSystemType);
    await r.update({
      percentage: Number(pct.toFixed(2)),
      grade_letter: b ? b.grade_letter : null,
      gpa_earned: b && b.gpa_value != null ? b.gpa_value : null,
    });
  }

  return row;
}

async function recalculateOverallAverage(studentId, semesterId, gradingSystemType = "percentage") {
  const semester = await Semester.findByPk(semesterId);
  if (!semester) throw new Error("Semester not found");

  const subjects = await SubjectAverage.findAll({
    where: { student_id: studentId, semester_id: semesterId },
  });

  const n = subjects.length;
  const overallPct = n ? subjects.reduce((s, x) => s + Number(x.average_percentage), 0) / n : 0;
  const gpas = subjects.map((x) => x.gpa_equivalent).filter((v) => v != null && v !== "");
  const overallGpa = gpas.length
    ? gpas.reduce((a, b) => a + Number(b), 0) / gpas.length
    : 0;

  const band = await resolveGradeBand(overallPct, gradingSystemType);

  const payload = {
    student_id: studentId,
    semester_id: semesterId,
    academic_year_id: semester.academic_year_id,
    total_subjects: n,
    overall_percentage: Number(overallPct.toFixed(2)),
    overall_gpa: Number(overallGpa.toFixed(2)),
    overall_grade: band ? band.grade_letter : null,
    remarks: remarksFromPercentage(overallPct),
  };

  let row = await OverallAverage.findOne({
    where: { student_id: studentId, semester_id: semesterId },
  });
  if (row) await row.update(payload);
  else row = await OverallAverage.create(payload);

  return row;
}

async function recalculateSubjectRanksInStudentSet(studentIds, subjectId, semesterId, fieldRankClassOrGrade) {
  const rows = await SubjectAverage.findAll({
    where: {
      subject_id: subjectId,
      semester_id: semesterId,
      student_id: { [Op.in]: studentIds },
    },
    order: [["average_percentage", "DESC"]],
  });

  const rankKey = fieldRankClassOrGrade === "grade" ? "rank_in_grade" : "rank_in_class";

  for (let i = 0; i < rows.length; i++) {
    await rows[i].update({ [rankKey]: i + 1 });
  }
}

async function recalculateSubjectRanksForSection(sectionId, subjectId, semesterId) {
  const enrollments = await Enrollment.findAll({
    where: { section_id: sectionId, is_active: true },
  });
  const ids = enrollments.map((e) => e.student_id);
  await recalculateSubjectRanksInStudentSet(ids, subjectId, semesterId, "class");
}

async function recalculateSubjectRanksForGradeLevel(gradeLevelId, subjectId, semesterId) {
  const sections = await Section.findAll({ where: { grade_level_id: gradeLevelId } });
  const sectionIds = sections.map((s) => s.id);
  const enrollments = await Enrollment.findAll({
    where: { section_id: { [Op.in]: sectionIds }, is_active: true },
  });
  const ids = [...new Set(enrollments.map((e) => e.student_id))];
  await recalculateSubjectRanksInStudentSet(ids, subjectId, semesterId, "grade");
}

async function recalculateClassPositions(sectionId, semesterId, gradingSystemType = "percentage") {
  const enrollments = await Enrollment.findAll({
    where: { section_id: sectionId, is_active: true },
  });
  const studentIds = enrollments.map((e) => e.student_id);

  for (const sid of studentIds) {
    await recalculateOverallAverage(sid, semesterId, gradingSystemType);
  }

  const averages = await OverallAverage.findAll({
    where: { semester_id: semesterId, student_id: { [Op.in]: studentIds } },
    order: [["overall_percentage", "DESC"]],
  });

  let position = 1;
  for (const row of averages) {
    await row.update({
      class_position: position,
      total_students_in_class: averages.length,
    });
    position += 1;
  }

  return averages.length;
}

async function recalculateGradePositions(gradeLevelId, semesterId, gradingSystemType = "percentage") {
  const sections = await Section.findAll({ where: { grade_level_id: gradeLevelId } });
  const sectionIds = sections.map((s) => s.id);
  const enrollments = await Enrollment.findAll({
    where: { section_id: { [Op.in]: sectionIds }, is_active: true },
  });
  const studentIds = [...new Set(enrollments.map((e) => e.student_id))];

  for (const sid of studentIds) {
    await recalculateOverallAverage(sid, semesterId, gradingSystemType);
  }

  const averages = await OverallAverage.findAll({
    where: { semester_id: semesterId, student_id: { [Op.in]: studentIds } },
    order: [["overall_percentage", "DESC"]],
  });

  let position = 1;
  for (const row of averages) {
    await row.update({
      grade_position: position,
      total_students_in_grade: averages.length,
    });
    position += 1;
  }

  return averages.length;
}

async function classAverageForSubject(sectionId, subjectId, semesterId) {
  const enrollments = await Enrollment.findAll({
    where: { section_id: sectionId, is_active: true },
  });
  const ids = enrollments.map((e) => e.student_id);
  const rows = await SubjectAverage.findAll({
    where: {
      semester_id: semesterId,
      subject_id: subjectId,
      student_id: { [Op.in]: ids },
    },
  });
  if (!rows.length) return null;
  const sum = rows.reduce((s, r) => s + Number(r.average_percentage), 0);
  return Number((sum / rows.length).toFixed(2));
}

async function highestLowestSubjectForSection(sectionId, subjectId, semesterId) {
  const enrollments = await Enrollment.findAll({
    where: { section_id: sectionId, is_active: true },
  });
  const ids = enrollments.map((e) => e.student_id);
  const rows = await SubjectAverage.findAll({
    where: {
      semester_id: semesterId,
      subject_id: subjectId,
      student_id: { [Op.in]: ids },
    },
  });
  if (!rows.length) return { highest: null, lowest: null };
  const pcts = rows.map((r) => Number(r.average_percentage));
  return {
    highest: Math.max(...pcts),
    lowest: Math.min(...pcts),
  };
}

/**
 * Build or replace report card rows from SubjectAverage + category breakdown from StudentExamResult.
 * enrollmentSectionId: student's primary section for class stats (optional).
 */
async function generateReportCard(
  studentId,
  semesterId,
  gradingSystemType = "percentage",
  options = {}
) {
  const { enrollmentSectionId = null, teacherComments = null, principalSignature = null } = options;

  const semester = await Semester.findByPk(semesterId);
  if (!semester) throw new Error("Semester not found");

  let sectionId = enrollmentSectionId;
  if (!sectionId) {
    const en = await Enrollment.findOne({
      where: { student_id: studentId, is_active: true },
      order: [["enrollment_date", "DESC"]],
    });
    sectionId = en ? en.section_id : null;
  }

  await recalculateOverallAverage(studentId, semesterId, gradingSystemType);

  const subjectAverages = await SubjectAverage.findAll({
    where: { student_id: studentId, semester_id: semesterId },
    include: [{ model: Subject, as: "subject" }],
  });

  const results = await StudentExamResult.findAll({
    where: { student_id: studentId, semester_id: semesterId },
    include: [{ model: AssessmentExamType, as: "assessment_exam_type" }],
  });

  const bySubjectCategory = {};
  for (const r of results) {
    const sid = r.subject_id;
    const cat = r.assessment_exam_type?.category || "exam";
    if (!bySubjectCategory[sid]) bySubjectCategory[sid] = {};
    if (!bySubjectCategory[sid][cat]) bySubjectCategory[sid][cat] = [];
    const pct = Number(r.total_marks) > 0 ? (Number(r.marks_obtained) / Number(r.total_marks)) * 100 : 0;
    bySubjectCategory[sid][cat].push(pct);
  }

  function avg(arr) {
    if (!arr || !arr.length) return null;
    const s = arr.reduce((a, b) => a + b, 0);
    return Number((s / arr.length).toFixed(2));
  }

  let report = await ReportCard.findOne({
    where: { student_id: studentId, semester_id: semesterId },
  });

  const rcPayload = {
    student_id: studentId,
    semester_id: semesterId,
    academic_year_id: semester.academic_year_id,
    generated_date: new Date(),
    teacher_comments: teacherComments,
    principal_signature: principalSignature,
    is_published: false,
  };

  if (report) await report.update(rcPayload);
  else report = await ReportCard.create(rcPayload);

  await ReportCardItem.destroy({ where: { report_card_id: report.id } });

  const overall = await OverallAverage.findOne({
    where: { student_id: studentId, semester_id: semesterId },
  });

  for (const sa of subjectAverages) {
    const cats = bySubjectCategory[sa.subject_id] || {};
    const exam_score = avg(cats.exam);
    const quiz_score = avg(cats.quiz);
    const assignment_score = avg(cats.assignment);
    const project_score = avg(cats.project);
    const participation_score = avg(cats.participation);

    let classAvg = null;
    let hi = null;
    let lo = null;
    if (sectionId) {
      classAvg = await classAverageForSubject(sectionId, sa.subject_id, semesterId);
      const hl = await highestLowestSubjectForSection(sectionId, sa.subject_id, semesterId);
      hi = hl.highest;
      lo = hl.lowest;
    }

    await ReportCardItem.create({
      report_card_id: report.id,
      subject_id: sa.subject_id,
      exam_score,
      quiz_score,
      assignment_score,
      project_score,
      participation_score,
      final_score: Number(sa.average_percentage),
      percentage: Number(sa.average_percentage),
      grade: sa.grade_letter || "",
      gpa: sa.gpa_equivalent,
      class_average: classAvg,
      highest_score: hi,
      lowest_score: lo,
    });
  }

  return { reportCard: report, overallAverage: overall, itemsCount: subjectAverages.length };
}

async function upsertResultFromExamAttempt(examAttemptId, payload) {
  const { semester_id, exam_type_id, grading_system_type = "percentage" } = payload;

  const attempt = await ExamAttempt.findByPk(examAttemptId, {
    include: [{ model: Exam, as: "exam" }],
  });
  if (!attempt) throw new Error("Exam attempt not found");
  if (attempt.status !== "completed") throw new Error("Exam attempt must be completed");

  const exam = attempt.exam;
  const totalMarks = Number(exam.total_marks);
  const marks = attempt.total_score != null ? Number(attempt.total_score) : 0;
  const pct = totalMarks > 0 ? (marks / totalMarks) * 100 : 0;
  const band = await resolveGradeBand(pct, grading_system_type);

  const existing = await StudentExamResult.findOne({ where: { exam_attempt_id: attempt.id } });

  const rowPayload = {
    student_id: attempt.student_id,
    exam_attempt_id: attempt.id,
    subject_id: exam.subject_id,
    exam_type_id,
    semester_id,
    marks_obtained: marks,
    total_marks: totalMarks,
    percentage: Number(pct.toFixed(2)),
    grade_letter: band ? band.grade_letter : null,
    gpa_earned: band && band.gpa_value != null ? band.gpa_value : null,
    is_best_attempt: true,
  };

  let row;
  if (existing) {
    await existing.update(rowPayload);
    row = existing;
  } else {
    row = await StudentExamResult.create(rowPayload);
  }

  await recalculateSubjectAverage(attempt.student_id, exam.subject_id, semester_id, grading_system_type);
  await recalculateOverallAverage(attempt.student_id, semester_id, grading_system_type);

  return row;
}

module.exports = {
  resolveGradeBand,
  remarksFromPercentage,
  recalculateSubjectAverage,
  recalculateOverallAverage,
  recalculateSubjectRanksForSection,
  recalculateSubjectRanksForGradeLevel,
  recalculateClassPositions,
  recalculateGradePositions,
  generateReportCard,
  upsertResultFromExamAttempt,
};
