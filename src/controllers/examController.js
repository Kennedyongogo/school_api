const {
  sequelize,
  Exam,
  ExamTemplate,
  ExamQuestion,
  ExamSubmission,
  ExamAnswer,
  ExamAttempt,
  StudentAnswer,
  TemporaryAnswer,
  ExamSessionLog,
  StudentExamResult,
  ExamSchedule,
  Student,
  User,
} = require("../models");

const userSafe = { attributes: { exclude: ["password_hash"] } };
const QUESTION_TYPES = new Set(["multiple_choice", "multi_select", "true_false", "essay", "short_text", "long_text", "number", "diagram_label"]);
const EXAM_STATUS = new Set(["draft", "published", "archived"]);

const examIncludes = [
  { model: ExamTemplate, as: "template", required: false },
  { model: ExamQuestion, as: "questions" },
  { model: User, as: "creator", required: false, ...userSafe },
];

const normalizeQuestion = (q, idx = 0) => {
  const question_type = String(q?.question_type || "short_text");
  if (!QUESTION_TYPES.has(question_type)) {
    throw new Error(`Unsupported question type at question ${idx + 1}`);
  }
  const question_text = String(q?.question_text || "").trim();
  if (!question_text) {
    throw new Error(`Question text is required at question ${idx + 1}`);
  }
  let options = Array.isArray(q?.options) ? q.options : Array.isArray(q?.options_json) ? q.options_json : null;
  if (question_type === "diagram_label") {
    const diagramData = String(q?.diagram_data || q?.options?.diagram_data || q?.options_json?.diagram_data || "").trim();
    const diagramPositionSrc = q?.diagram_position || q?.options?.diagram_position || q?.options_json?.diagram_position || {};
    const rawHotspots = Array.isArray(q?.diagram_hotspots)
      ? q.diagram_hotspots
      : Array.isArray(q?.options?.hotspots)
      ? q.options.hotspots
      : Array.isArray(q?.options_json?.hotspots)
      ? q.options_json.hotspots
      : [];
    const hotspots = rawHotspots.map((hs, i) => ({
      id: hs?.id || `hs-${idx + 1}-${i + 1}`,
      x: Number.isFinite(Number(hs?.x)) ? Number(hs.x) : 50,
      y: Number.isFinite(Number(hs?.y)) ? Number(hs.y) : 50,
      prompt: String(hs?.prompt || "").trim(),
      correct_answer: String(hs?.correct_answer || "").trim(),
    }));
    if (!diagramData) throw new Error(`Diagram drawing is required at question ${idx + 1}`);
    if (!hotspots.length) throw new Error(`At least one diagram hotspot is required at question ${idx + 1}`);
    options = {
      diagram_data: diagramData,
      hotspots,
      diagram_position: {
        x: Number.isFinite(Number(diagramPositionSrc?.x)) ? Number(diagramPositionSrc.x) : 40,
        y: Number.isFinite(Number(diagramPositionSrc?.y)) ? Number(diagramPositionSrc.y) : 220,
        w: Number.isFinite(Number(diagramPositionSrc?.w)) ? Math.max(120, Number(diagramPositionSrc.w)) : 260,
        h: Number.isFinite(Number(diagramPositionSrc?.h)) ? Math.max(80, Number(diagramPositionSrc.h)) : 180,
        page: Number.isFinite(Number(diagramPositionSrc?.page)) ? Math.max(0, Number(diagramPositionSrc.page)) : 0,
      },
    };
  }
  return {
    question_text,
    question_type,
    options,
    correct_answer: q?.correct_answer != null ? String(q.correct_answer) : null,
    marks: Number.isFinite(Number(q?.marks)) ? Number(q.marks) : 0,
    order_number: Number.isFinite(Number(q?.order_number)) ? Number(q.order_number) : idx + 1,
    explanation: q?.explanation ? String(q.explanation) : null,
    required: Boolean(q?.required),
    canvas_x: Number.isFinite(Number(q?.canvas_x)) ? Number(q.canvas_x) : 40,
    canvas_y: Number.isFinite(Number(q?.canvas_y)) ? Number(q.canvas_y) : 120 + idx * 34,
    canvas_w: Number.isFinite(Number(q?.canvas_w)) ? Math.max(120, Number(q.canvas_w)) : 520,
    canvas_h: Number.isFinite(Number(q?.canvas_h)) ? Math.max(24, Number(q.canvas_h)) : 26,
    canvas_page: Number.isFinite(Number(q?.canvas_page)) ? Math.max(0, Number(q.canvas_page)) : 0,
  };
};

