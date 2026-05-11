const { Op } = require("sequelize");
const { OverallGradingScale, Curriculum, CurriculumClass } = require("../models");

const includes = [
  { model: Curriculum, as: "curriculum", required: false, attributes: ["id", "name", "type"] },
  { model: CurriculumClass, as: "curriculum_class", required: false, attributes: ["id", "name", "code"] },
];

async function ensureNoOverlap(payload, excludeId = null) {
  const min = Number(payload.min_score);
  const max = Number(payload.max_score);
  if (!Number.isFinite(min) || !Number.isFinite(max)) throw new Error("min_score and max_score must be valid numbers.");
  if (min < 0 || max > 100) throw new Error("Overall grade bands must be inside 0..100.");
  if (min > max) throw new Error("min_score cannot be greater than max_score.");
  const where = {
    curriculum_id: payload.curriculum_id,
    curriculum_class_id: payload.curriculum_class_id,
    [Op.and]: [{ min_score: { [Op.lte]: max } }, { max_score: { [Op.gte]: min } }],
  };
  if (excludeId) where.id = { [Op.ne]: excludeId };
  const overlapped = await OverallGradingScale.findOne({ where });
  if (overlapped) throw new Error("Overlapping overall grade band exists for this curriculum/class.");
}

exports.listOverallScales = async (req, res) => {
  try {
    const where = {};
    if (req.query.curriculum_id) where.curriculum_id = req.query.curriculum_id;
    if (req.query.curriculum_class_id) where.curriculum_class_id = req.query.curriculum_class_id;
    if (req.query.is_active !== undefined) where.is_active = req.query.is_active === "true";
    const rows = await OverallGradingScale.findAll({
      where,
      include: includes,
      order: [["sort_order", "ASC"], ["max_score", "DESC"]],
    });
    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createOverallScale = async (req, res) => {
  try {
    await ensureNoOverlap(req.body || {});
    const row = await OverallGradingScale.create(req.body || {});
    const created = await OverallGradingScale.findByPk(row.id, { include: includes });
    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateOverallScale = async (req, res) => {
  try {
    const row = await OverallGradingScale.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Overall grading scale not found" });
    const payload = {
      curriculum_id: req.body.curriculum_id ?? row.curriculum_id,
      curriculum_class_id: req.body.curriculum_class_id ?? row.curriculum_class_id,
      min_score: req.body.min_score ?? row.min_score,
      max_score: req.body.max_score ?? row.max_score,
    };
    await ensureNoOverlap(payload, row.id);
    const allowed = ["curriculum_id", "curriculum_class_id", "min_score", "max_score", "overall_grade", "remarks", "points", "is_pass", "sort_order", "is_active"];
    const patch = {};
    for (const k of allowed) if (req.body[k] !== undefined) patch[k] = req.body[k];
    await row.update(patch);
    const updated = await OverallGradingScale.findByPk(row.id, { include: includes });
    return res.json({ success: true, data: updated });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteOverallScale = async (req, res) => {
  try {
    const row = await OverallGradingScale.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Overall grading scale not found" });
    await row.destroy();
    return res.json({ success: true, message: "Overall grading scale deleted" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
