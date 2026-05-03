const bcrypt = require("bcryptjs");
const { sequelize, User, Teacher } = require("../models");
const { normalizeEmail, normalizeUsername, duplicateUserWhere } = require("../utils/userIdentity");

const userExclude = { exclude: ["password_hash"] };

exports.listTeachers = async (req, res) => {
  try {
    const rows = await Teacher.findAll({
      include: [{ model: User, as: "user", attributes: userExclude }],
      order: [["created_at", "DESC"]],
    });
    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTeacher = async (req, res) => {
  try {
    const row = await Teacher.findByPk(req.params.id, {
      include: [{ model: User, as: "user", attributes: userExclude }],
    });
    if (!row) {
      return res.status(404).json({ success: false, message: "Teacher not found" });
    }
    return res.json({ success: true, data: row });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyTeacherProfile = async (req, res) => {
  try {
    const row = await Teacher.findOne({
      where: { user_id: req.user.id },
      include: [{ model: User, as: "user", attributes: userExclude }],
    });
    if (!row) {
      return res.status(404).json({ success: false, message: "Teacher profile not found" });
    }
    return res.json({ success: true, data: row });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createTeacher = async (req, res) => {
  const {
    username,
    email,
    password,
    full_name,
    phone,
    address,
    profile_image,
    employee_number,
    qualification,
    specialization,
    years_of_experience,
    joining_date,
    department,
    is_class_teacher,
    class_teacher_of,
    salary,
    bank_account_number,
    highest_degree,
    awards,
  } = req.body;

  if (!username || !email || !password || !full_name || !employee_number || !qualification) {
    return res.status(400).json({
      success: false,
      message: "username, email, password, full_name, employee_number, and qualification are required",
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
    const user = await User.create(
      {
        username: usernameNorm,
        email: emailNorm,
        password_hash,
        role: "teacher",
        full_name,
        phone,
        address,
        profile_image: profile_image || null,
      },
      { transaction: t }
    );

    const teacher = await Teacher.create(
      {
        user_id: user.id,
        employee_number,
        qualification,
        specialization,
        years_of_experience,
        joining_date,
        department,
        is_class_teacher: !!is_class_teacher,
        class_teacher_of,
        salary,
        bank_account_number,
        highest_degree,
        awards,
      },
      { transaction: t }
    );

    await t.commit();

    const created = await Teacher.findByPk(teacher.id, {
      include: [{ model: User, as: "user", attributes: userExclude }],
    });
    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    await t.rollback();
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id);
    if (!teacher) {
      return res.status(404).json({ success: false, message: "Teacher not found" });
    }

    const fields = [
      "employee_number",
      "qualification",
      "specialization",
      "years_of_experience",
      "joining_date",
      "department",
      "is_class_teacher",
      "class_teacher_of",
      "salary",
      "bank_account_number",
      "highest_degree",
      "awards",
    ];
    const patch = {};
    for (const key of fields) {
      if (req.body[key] !== undefined) patch[key] = req.body[key];
    }
    await teacher.update(patch);

    if (req.body.user && teacher.user_id) {
      const user = await User.findByPk(teacher.user_id);
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

    const updated = await Teacher.findByPk(teacher.id, {
      include: [{ model: User, as: "user", attributes: userExclude }],
    });
    return res.json({ success: true, data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id);
    if (!teacher) {
      return res.status(404).json({ success: false, message: "Teacher not found" });
    }
    await User.destroy({ where: { id: teacher.user_id } });
    return res.json({ success: true, message: "Teacher deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
