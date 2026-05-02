const crypto = require("crypto");
const { Op } = require("sequelize");
const { AdmissionApplication, AdmissionSettings } = require("../models");

function generateApplicationNumber() {
  const rand = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `ADM-${Date.now().toString(36).toUpperCase()}-${rand}`;
}

exports.submitPublicApplication = async (req, res) => {
  try {
    const payload = req.body;
    const required = ["student_name", "date_of_birth", "gender", "applying_for_grade", "address"];
    for (const k of required) {
      if (!payload[k]) {
        return res.status(400).json({ success: false, message: `${k} is required` });
      }
    }

    if (payload.academic_year_id) {
      const settings = await AdmissionSettings.findOne({
        where: {
          academic_year_id: payload.academic_year_id,
          is_open: true,
        },
      });
      if (settings) {
        const today = new Date().toISOString().slice(0, 10);
        if (today < settings.application_start_date || today > settings.application_end_date) {
          return res.status(400).json({
            success: false,
            message: "Applications are not open for this academic year period",
          });
        }
        if (settings.max_applications != null) {
          const count = await AdmissionApplication.count({
            where: { academic_year_id: settings.academic_year_id },
          });
          if (count >= settings.max_applications) {
            return res.status(400).json({
              success: false,
              message: "Maximum applications reached for this intake",
            });
          }
        }
      }
    }

    const allowed = [
      "student_name",
      "date_of_birth",
      "gender",
      "applying_for_grade",
      "curriculum_preference",
      "father_name",
      "father_phone",
      "father_email",
      "mother_name",
      "mother_phone",
      "mother_email",
      "guardian_name",
      "guardian_phone",
      "guardian_email",
      "address",
      "previous_school",
      "previous_grade",
      "last_exam_score",
      "birth_certificate_url",
      "report_card_url",
      "passport_photo_url",
      "transfer_certificate_url",
      "fee_waiver_requested",
      "fee_waiver_reason",
      "remarks",
      "academic_year_id",
    ];

    const data = {};
    for (const k of allowed) {
      if (payload[k] !== undefined) data[k] = payload[k];
    }

    data.application_number = generateApplicationNumber();

    const row = await AdmissionApplication.create(data);
    return res.status(201).json({ success: true, data: row });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.listApplications = async (req, res) => {
  try {
    const where = {};
    if (req.query.status) where.status = req.query.status;
    if (req.query.academic_year_id) where.academic_year_id = req.query.academic_year_id;

    const rows = await AdmissionApplication.findAll({
      where,
      order: [["created_at", "DESC"]],
      limit: Math.min(Number(req.query.limit) || 200, 500),
    });
    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getApplication = async (req, res) => {
  try {
    const row = await AdmissionApplication.findOne({
      where: {
        [Op.or]: [{ id: req.params.id }, { application_number: req.params.id }],
      },
    });
    if (!row) return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, data: row });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateApplication = async (req, res) => {
  try {
    const row = await AdmissionApplication.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Not found" });

    const allowed = [
      "status",
      "assessment_date",
      "assessment_notes",
      "assessment_score",
      "remarks",
      "fee_waiver_requested",
      "fee_waiver_reason",
      "birth_certificate_url",
      "report_card_url",
      "passport_photo_url",
      "transfer_certificate_url",
    ];
    const patch = {};
    for (const k of allowed) {
      if (req.body[k] !== undefined) patch[k] = req.body[k];
    }

    if (req.body.status && req.body.status !== row.status) {
      patch.processed_by = req.user?.id || null;
      patch.processed_at = new Date();
    }

    await row.update(patch);
    return res.json({ success: true, data: row });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteApplication = async (req, res) => {
  try {
    const row = await AdmissionApplication.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Not found" });
    await row.destroy();
    return res.json({ success: true, message: "Deleted" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
