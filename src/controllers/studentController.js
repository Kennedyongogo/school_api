const bcrypt = require("bcryptjs");
const { sequelize, User, Student, Teacher } = require("../models");
const { normalizeEmail, normalizeUsername, duplicateUserWhere } = require("../utils/userIdentity");
const { parsePagination } = require("../utils/pagination");
const { convertToRelativePath } = require("../utils/filePath");
const { unlinkProfilePictureIfExists } = require("../utils/profilePictureStorage");

const userExclude = { exclude: ["password_hash"] };

const studentListIncludes = [
  { model: User, as: "user", attributes: userExclude },
  { model: Teacher, as: "class_teacher", required: false, include: [{ model: User, as: "user", attributes: userExclude }] },
];

function coerceBool(v) {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") return v === "true" || v === "1";
  return !!v;
}

function normalizeStudentRequestBody(req) {
  const b = { ...req.body };
  if (typeof b.user === "string") {
    try {
      b.user = JSON.parse(b.user);
    } catch {
      b.user = {};
    }
  }
  if (b.is_alumni !== undefined) b.is_alumni = coerceBool(b.is_alumni);
  if (b.graduation_year !== undefined && b.graduation_year !== "") {
    const n = parseInt(String(b.graduation_year), 10);
    if (!Number.isNaN(n)) b.graduation_year = n;
  } else if (b.graduation_year === "") {
    b.graduation_year = null;
  }
  return b;
}

function resolveStudentProfilePicture(req, existingStudent) {
  if (req.file?.path) {
    const rel = convertToRelativePath(req.file.path);
    if (existingStudent?.profile_picture && existingStudent.profile_picture !== rel) {
      unlinkProfilePictureIfExists(existingStudent.profile_picture);
    }
    return rel;
  }
  if (req.body.profile_picture !== undefined) {
    const v = req.body.profile_picture;
    if (v === "" || v === null) {
      if (existingStudent?.profile_picture) unlinkProfilePictureIfExists(existingStudent.profile_picture);
      return null;
    }
    const s = String(v).trim();
    return s || null;
  }
  return undefined;
}

exports.listStudents = async (req, res) => {
  try {
    const { page, limit, offset } = parsePagination(req);
    const { count, rows } = await Student.findAndCountAll({
      include: studentListIncludes,
      order: [["created_at", "DESC"]],
      limit,
      offset,
      distinct: true,
      subQuery: false,
    });
    return res.json({
      success: true,
      data: rows,
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

exports.getStudent = async (req, res) => {
  try {
    const row = await Student.findByPk(req.params.id, {
      include: studentListIncludes,
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

/** Users with role `student` who do not yet have a row in `students` (link when creating a student profile). */
exports.listStudentUsersWithoutProfile = async (req, res) => {
  try {
    const users = await User.findAll({
      where: { role: "student" },
      attributes: userExclude,
      include: [
        {
          model: Student,
          as: "student_profile",
          required: false,
          attributes: ["id"],
        },
      ],
      order: [["full_name", "ASC"]],
    });
    const data = users
      .filter((u) => !u.student_profile)
      .map((u) => {
        const j = u.toJSON();
        delete j.student_profile;
        return j;
      });
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createStudent = async (req, res) => {
  const body = normalizeStudentRequestBody(req);
  const {
    user_id: bodyUserId,
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
  } = body;

  let profile_picture = null;
  const picResolved = resolveStudentProfilePicture(req, null);
  if (picResolved !== undefined) profile_picture = picResolved;

  if (!admission_number || !date_of_birth || !gender || !current_class) {
    return res.status(400).json({
      success: false,
      message: "admission_number, date_of_birth, gender, and current_class are required",
    });
  }

  const studentPayload = {
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
    profile_picture,
  };

  if (bodyUserId) {
    try {
      const user = await User.findByPk(bodyUserId);
      if (!user || user.role !== "student") {
        return res.status(400).json({
          success: false,
          message: "user_id must reference an existing user with role student",
        });
      }
      const existingProfile = await Student.findOne({ where: { user_id: bodyUserId } });
      if (existingProfile) {
        return res.status(400).json({
          success: false,
          message: "This user already has a student profile",
        });
      }
      const student = await Student.create({
        user_id: bodyUserId,
        ...studentPayload,
      });
      const created = await Student.findByPk(student.id, {
        include: [{ model: User, as: "user", attributes: userExclude }],
      });
      return res.status(201).json({ success: true, data: created });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  if (!username || !email || !password || !full_name) {
    return res.status(400).json({
      success: false,
      message:
        "Either provide user_id to link an existing student user, or send username, email, password, and full_name to create a new account",
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
        ...studentPayload,
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

    const body = normalizeStudentRequestBody(req);

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
      if (body[key] !== undefined) patch[key] = body[key];
    }
    const pic = resolveStudentProfilePicture(req, student);
    if (pic !== undefined) patch.profile_picture = pic;

    await student.update(patch);

    if (body.user && student.user_id) {
      const user = await User.findByPk(student.user_id);
      if (user) {
        const u = body.user;
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
    if (student.profile_picture) unlinkProfilePictureIfExists(student.profile_picture);
    await User.destroy({ where: { id: student.user_id } });
    return res.json({ success: true, message: "Student deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
