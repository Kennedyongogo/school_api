const {
  GradingAssignment,
  AssessmentComponent,
  Curriculum,
  CurriculumClass,
  CurriculumClassLevel,
  CurriculumSubject,
  Semester,
} = require("../models");
const { Op } = require("sequelize");

const assignmentIncludes = [
  { model: Curriculum, as: "curriculum", required: false, attributes: ["id", "name", "type"] },
  { model: CurriculumClass, as: "curriculum_class", required: false, attributes: ["id", "name", "code"] },
  { model: CurriculumClassLevel, as: "curriculum_class_level", required: false, attributes: ["id", "name"] },
  { model: CurriculumSubject, as: "curriculum_subject", required: false, attributes: ["id", "name"] },
];

const componentIncludes = [
  { model: Curriculum, as: "curriculum", required: false, attributes: ["id", "name", "type"] },
  { model: CurriculumClass, as: "curriculum_class", required: false, attributes: ["id", "name", "code"] },
  { model: CurriculumClassLevel, as: "curriculum_class_level", required: false, attributes: ["id", "name"] },
  { model: CurriculumSubject, as: "curriculum_subject", required: false, attributes: ["id", "name"] },
  { model: Semester, as: "semester", required: false, attributes: ["id", "name", "term_number"] },
];

const nowIsoDate = () => new Date().toISOString().slice(0, 10);

