const { Department, Teacher, User } = require("../models");

const userSafe = { attributes: { exclude: ["password_hash"] } };

exports.listDepartments = async (req, res) => {
  try {
    const where = {};
    if (req.query.is_active !== undefined) {
      where.is_active = req.query.is_active === "true";
    }
    const rows = await Department.findAll({
      where,
      include: [{ model: Teacher, as: "HOD", required: false, include: [{ model: User, as: "user", ...userSafe }] }],
      order: [["name", "ASC"]],
    });
    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDepartment = async (req, res) => {
  try {
    const row = await Department.findByPk(req.params.id, {
      include: [{ model: Teacher, as: "HOD", required: false, include: [{ model: User, as: "user", ...userSafe }] }],
    });
    if (!row) {
      return res.status(404).json({ success: false, message: "Department not found" });
    }
    return res.json({ success: true, data: row });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createDepartment = async (req, res) => {
  try {
    const row = await Department.create(req.body);
    const created = await Department.findByPk(row.id, {
      include: [{ model: Teacher, as: "HOD", required: false, include: [{ model: User, as: "user", ...userSafe }] }],
    });
    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateDepartment = async (req, res) => {
  try {
    const row = await Department.findByPk(req.params.id);
    if (!row) {
      return res.status(404).json({ success: false, message: "Department not found" });
    }
    const allowed = [
      "name",
      "code",
      "description",
      "head_of_department",
      "budget",
      "room_location",
      "email",
      "phone",
      "is_active",
    ];
    const patch = {};
    for (const k of allowed) {
      if (req.body[k] !== undefined) patch[k] = req.body[k];
    }
    await row.update(patch);
    const updated = await Department.findByPk(row.id, {
      include: [{ model: Teacher, as: "HOD", required: false, include: [{ model: User, as: "user", ...userSafe }] }],
    });
    return res.json({ success: true, data: updated });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteDepartment = async (req, res) => {
  try {
    const row = await Department.findByPk(req.params.id);
    if (!row) {
      return res.status(404).json({ success: false, message: "Department not found" });
    }
    await row.destroy();
    return res.json({ success: true, message: "Department deleted" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
