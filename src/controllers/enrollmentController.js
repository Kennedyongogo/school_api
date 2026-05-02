const { Enrollment, Student, Section, User, GradeLevel, Teacher } = require("../models");

const userSafe = { attributes: { exclude: ["password_hash"] } };

const sectionInclude = {
  model: Section,
  as: "section",
  include: [
    { model: GradeLevel, as: "grade_level" },
    {
      model: Teacher,
      as: "ClassTeacher",
      required: false,
      include: [{ model: User, as: "user", ...userSafe }],
    },
  ],
};

exports.listEnrollments = async (req, res) => {
  try {
    const where = {};
    if (req.query.student_id) where.student_id = req.query.student_id;
    if (req.query.section_id) where.section_id = req.query.section_id;
    if (req.query.academic_year) where.academic_year = req.query.academic_year;
    if (req.query.is_active !== undefined) {
      where.is_active = req.query.is_active === "true";
    }

    const rows = await Enrollment.findAll({
      where,
      include: [
        {
          model: Student,
          as: "student",
          include: [{ model: User, as: "user", ...userSafe }],
        },
        sectionInclude,
      ],
      order: [["academic_year", "DESC"], ["created_at", "DESC"]],
    });
    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getEnrollment = async (req, res) => {
  try {
    const row = await Enrollment.findByPk(req.params.id, {
      include: [
        {
          model: Student,
          as: "student",
          include: [{ model: User, as: "user", ...userSafe }],
        },
        sectionInclude,
      ],
    });
    if (!row) {
      return res.status(404).json({ success: false, message: "Enrollment not found" });
    }
    return res.json({ success: true, data: row });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createEnrollment = async (req, res) => {
  try {
    const section = await Section.findByPk(req.body.section_id);
    if (!section) {
      return res.status(404).json({ success: false, message: "Section not found" });
    }

    const row = await Enrollment.create(req.body);
    await section.increment("current_enrollment");

    const created = await Enrollment.findByPk(row.id, {
      include: [
        {
          model: Student,
          as: "student",
          include: [{ model: User, as: "user", ...userSafe }],
        },
        sectionInclude,
      ],
    });
    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateEnrollment = async (req, res) => {
  try {
    const row = await Enrollment.findByPk(req.params.id);
    if (!row) {
      return res.status(404).json({ success: false, message: "Enrollment not found" });
    }

    const allowed = ["student_id", "section_id", "academic_year", "enrollment_date", "is_active"];
    const patch = {};
    for (const k of allowed) {
      if (req.body[k] !== undefined) patch[k] = req.body[k];
    }

    await row.update(patch);

    const updated = await Enrollment.findByPk(row.id, {
      include: [
        {
          model: Student,
          as: "student",
          include: [{ model: User, as: "user", ...userSafe }],
        },
        sectionInclude,
      ],
    });
    return res.json({ success: true, data: updated });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteEnrollment = async (req, res) => {
  try {
    const row = await Enrollment.findByPk(req.params.id);
    if (!row) {
      return res.status(404).json({ success: false, message: "Enrollment not found" });
    }

    const section = await Section.findByPk(row.section_id);
    await row.destroy();
    if (section && row.is_active) {
      await section.decrement("current_enrollment");
    }

    return res.json({ success: true, message: "Enrollment deleted" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
