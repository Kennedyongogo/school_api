const { AdmissionApplication, AdmissionSettings } = require("../models");

function generateApplicationNumber() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "ADM-";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

exports.submitPublicApplication = async (req, res) => {
  try {
    const payload = req.body;
    const required = [];
    for (const k of required) {
      if (!payload[k]) {
        return res.status(400).json({ success: false, message: `${k} is required` });
      }
    }

    const allowed = [
      "curriculum_level",
      "curriculum_class",
      "curriculum",
      "applicant_name",
      "applicant_phone",
      "applicant_email",
      "student_name",
      "student_picture",
      "student_reportcard",
      "student_birthcertificate",
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
    const rows = await AdmissionApplication.findAll({
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
    const row = await AdmissionApplication.findByPk(req.params.id);
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

    const allowed = [];
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

exports.uploadDocuments = async (req, res) => {
  try {
    const files = req.files;
    if (!files || Object.keys(files).length === 0) {
      return res.status(400).json({ success: false, message: "No files uploaded" });
    }

    const result = {};
    const fieldMappings = {
      student_picture: "studentPicture",
      student_reportcard: "studentReportcard",
      student_birthcertificate: "studentBirthcertificate",
    };

    for (const [fieldName, targetKey] of Object.entries(fieldMappings)) {
      if (files[fieldName] && files[fieldName][0]) {
        result[targetKey] = `/uploads/admission-documents/${files[fieldName][0].filename}`;
      }
    }

    return res.status(200).json({ success: true, files: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};