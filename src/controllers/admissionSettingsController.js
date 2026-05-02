const { Op } = require("sequelize");
const { AdmissionSettings } = require("../models");

exports.listPublicOpen = async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const rows = await AdmissionSettings.findAll({
      where: {
        is_open: true,
        application_start_date: { [Op.lte]: today },
        application_end_date: { [Op.gte]: today },
      },
      order: [["application_end_date", "ASC"]],
    });
    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.listSettings = async (req, res) => {
  try {
    const where = {};
    if (req.query.academic_year_id) where.academic_year_id = req.query.academic_year_id;
    if (req.query.is_open !== undefined) where.is_open = req.query.is_open === "true";

    const rows = await AdmissionSettings.findAll({
      where,
      order: [["created_at", "DESC"]],
    });
    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSettings = async (req, res) => {
  try {
    const row = await AdmissionSettings.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, data: row });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createSettings = async (req, res) => {
  try {
    const allowed = [
      "academic_year_id",
      "application_start_date",
      "application_end_date",
      "application_fee",
      "max_applications",
      "auto_approve_enrollment",
      "welcome_email_template",
      "is_open",
    ];
    const payload = {};
    for (const k of allowed) {
      if (req.body[k] !== undefined) payload[k] = req.body[k];
    }
    const row = await AdmissionSettings.create(payload);
    return res.status(201).json({ success: true, data: row });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const row = await AdmissionSettings.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Not found" });
    const allowed = [
      "application_start_date",
      "application_end_date",
      "application_fee",
      "max_applications",
      "auto_approve_enrollment",
      "welcome_email_template",
      "is_open",
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

exports.deleteSettings = async (req, res) => {
  try {
    const row = await AdmissionSettings.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Not found" });
    await row.destroy();
    return res.json({ success: true, message: "Deleted" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
