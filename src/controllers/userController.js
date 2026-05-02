const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const { User } = require("../models");
const config = require("../config/config");

const sanitizeUser = (user) => {
  const plain = user.get ? user.get({ plain: true }) : user;
  delete plain.password_hash;
  return plain;
};

const signToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, username: user.username, type: "user", role: user.role },
    config.jwtSecret,
    { expiresIn: "7d" }
  );

const PUBLIC_REGISTER_ROLES = ["parent"];

exports.login = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    if (!password || (!email && !username)) {
      return res.status(400).json({
        success: false,
        message: "Password and email or username are required",
      });
    }

    const where = email ? { email } : { username };
    const user = await User.findOne({ where });

    if (!user || !user.is_active) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    await user.update({ last_login: new Date() });

    return res.json({
      success: true,
      data: { user: sanitizeUser(user), token: signToken(user) },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.register = async (req, res) => {
  try {
    const { username, email, password, full_name, phone, address, role } = req.body;
    const requestedRole = role || "parent";

    if (!PUBLIC_REGISTER_ROLES.includes(requestedRole)) {
      return res.status(403).json({
        success: false,
        message: `Public registration is only allowed for: ${PUBLIC_REGISTER_ROLES.join(", ")}`,
      });
    }

    if (!username || !email || !password || !full_name) {
      return res.status(400).json({
        success: false,
        message: "username, email, password, and full_name are required",
      });
    }

    const exists = await User.findOne({
      where: { [Op.or]: [{ email }, { username }] },
    });
    if (exists) {
      return res.status(400).json({ success: false, message: "Email or username already in use" });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password_hash,
      role: requestedRole,
      full_name,
      phone,
      address,
      profile_image: req.body.profile_image || null,
    });

    return res.status(201).json({ success: true, data: sanitizeUser(user) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password_hash"] },
    });
    return res.json({ success: true, data: user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.listUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password_hash"] },
      order: [["created_at", "DESC"]],
    });
    return res.json({ success: true, data: users });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const staffRoles = ["admin", "accountant", "librarian"];

exports.getUserById = async (req, res) => {
  try {
    if (req.params.id !== req.user.id && !staffRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ["password_hash"] },
    });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.json({ success: true, data: user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { username, email, password, full_name, phone, address, role, profile_image } = req.body;
    if (!username || !email || !password || !full_name || !role) {
      return res.status(400).json({
        success: false,
        message: "username, email, password, full_name, and role are required",
      });
    }

    const exists = await User.findOne({
      where: { [Op.or]: [{ email }, { username }] },
    });
    if (exists) {
      return res.status(400).json({ success: false, message: "Email or username already in use" });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password_hash,
      role,
      full_name,
      phone,
      address,
      profile_image: profile_image || null,
    });

    return res.status(201).json({ success: true, data: sanitizeUser(user) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    if (req.params.id !== req.user.id && !staffRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const allowed = ["full_name", "phone", "address", "profile_image", "email", "username", "role"];
    const patch = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) patch[key] = req.body[key];
    }

    if (patch.role !== undefined && !staffRoles.includes(req.user.role)) {
      delete patch.role;
    }

    await user.update(patch);
    return res.json({ success: true, data: sanitizeUser(user) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (req.user.id !== user.id && !["admin", "accountant"].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const { current_password, new_password } = req.body;
    if (!new_password) {
      return res.status(400).json({ success: false, message: "new_password is required" });
    }

    if (req.user.id === user.id) {
      if (!current_password) {
        return res.status(400).json({ success: false, message: "current_password is required" });
      }
      const ok = await bcrypt.compare(current_password, user.password_hash);
      if (!ok) {
        return res.status(400).json({ success: false, message: "Current password incorrect" });
      }
    }

    const password_hash = await bcrypt.hash(new_password, 10);
    await user.update({ password_hash });
    return res.json({ success: true, message: "Password updated" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.toggleActive = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    await user.update({ is_active: !user.is_active });
    return res.json({ success: true, data: sanitizeUser(user) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    await user.destroy();
    return res.json({ success: true, message: "User deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
