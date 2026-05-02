const { Subject, Department } = require("../models");

exports.listSubjects = async (req, res) => {
  try {
    const where = {};
    if (req.query.department_id) where.department_id = req.query.department_id;

    const rows = await Subject.findAll({
      where,
      include: [{ model: Department, as: "department" }],
      order: [["code", "ASC"]],
    });
    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSubject = async (req, res) => {
  try {
    const row = await Subject.findByPk(req.params.id, {
      include: [{ model: Department, as: "department" }],
    });
    if (!row) {
      return res.status(404).json({ success: false, message: "Subject not found" });
    }
    return res.json({ success: true, data: row });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createSubject = async (req, res) => {
  try {
    const row = await Subject.create(req.body);
    const created = await Subject.findByPk(row.id, {
      include: [{ model: Department, as: "department" }],
    });
    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateSubject = async (req, res) => {
  try {
    const row = await Subject.findByPk(req.params.id);
    if (!row) {
      return res.status(404).json({ success: false, message: "Subject not found" });
    }
    const allowed = [
      "name",
      "code",
      "department_id",
      "credit_hours",
      "is_elective",
      "description",
      "passing_mark",
      "full_mark",
    ];
    const patch = {};
    for (const k of allowed) {
      if (req.body[k] !== undefined) patch[k] = req.body[k];
    }
    await row.update(patch);
    const updated = await Subject.findByPk(row.id, {
      include: [{ model: Department, as: "department" }],
    });
    return res.json({ success: true, data: updated });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteSubject = async (req, res) => {
  try {
    const row = await Subject.findByPk(req.params.id);
    if (!row) {
      return res.status(404).json({ success: false, message: "Subject not found" });
    }
    await row.destroy();
    return res.json({ success: true, message: "Subject deleted" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
