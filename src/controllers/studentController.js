const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");
const { sequelize, User, Student, Teacher } = require("../models");

const userExclude = { exclude: ["password_hash"] };

exports.listStudents = async (req, res) => {
  try {
    const rows = await Student.findAll({
      include: [
        { model: User, as: "user", attributes: userExclude },
        { model: Teacher, as: "class_teacher", required: false, include: [{ model: User, as: "user", attributes: userExclude }] },
      ],
      order: [["created_at", "DESC"]],
    });
    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getStudent = async (req, res) => {
  try {
    const row = await Student.findByPk(req.params.id, {
      include: [
        { model: User, as: "user", attributes: userExclude },
        { model: Teacher, as: "class_teacher", required: false, include: [{ model: User, as: "user", attributes: userExclude }] },
      ],
    });
    if (!row) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }
    return res.json({ success: true, data: row });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyStudentProfile = async (req, res) => {
  try {
    const row = await Student.findOne({
      where: { user_id: req.user.id },
      include: [{ model: User, as: "user", attributes: userExclude }],
    });
    if (!row) {
      return res.status(404).json({ success: false, message: "Student profile not found" });
    }
    return res.json({ success: true, data: row });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createStudent = async (req, res) => {
  const {
    username,
    email,
    password,
    full_name,
    phone,
    address,
    profile_image,
    admission_number,
    date_of_birth,
    gender,
    current_class,
    section,
    roll_number,
    enrollment_date,
    graduation_year,
    blood_group,
    medical_conditions,
    emergency_contact_name,
    emergency_contact_phone,
    is_alumni,
    class_teacher_id,
  } = req.body;

  if (
    !username ||
    !email ||
    !password ||
    !full_name ||
    !admission_number ||
    !date_of_birth ||
    !gender ||
    !current_class
  ) {
    return res.status(400).json({
      success: false,
      message:
        "username, email, password, full_name, admission_number, date_of_birth, gender, and current_class are required",
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
        role: "student",
        full_name,
        phone,
        address,
        profile_image: profile_image || null,
      },
      { transaction: t }
    );

    const student = await Student.create(
      {
        user_id: user.id,
        admission_number,
        date_of_birth,
        gender,
        current_class,
        section,
        roll_number,
        enrollment_date,
        graduation_year,
        blood_group,
        medical_conditions,
        emergency_contact_name,
        emergency_contact_phone,
        is_alumni: !!is_alumni,
        class_teacher_id: class_teacher_id || null,
      },
      { transaction: t }
    );

    await t.commit();

    const created = await Student.findByPk(student.id, {
      include: [{ model: User, as: "user", attributes: userExclude }],
    });
    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    await t.rollback();
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const studentFields = [
      "admission_number",
      "date_of_birth",
      "gender",
      "current_class",
      "section",
      "roll_number",
      "enrollment_date",
      "graduation_year",
      "blood_group",
      "medical_conditions",
      "emergency_contact_name",
      "emergency_contact_phone",
      "is_alumni",
      "class_teacher_id",
    ];
    const patch = {};
    for (const key of studentFields) {
      if (req.body[key] !== undefined) patch[key] = req.body[key];
    }
    await student.update(patch);

    if (req.body.user && student.user_id) {
      const user = await User.findByPk(student.user_id);
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

    const updated = await Student.findByPk(student.id, {
      include: [{ model: User, as: "user", attributes: userExclude }],
    });
    return res.json({ success: true, data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }
    await User.destroy({ where: { id: student.user_id } });
    return res.json({ success: true, message: "Student deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