exports.listGradingAssignments = async (req, res) => {
  try {
    const where = {};
    if (req.query.scope_type) where.scope_type = String(req.query.scope_type);
    if (req.query.curriculum_id) where.curriculum_id = req.query.curriculum_id;
    if (req.query.curriculum_class_id) where.curriculum_class_id = req.query.curriculum_class_id;
    if (req.query.curriculum_class_level_id) where.curriculum_class_level_id = req.query.curriculum_class_level_id;
    if (req.query.curriculum_subject_id) where.curriculum_subject_id = req.query.curriculum_subject_id;
    if (req.query.grading_system_type) where.grading_system_type = String(req.query.grading_system_type);
    if (req.query.is_active !== undefined) where.is_active = req.query.is_active === "true";
    const rows = await GradingAssignment.findAll({
      where,
      include: assignmentIncludes,
      order: [["created_at", "DESC"]],
    });
    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createGradingAssignment = async (req, res) => {
  try {
    const payload = { ...(req.body || {}) };
    payload.created_by = req.user?.id || payload.created_by || null;
    const row = await GradingAssignment.create(payload);
    const created = await GradingAssignment.findByPk(row.id, { include: assignmentIncludes });
    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateGradingAssignment = async (req, res) => {
  try {
    const row = await GradingAssignment.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Grading assignment not found" });
    const allowed = [
      "scope_type",
      "curriculum_id",
      "curriculum_class_id",
      "curriculum_class_level_id",
      "curriculum_subject_id",
      "grading_system_type",
      "effective_from",
      "effective_to",
      "is_active",
      "notes",
    ];
    const patch = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) patch[key] = req.body[key];
    }
    patch.updated_by = req.user?.id || null;
    await row.update(patch);
    const updated = await GradingAssignment.findByPk(row.id, { include: assignmentIncludes });
    return res.json({ success: true, data: updated });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteGradingAssignment = async (req, res) => {
  try {
    const row = await GradingAssignment.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Grading assignment not found" });
    await row.destroy();
    return res.json({ success: true, message: "Grading assignment deleted" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.listAssessmentComponents = async (req, res) => {
  try {
    const where = {};
    if (req.query.curriculum_id) where.curriculum_id = req.query.curriculum_id;
    if (req.query.curriculum_class_id) where.curriculum_class_id = req.query.curriculum_class_id;
    if (req.query.curriculum_class_level_id) where.curriculum_class_level_id = req.query.curriculum_class_level_id;
    if (req.query.curriculum_subject_id) where.curriculum_subject_id = req.query.curriculum_subject_id;
    if (req.query.semester_id) where.semester_id = req.query.semester_id;
    if (req.query.component_type) where.component_type = String(req.query.component_type);
    if (req.query.is_active !== undefined) where.is_active = req.query.is_active === "true";
    const rows = await AssessmentComponent.findAll({
      where,
      include: componentIncludes,
      order: [["component_type", "ASC"], ["created_at", "DESC"]],
    });
    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createAssessmentComponent = async (req, res) => {
  try {
    const payload = { ...(req.body || {}) };
    payload.created_by = req.user?.id || payload.created_by || null;
    const row = await AssessmentComponent.create(payload);
    const created = await AssessmentComponent.findByPk(row.id, { include: componentIncludes });
    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateAssessmentComponent = async (req, res) => {
  try {
    const row = await AssessmentComponent.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Assessment component not found" });
    const allowed = [
      "curriculum_id",
      "curriculum_class_id",
      "curriculum_class_level_id",
      "curriculum_subject_id",
      "semester_id",
      "component_type",
      "component_label",
      "calculation_method",
      "weight_percent",
      "is_active",
    ];
    const patch = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) patch[key] = req.body[key];
    }
    patch.updated_by = req.user?.id || null;
    await row.update(patch);
    const updated = await AssessmentComponent.findByPk(row.id, { include: componentIncludes });
    return res.json({ success: true, data: updated });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteAssessmentComponent = async (req, res) => {
  try {
    const row = await AssessmentComponent.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Assessment component not found" });
    await row.destroy();
    return res.json({ success: true, message: "Assessment component deleted" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.resolveGradingConfiguration = async (req, res) => {
  try {
    const targetDate = String(req.query.on_date || nowIsoDate());
    const curriculum_id = req.query.curriculum_id || null;
    const curriculum_class_id = req.query.curriculum_class_id || null;
    const curriculum_class_level_id = req.query.curriculum_class_level_id || null;
    const curriculum_subject_id = req.query.curriculum_subject_id || null;
    const semester_id = req.query.semester_id || null;

    const baseDateFilter = {
      [Op.and]: [
        { [Op.or]: [{ effective_from: null }, { effective_from: { [Op.lte]: targetDate } }] },
        { [Op.or]: [{ effective_to: null }, { effective_to: { [Op.gte]: targetDate } }] },
      ],
    };

    const tryFindAssignment = async (scope_type, whereExtra) =>
      GradingAssignment.findOne({
        where: { scope_type, is_active: true, ...whereExtra, ...baseDateFilter },
        include: assignmentIncludes,
        order: [["updated_at", "DESC"], ["created_at", "DESC"]],
      });

    let assignment = null;
    if (curriculum_subject_id) {
      assignment = await tryFindAssignment("curriculum_subject", { curriculum_subject_id });
    }
    if (!assignment && curriculum_class_level_id) {
      assignment = await tryFindAssignment("curriculum_class_level", { curriculum_class_level_id });
    }
    if (!assignment && curriculum_class_id) {
      assignment = await tryFindAssignment("curriculum_class", { curriculum_class_id });
    }
    if (!assignment && curriculum_id) {
      assignment = await tryFindAssignment("curriculum", { curriculum_id });
    }

    const componentWhere = { is_active: true };
    if (curriculum_subject_id) componentWhere.curriculum_subject_id = curriculum_subject_id;
    else if (curriculum_class_level_id) componentWhere.curriculum_class_level_id = curriculum_class_level_id;
    else if (curriculum_class_id) componentWhere.curriculum_class_id = curriculum_class_id;
    else if (curriculum_id) componentWhere.curriculum_id = curriculum_id;
    if (semester_id) componentWhere.semester_id = semester_id;

    const components = await AssessmentComponent.findAll({
      where: componentWhere,
      include: componentIncludes,
      order: [["weight_percent", "DESC"], ["component_type", "ASC"]],
    });

    const totalWeightPercent = components.reduce((sum, row) => sum + Number(row.weight_percent || 0), 0);
    return res.json({
      success: true,
      data: {
        assignment: assignment || null,
        components,
        total_weight_percent: Number(totalWeightPercent.toFixed(2)),
        target_date: targetDate,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
