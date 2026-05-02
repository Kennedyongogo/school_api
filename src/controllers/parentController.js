const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");
const moment = require("moment");
const { sequelize, User, Parent, Installment } = require("../models");
const { getRemainingGraceDays } = require("../utils/gracePeriod");

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

exports.getMyStudentsFeeOverview = async (req, res) => {
  try {
    const parent = await Parent.findOne({ where: { user_id: req.user.id } });
    if (!parent) {
      return res.status(404).json({ success: false, message: "Parent profile not found" });
    }

    const students = await parent.getStudents({
      include: [{ model: User, as: "user", attributes: userExclude }],
    });

    const todayStr = moment().format("YYYY-MM-DD");
    const dashboard = [];

    for (const st of students) {
      const installments = await Installment.findAll({
        where: {
          student_id: st.id,
          balance: { [Op.gt]: 0 },
          status: { [Op.notIn]: ["cancelled", "paid"] },
        },
        order: [["due_date", "ASC"]],
        limit: 24,
      });

      const overdueInst = installments.filter((i) => i.due_date < todayStr);
      let daysOverdue = 0;
      if (overdueInst.length > 0) {
        daysOverdue = Math.max(
          0,
          moment(todayStr).diff(moment(overdueInst[0].due_date).startOf("day"), "days")
        );
      }

      const totalOutstanding = installments.reduce((sum, inv) => sum + Number(inv.balance || 0), 0);
      const days_left_in_grace = await getRemainingGraceDays(st.id);

      dashboard.push({
        student_id: st.id,
        student_name: st.user?.full_name,
        account_status: st.account_status,
        reactivation_required: st.reactivation_required,
        total_outstanding: Number(totalOutstanding.toFixed(2)),
        days_overdue: daysOverdue,
        days_left_in_grace,
        installments,
      });
    }

    return res.json({ success: true, data: dashboard });
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
