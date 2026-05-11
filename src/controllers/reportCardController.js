const { Op } = require("sequelize");
const {
  ReportCard,
  ReportCardItem,
  Student,
  Exam,
  StudentExamResult,
  OverallGradingScale,
  CurriculumSubject,
  Subject,
} = require("../models");

async function resolveOverallBand({ curriculum_id, curriculum_class_id, average }) {
  return OverallGradingScale.findOne({
    where: {
      curriculum_id,
      curriculum_class_id,
      is_active: true,
      min_score: { [Op.lte]: average },
      max_score: { [Op.gte]: average },
    },
    order: [["sort_order", "ASC"], ["max_score", "DESC"]],
  });
}

exports.generateReportCards = async (req, res) => {
  try {
    const { curriculum_class_id, semester_id } = req.body || {};
    if (!curriculum_class_id || !semester_id) {
      return res.status(400).json({ success: false, message: "curriculum_class_id and semester_id are required." });
    }
    const exams = await Exam.findAll({
      where: { curriculum_class_id, semester_id },
      attributes: ["id", "curriculum_id", "curriculum_class_id", "semester_id"],
    });
    if (!exams.length) return res.status(404).json({ success: false, message: "No exams found for this class/semester." });
    const examIds = exams.map((e) => e.id);
    const curriculum_id = exams[0].curriculum_id || null;

    const resultRows = await StudentExamResult.findAll({
      where: { exam_id: { [Op.in]: examIds } },
      order: [["created_at", "ASC"]],
    });
    const byStudent = new Map();
    for (const row of resultRows) {
      if (!byStudent.has(row.student_id)) byStudent.set(row.student_id, []);
      byStudent.get(row.student_id).push(row);
    }

    const cards = [];
    for (const [student_id, rows] of byStudent.entries()) {
      const student = await Student.findByPk(student_id);
      if (!student) continue;
      const subjectMap = new Map();
      for (const r of rows) {
        const key = r.curriculum_subject_id || r.subject_id;
        if (!key) continue;
        if (!subjectMap.has(key)) subjectMap.set(key, []);
        subjectMap.get(key).push(r);
      }

      let total = 0;
      const itemPayloads = [];
      for (const [key, arr] of subjectMap.entries()) {
        const marksList = arr.map((x) => Number(x.marks ?? x.marks_obtained ?? 0)).filter((n) => Number.isFinite(n));
        const subjectTotal = marksList.reduce((a, b) => a + b, 0);
        const subjectAvg = marksList.length ? subjectTotal / marksList.length : 0;
        total += subjectAvg;
        const latest = arr[arr.length - 1];
        itemPayloads.push({
          curriculum_subject_id: latest.curriculum_subject_id || null,
          subject_id: latest.subject_id || null,
          subject_marks_total: Number(subjectTotal.toFixed(2)),
          subject_average: Number(subjectAvg.toFixed(2)),
          subject_grade: latest.grade || latest.grade_letter || null,
          subject_remarks: latest.grade_remarks || null,
          final_score: Number(subjectAvg.toFixed(2)),
          percentage: Number(subjectAvg.toFixed(2)),
          grade: latest.grade || latest.grade_letter || "",
        });
      }

      const average = itemPayloads.length ? total / itemPayloads.length : 0;
      const overallBand = await resolveOverallBand({ curriculum_id, curriculum_class_id, average });
      let card = await ReportCard.findOne({ where: { student_id, semester_id } });
      const cardPayload = {
        student_id,
        curriculum_id,
        curriculum_class_id,
        semester_id,
        total_marks: Number(total.toFixed(2)),
        average_marks: Number(average.toFixed(2)),
        overall_grade: overallBand?.overall_grade || null,
        overall_remarks: overallBand?.remarks || null,
        is_published: false,
      };
      if (card) await card.update(cardPayload);
      else card = await ReportCard.create(cardPayload);

      await ReportCardItem.destroy({ where: { report_card_id: card.id } });
      for (const item of itemPayloads) {
        await ReportCardItem.create({ report_card_id: card.id, ...item });
      }
      cards.push(card);
    }

    const classCards = await ReportCard.findAll({
      where: { curriculum_class_id, semester_id },
      order: [["average_marks", "DESC"]],
    });
    for (let i = 0; i < classCards.length; i++) {
      await classCards[i].update({ position_in_class: i + 1 });
    }

    return res.json({ success: true, data: { generated: cards.length } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.listReportCardsForStudent = async (req, res) => {
  try {
    const where = { student_id: req.params.studentId };
    if (req.query.semester_id) where.semester_id = req.query.semester_id;
    const rows = await ReportCard.findAll({
      where,
      order: [["created_at", "DESC"]],
    });
    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getReportCard = async (req, res) => {
  try {
    const row = await ReportCard.findByPk(req.params.id, {
      include: [
        {
          model: ReportCardItem,
          as: "items",
          include: [
            { model: CurriculumSubject, as: "curriculum_subject", required: false, attributes: ["id", "name"] },
            { model: Subject, as: "subject", required: false, attributes: ["id", "name"] },
          ],
        },
      ],
    });
    if (!row) return res.status(404).json({ success: false, message: "Report card not found." });
    return res.json({ success: true, data: row });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.publishReportCard = async (req, res) => {
  try {
    const row = await ReportCard.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Report card not found." });
    await row.update({ is_published: true, published_date: new Date() });
    return res.json({ success: true, data: row });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