const normalizeExamLayout = (layout = {}) => {
  const src = layout && typeof layout === "object" ? layout : {};
  const def = {
    name: { x: 40, y: 80, w: 300, h: 24 },
    instructions: { x: 40, y: 115, w: 520, h: 30 },
    duration: { x: 420, y: 80, w: 140, h: 24 },
    passing_marks: { x: 40, y: 160, w: 180, h: 24 },
    total_marks: { x: 230, y: 160, w: 180, h: 24 },
  };
  const out = {};
  for (const key of Object.keys(def)) {
    const row = src[key] || {};
    out[key] = {
      x: Number.isFinite(Number(row.x)) ? Number(row.x) : def[key].x,
      y: Number.isFinite(Number(row.y)) ? Number(row.y) : def[key].y,
      w: Number.isFinite(Number(row.w)) ? Math.max(120, Number(row.w)) : def[key].w,
      h: Number.isFinite(Number(row.h)) ? Math.max(24, Number(row.h)) : def[key].h,
    };
  }
  if (Array.isArray(src.template_pages_override)) {
    out.template_pages_override = src.template_pages_override.map((p) => ({
      id: p?.id || undefined,
      elements: Array.isArray(p?.elements) ? p.elements : [],
    }));
  }
  return out;
};

const findStudentByUser = async (userId) => {
  if (!userId) return null;
  return Student.findOne({ where: { user_id: userId } });
};

