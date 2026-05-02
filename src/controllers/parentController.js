const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");
const { sequelize, User, Parent } = require("../models");

const userExclude = { exclude: ["password_hash"] };

exports.listParents = async (req, res) => {
  try {
    const rows = await Parent.findAll({
      include: [{ model: User, as: "user", attributes: userExclude }],
      order: [["created_at", "DESC"]],
    });
    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getParent = async (req, res) => {
  try {
    const row = await Parent.findByPk(req.params.id, {
      include: [{ model: User, as: "user", attributes: userExclude }],
    });
    if (!row) {
      return res.status(404).json({ success: false, message: "Parent not found" });
    }
    return res.json({ success: true, data: row });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyParentProfile = async (req, res) => {
  try {
    const row = await Parent.findOne({
      where: { user_id: req.user.id },
      include: [{ model: User, as: "user", attributes: userExclude }],
    });
    if (!row) {
      return res.status(404).json({ success: false, message: "Parent profile not found" });
    }
    return res.json({ success: true, data: row });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createParent = async (req, res) => {
  const {
    username,
    email,
    password,
    full_name,
    phone,
    address,
    profile_image,
    occupation,
    relationship,
    emergency_contact,
    newsletter_subscription,
  } = req.body;

  if (!username || !email || !password || !full_name || !relationship) {
    return res.status(400).json({
      success: false,
      message: "username, email, password, full_name, and relationship are required",
    });
  }

  const dup = await User.findOne({ where: { [Op.or]: [{ email }, { username }] } });
  if (dup) {
    return res.status(400).json({ success: false, message: "Email or username already in use" });
  }

  const t = await sequelize.transaction();
  try {
    const password_hash = await bcrypt.hash(password, 10);
    const user = await User.create(
      {
        username,
        email,
        password_hash,
        role: "parent",
        full_name,
        phone,
        address,
        profile_image: profile_image || null,
      },
      { transaction: t }
    );

    const parent = await Parent.create(
      {
        user_id: user.id,
        occupation,
        relationship,
        emergency_contact: !!emergency_contact,
        newsletter_subscription: newsletter_subscription !== false,
      },
      { transaction: t }
    );

    await t.commit();

    const created = await Parent.findByPk(parent.id, {
      include: [{ model: User, as: "user", attributes: userExclude }],
    });
    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    await t.rollback();
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateParent = async (req, res) => {
  try {
    const parent = await Parent.findByPk(req.params.id);
    if (!parent) {
      return res.status(404).json({ success: false, message: "Parent not found" });
    }

    const fields = ["occupation", "relationship", "emergency_contact", "newsletter_subscription"];
    const patch = {};
    for (const key of fields) {
      if (req.body[key] !== undefined) patch[key] = req.body[key];
    }
    await parent.update(patch);

    if (req.body.user && parent.user_id) {
      const user = await User.findByPk(parent.user_id);
      if (user) {
        const u = req.body.user;
        const allowed = ["full_name", "phone", "address", "profile_image", "email", "username"];
        const userPatch = {};
        for (const key of allowed) {
          if (u[key] !== undefined) userPatch[key] = u[key];
        }
        if (Object.keys(userPatch).length) await user.update(userPatch);
      }
    }

    const updated = await Parent.findByPk(parent.id, {
      include: [{ model: User, as: "user", attributes: userExclude }],
    });
    return res.json({ success: true, data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteParent = async (req, res) => {
  try {
    const parent = await Parent.findByPk(req.params.id);
    if (!parent) {
      return res.status(404).json({ success: false, message: "Parent not found" });
    }
    await User.destroy({ where: { id: parent.user_id } });
    return res.json({ success: true, message: "Parent deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
