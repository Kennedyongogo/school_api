const { StudentInstallmentPlan } = require("../models");
const { generateInstallmentsForStudent } = require("../utils/installmentGenerator");

exports.generateInstallments = async (req, res) => {
  try {
    const {
      student_id,
      academic_year_id,
      term_id,
      installment_plan_id,
      grade_level_id,
      total_term_fees_override,
      replace_existing,
    } = req.body;

    if (!student_id || !academic_year_id || !term_id || !installment_plan_id) {
      return res.status(400).json({
        success: false,
        message: "student_id, academic_year_id, term_id, and installment_plan_id are required",
      });
    }

    const result = await generateInstallmentsForStudent({
      studentId: student_id,
      academicYearId: academic_year_id,
      termId: term_id,
      installmentPlanId: installment_plan_id,
      gradeLevelId: grade_level_id,
      totalTermFeesOverride: total_term_fees_override,
      replaceExisting: !!replace_existing,
    });

    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.listStudentInstallmentPlans = async (req, res) => {
  try {
    const where = {};
    if (req.query.student_id) where.student_id = req.query.student_id;
    if (req.query.academic_year_id) where.academic_year_id = req.query.academic_year_id;
    if (req.query.term_id) where.term_id = req.query.term_id;

    const rows = await StudentInstallmentPlan.findAll({ where, order: [["selected_at", "DESC"]] });
    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getStudentInstallmentPlan = async (req, res) => {
  try {
    const row = await StudentInstallmentPlan.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, data: row });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createStudentInstallmentPlan = async (req, res) => {
  try {
    const row = await StudentInstallmentPlan.create(req.body);
    return res.status(201).json({ success: true, data: row });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateStudentInstallmentPlan = async (req, res) => {
  try {
    const row = await StudentInstallmentPlan.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Not found" });
    const allowed = [
      "installment_plan_id",
      "total_term_fees",
      "selected_at",
      "is_active",
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

exports.deleteStudentInstallmentPlan = async (req, res) => {
  try {
    const row = await StudentInstallmentPlan.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Not found" });
    await row.destroy();
    return res.json({ success: true, message: "Deleted" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