exports.listExams = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const where = {};
    if (req.query.status) where.status = req.query.status;
    if (req.query.template_id) where.template_id = req.query.template_id;

    const result = await Exam.findAndCountAll({
      where,
      include: examIncludes,
      distinct: true,
      limit,
      offset,
      order: [["created_at", "DESC"]],
    });
    return res.json({
      success: true,
      data: result.rows,
      page,
      limit,
      total: result.count,
      total_pages: Math.ceil(result.count / limit) || 1,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getExam = async (req, res) => {
  try {
    const row = await Exam.findByPk(req.params.id, { include: examIncludes });
    if (!row) {
      return res.status(404).json({ success: false, message: "Exam not found" });
    }
    return res.json({ success: true, data: row });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createExam = async (req, res) => {
  const tx = await sequelize.transaction();
  try {
    const body = { ...req.body };
    const title = String(body.title || body.name || "").trim();
    if (!title) throw new Error("Exam name is required.");
    if (!body.template_id) throw new Error("Template is required.");
    if (!Number.isFinite(Number(body.duration_minutes)) || Number(body.duration_minutes) <= 0) {
      throw new Error("Duration minutes must be greater than zero.");
    }

    const template = await ExamTemplate.findByPk(body.template_id, { transaction: tx });
    if (!template) throw new Error("Selected template was not found.");

    const normalizedQuestions = Array.isArray(body.questions) ? body.questions.map((q, i) => normalizeQuestion(q, i)) : [];
    if (!normalizedQuestions.length) throw new Error("At least one exam question is required.");
    const status = body.status && EXAM_STATUS.has(String(body.status)) ? String(body.status) : "draft";

    const row = await Exam.create(
      {
        title,
        description: body.description || null,
        template_id: body.template_id,
        total_marks: Number.isFinite(Number(body.total_marks)) ? Number(body.total_marks) : 0,
        passing_marks: Number.isFinite(Number(body.passing_marks)) ? Number(body.passing_marks) : 0,
        duration_minutes: Number(body.duration_minutes),
        requires_webcam: Boolean(body.requires_webcam),
        prevent_tab_switch: body.prevent_tab_switch === undefined ? true : Boolean(body.prevent_tab_switch),
        allow_retake: Boolean(body.allow_retake),
        max_attempts: Math.max(1, Number(body.max_attempts) || 1),
        instructions: body.instructions || null,
        exam_layout_json: normalizeExamLayout(body.exam_layout_json),
        status,
        created_by: req.user?.id || body.created_by || null,
      },
      { transaction: tx }
    );
    await ExamQuestion.bulkCreate(
      normalizedQuestions.map((q) => ({ ...q, exam_id: row.id })),
      { transaction: tx }
    );
    await tx.commit();
    const created = await Exam.findByPk(row.id, { include: examIncludes });
    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    await tx.rollback();
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateExam = async (req, res) => {
  try {
    const row = await Exam.findByPk(req.params.id);
    if (!row) {
      return res.status(404).json({ success: false, message: "Exam not found" });
    }
    const allowed = [
      "title",
      "description",
      "template_id",
      "total_marks",
      "passing_marks",
      "duration_minutes",
      "requires_webcam",
      "prevent_tab_switch",
      "allow_retake",
      "max_attempts",
      "instructions",
      "exam_layout_json",
      "status",
      "created_by",
    ];
    const patch = {};
    for (const k of allowed) {
      if (req.body[k] !== undefined) patch[k] = req.body[k];
    }
    if (patch.exam_layout_json !== undefined) {
      patch.exam_layout_json = normalizeExamLayout(patch.exam_layout_json);
    }
    await row.update(patch);
    if (Array.isArray(req.body.questions)) {
      const tx = await sequelize.transaction();
      try {
        const normalizedQuestions = req.body.questions.map((q, i) => normalizeQuestion(q, i));
        await ExamQuestion.destroy({ where: { exam_id: row.id }, transaction: tx });
        await ExamQuestion.bulkCreate(
          normalizedQuestions.map((q) => ({ ...q, exam_id: row.id })),
          { transaction: tx }
        );
        await tx.commit();
      } catch (e) {
        await tx.rollback();
        throw e;
      }
    }
    const updated = await Exam.findByPk(row.id, { include: examIncludes });
    return res.json({ success: true, data: updated });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteExam = async (req, res) => {
  const tx = await sequelize.transaction();
  try {
    const row = await Exam.findByPk(req.params.id, { transaction: tx });
    if (!row) {
      await tx.rollback();
      return res.status(404).json({ success: false, message: "Exam not found" });
    }

    // Delete exam-linked rows in FK-safe order.
    const questions = await ExamQuestion.findAll({
      where: { exam_id: row.id },
      attributes: ["id"],
      transaction: tx,
    });
    const questionIds = questions.map((q) => q.id);

    const attempts = await ExamAttempt.findAll({
      where: { exam_id: row.id },
      attributes: ["id"],
      transaction: tx,
    });
    const attemptIds = attempts.map((a) => a.id);

    const submissions = await ExamSubmission.findAll({
      where: { exam_id: row.id },
      attributes: ["id"],
      transaction: tx,
    });
    const submissionIds = submissions.map((s) => s.id);

    if (questionIds.length) {
      await ExamAnswer.destroy({ where: { question_id: questionIds }, transaction: tx });
      await StudentAnswer.destroy({ where: { question_id: questionIds }, transaction: tx });
      await TemporaryAnswer.destroy({ where: { question_id: questionIds }, transaction: tx });
      await ExamSessionLog.destroy({ where: { question_id: questionIds }, transaction: tx });
    }

    if (submissionIds.length) {
      await ExamAnswer.destroy({ where: { submission_id: submissionIds }, transaction: tx });
      await ExamSubmission.destroy({ where: { id: submissionIds }, transaction: tx });
    }

    if (attemptIds.length) {
      await StudentExamResult.destroy({ where: { exam_attempt_id: attemptIds }, transaction: tx });
      await StudentAnswer.destroy({ where: { exam_attempt_id: attemptIds }, transaction: tx });
      await TemporaryAnswer.destroy({ where: { exam_attempt_id: attemptIds }, transaction: tx });
      await ExamSessionLog.destroy({ where: { exam_attempt_id: attemptIds }, transaction: tx });
      await ExamAttempt.destroy({ where: { id: attemptIds }, transaction: tx });
    }

    await ExamSchedule.destroy({ where: { exam_id: row.id }, transaction: tx });
    await ExamQuestion.destroy({ where: { exam_id: row.id }, transaction: tx });
    await row.destroy({ transaction: tx });
    await tx.commit();
    return res.json({ success: true, message: "Exam deleted" });
  } catch (error) {
    await tx.rollback();
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.createExamSubmission = async (req, res) => {
  try {
    const exam = await Exam.findByPk(req.params.id, { include: [{ model: ExamQuestion, as: "questions" }] });
    if (!exam) return res.status(404).json({ success: false, message: "Exam not found" });
    const student = await findStudentByUser(req.user?.id);
    if (!student) return res.status(403).json({ success: false, message: "Student profile not found for this user." });

    let submission = await ExamSubmission.findOne({
      where: { exam_id: exam.id, student_id: student.id, status: "draft" },
      include: [{ model: ExamAnswer, as: "answers" }],
    });
    if (!submission) {
      submission = await ExamSubmission.create({ exam_id: exam.id, student_id: student.id, status: "draft", started_at: new Date() });
    }
    return res.status(201).json({ success: true, data: submission });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.getMyExamSubmission = async (req, res) => {
  try {
    const student = await findStudentByUser(req.user?.id);
    if (!student) return res.status(403).json({ success: false, message: "Student profile not found for this user." });
    const submission = await ExamSubmission.findOne({
      where: { exam_id: req.params.id, student_id: student.id },
      include: [
        { model: ExamAnswer, as: "answers", include: [{ model: ExamQuestion, as: "question" }] },
        { model: Exam, as: "exam", include: examIncludes },
      ],
      order: [[{ model: ExamAnswer, as: "answers" }, "created_at", "ASC"]],
    });
    return res.json({ success: true, data: submission });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.saveSubmissionAnswers = async (req, res) => {
  const tx = await sequelize.transaction();
  try {
    const student = await findStudentByUser(req.user?.id);
    if (!student) throw new Error("Student profile not found for this user.");
    const submission = await ExamSubmission.findByPk(req.params.submissionId, { transaction: tx });
    if (!submission) return res.status(404).json({ success: false, message: "Submission not found" });
    if (submission.student_id !== student.id) return res.status(403).json({ success: false, message: "You cannot edit this submission." });
    if (submission.status !== "draft") throw new Error("Submission already submitted.");

    const answers = Array.isArray(req.body.answers) ? req.body.answers : [];
    for (const item of answers) {
      if (!item?.question_id) continue;
      const payload = {
        answer_text: item.answer_text != null ? String(item.answer_text) : null,
        answer_json: item.answer_json !== undefined ? item.answer_json : null,
      };
      const existing = await ExamAnswer.findOne({
        where: { submission_id: submission.id, question_id: item.question_id },
        transaction: tx,
      });
      if (existing) await existing.update(payload, { transaction: tx });
      else await ExamAnswer.create({ submission_id: submission.id, question_id: item.question_id, ...payload }, { transaction: tx });
    }
    await tx.commit();
    const updated = await ExamSubmission.findByPk(submission.id, { include: [{ model: ExamAnswer, as: "answers" }] });
    return res.json({ success: true, data: updated });
  } catch (error) {
    await tx.rollback();
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.submitExamSubmission = async (req, res) => {
  try {
    const student = await findStudentByUser(req.user?.id);
    if (!student) return res.status(403).json({ success: false, message: "Student profile not found for this user." });
    const submission = await ExamSubmission.findByPk(req.params.submissionId, {
      include: [{ model: Exam, as: "exam", include: [{ model: ExamQuestion, as: "questions" }] }, { model: ExamAnswer, as: "answers" }],
    });
    if (!submission) return res.status(404).json({ success: false, message: "Submission not found" });
    if (submission.student_id !== student.id) return res.status(403).json({ success: false, message: "You cannot submit this submission." });
    if (submission.status === "submitted") return res.json({ success: true, data: submission });

    const requiredQuestions = (submission.exam?.questions || []).filter((q) => q.required);
    const answerMap = new Map((submission.answers || []).map((a) => [a.question_id, a]));
    for (const rq of requiredQuestions) {
      const ans = answerMap.get(rq.id);
      const hasText = Boolean(String(ans?.answer_text || "").trim());
      const hasJson = ans?.answer_json != null && (Array.isArray(ans.answer_json) ? ans.answer_json.length > 0 : true);
      if (!hasText && !hasJson) {
        return res.status(400).json({ success: false, message: `Required question not answered: ${rq.question_text}` });
      }
    }

    const startedAt = submission.started_at ? new Date(submission.started_at).getTime() : Date.now();
    const elapsed = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
    const limitSeconds = Number(submission.exam?.duration_minutes || 0) * 60;
    if (limitSeconds > 0 && elapsed > limitSeconds) {
      return res.status(400).json({ success: false, message: "Exam time has elapsed." });
    }

    await submission.update({ status: "submitted", submitted_at: new Date(), time_spent_seconds: elapsed });
    const updated = await ExamSubmission.findByPk(submission.id, { include: [{ model: ExamAnswer, as: "answers" }] });
    return res.json({ success: true, data: updated });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
