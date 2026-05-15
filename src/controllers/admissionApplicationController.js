const { Op } = require("sequelize");
const { AdmissionApplication } = require("../models");
const { parsePagination } = require("../utils/pagination");
const {
  DEFAULT_ADMISSION_STATUS,
  isValidAdmissionStatus,
  ADMISSION_STATUSES,
  ADMISSION_STATUS_LABELS,
} = require("../constants/admissionStatuses");

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
    const payload = req.body || {};

    const requiredFields = [
      ["curriculum", "curriculum"],
      ["curriculum_class", "class"],
      ["curriculum_level", "term/level"],
      ["applicant_name", "applicant name"],
      ["student_name", "student name"],
    ];
    for (const [key, label] of requiredFields) {
      const value = payload[key] != null ? String(payload[key]).trim() : "";
      if (!value) {
        return res.status(400).json({ success: false, message: `${label} is required` });
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
      if (payload[k] === undefined || payload[k] === null) continue;
      const value = typeof payload[k] === "string" ? payload[k].trim() : payload[k];
      data[k] = value === "" ? null : value;
    }

    data.application_number = generateApplicationNumber();
    data.status = DEFAULT_ADMISSION_STATUS;

    const row = await AdmissionApplication.create(data);
    return res.status(201).json({ success: true, data: row });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.listApplications = async (req, res) => {
  try {
    const { page, limit, offset } = parsePagination(req);
    const where = {};

    const statusFilter = req.query.status != null ? String(req.query.status).trim() : "";
    if (statusFilter) {
      if (!isValidAdmissionStatus(statusFilter)) {
        return res.status(400).json({ success: false, message: "Invalid status filter" });
      }
      where.status = statusFilter;
    }

    const search = req.query.search != null ? String(req.query.search).trim() : "";
    if (search) {
      where[Op.or] = [
        { applicant_name: { [Op.iLike]: `%${search}%` } },
        { student_name: { [Op.iLike]: `%${search}%` } },
        { application_number: { [Op.iLike]: `%${search}%` } },
        { applicant_email: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows } = await AdmissionApplication.findAndCountAll({
      where,
      order: [["created_at", "DESC"]],
      limit,
      offset,
    });

    return res.json({
      success: true,
      data: rows,
      statuses: ADMISSION_STATUSES.map((value) => ({
        value,
        label: ADMISSION_STATUS_LABELS[value] || value,
      })),
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(count / limit)),
      },
    });
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

    const patch = {};
    if (req.body.status !== undefined) {
      const nextStatus = String(req.body.status).trim();
      if (!isValidAdmissionStatus(nextStatus)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Allowed: ${ADMISSION_STATUSES.join(", ")}`,
        });
      }
      patch.status = nextStatus;
    }

    if (Object.keys(patch).length === 0) {
      return res.status(400).json({ success: false, message: "No valid fields to update" });
    }

    await row.update(patch);
    await row.reload();
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
