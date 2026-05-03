const bcrypt = require("bcryptjs");
const { sequelize, User, SchoolAdmin } = require("../models");
const { normalizeEmail, normalizeUsername, duplicateUserWhere } = require("../utils/userIdentity");

const userExclude = { exclude: ["password_hash"] };

exports.listSchoolAdmins = async (req, res) => {
  try {
    const rows = await SchoolAdmin.findAll({
      include: [{ model: User, as: "user", attributes: userExclude }],
      order: [["created_at", "DESC"]],
    });
    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSchoolAdmin = async (req, res) => {
  try {
    const row = await SchoolAdmin.findByPk(req.params.id, {
      include: [{ model: User, as: "user", attributes: userExclude }],
    });
    if (!row) {
      return res.status(404).json({ success: false, message: "Admin record not found" });
    }
    return res.json({ success: true, data: row });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createSchoolAdmin = async (req, res) => {
  const {
    username,
    email,
    password,
    full_name,
    phone,
    address,
    profile_image,
    employee_number,
    admin_type,
    permissions,
    department,
    joining_date,
  } = req.body;

  if (!username || !email || !password || !full_name || !employee_number || !admin_type) {
    return res.status(400).json({
      success: false,
      message: "username, email, password, full_name, employee_number, and admin_type are required",
    });
  }

  const emailNorm = normalizeEmail(email);
  const usernameNorm = normalizeUsername(username);
  const dup = await User.findOne({ where: duplicateUserWhere(email, username) });
  if (dup) {
    return res.status(400).json({ success: false, message: "Email or username already in use" });
  }

  const t = await sequelize.transaction();
  try {
    const password_hash = await bcrypt.hash(password, 10);

    let userRole = "admin";
    if (admin_type === "accountant") userRole = "accountant";
    if (admin_type === "librarian") userRole = "librarian";

    const user = await User.create(
      {
        username: usernameNorm,
        email: emailNorm,
        password_hash,
        role: userRole,
        full_name,
        phone,
        address,
        profile_image: profile_image || null,
      },
      { transaction: t }
    );

    const adminRow = await SchoolAdmin.create(
      {
        user_id: user.id,
        employee_number,
        admin_type,
        permissions: permissions || {},
        department,
        joining_date,
      },
      { transaction: t }
    );

    await t.commit();

    const created = await SchoolAdmin.findByPk(adminRow.id, {
      include: [{ model: User, as: "user", attributes: userExclude }],
    });
    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    await t.rollback();
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateSchoolAdmin = async (req, res) => {
  try {
    const adminRow = await SchoolAdmin.findByPk(req.params.id);
    if (!adminRow) {
      return res.status(404).json({ success: false, message: "Admin record not found" });
    }

    const fields = ["employee_number", "admin_type", "permissions", "department", "joining_date"];
    const patch = {};
    for (const key of fields) {
      if (req.body[key] !== undefined) patch[key] = req.body[key];
    }
    await adminRow.update(patch);

    if (req.body.admin_type && adminRow.user_id) {
      const at = req.body.admin_type;
      let userRole = "admin";
      if (at === "accountant") userRole = "accountant";
      if (at === "librarian") userRole = "librarian";
      await User.update({ role: userRole }, { where: { id: adminRow.user_id } });
    }

    if (req.body.user && adminRow.user_id) {
      const user = await User.findByPk(adminRow.user_id);
      if (user) {
        const u = req.body.user;
        const allowed = ["full_name", "phone", "address", "profile_image", "email", "username"];
        const userPatch = {};
        for (const key of allowed) {
          if (u[key] !== undefined) userPatch[key] = u[key];
        }
        if (userPatch.email !== undefined) userPatch.email = normalizeEmail(userPatch.email);
        if (userPatch.username !== undefined) userPatch.username = normalizeUsername(userPatch.username);
        if (Object.keys(userPatch).length) await user.update(userPatch);
      }
    }

    const updated = await SchoolAdmin.findByPk(adminRow.id, {
      include: [{ model: User, as: "user", attributes: userExclude }],
    });
    return res.json({ success: true, data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteSchoolAdmin = async (req, res) => {
  try {
    const adminRow = await SchoolAdmin.findByPk(req.params.id);
    if (!adminRow) {
      return res.status(404).json({ success: false, message: "Admin record not found" });
    }
    await User.destroy({ where: { id: adminRow.user_id } });
    return res.json({ success: true, message: "Admin staff deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
