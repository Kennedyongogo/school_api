const { StudentParent, Student, Parent, User } = require("../models");

const userExclude = { exclude: ["password_hash"] };

exports.listLinks = async (req, res) => {
  try {
    const { student_id, parent_id } = req.query;
    const where = {};
    if (student_id) where.student_id = student_id;
    if (parent_id) where.parent_id = parent_id;

    const rows = await StudentParent.findAll({
      where,
      include: [
        {
          model: Student,
          include: [{ model: User, as: "user", attributes: userExclude }],
        },
        {
          model: Parent,
          include: [{ model: User, as: "user", attributes: userExclude }],
        },
      ],
      order: [["created_at", "DESC"]],
    });
    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createLink = async (req, res) => {
  try {
    const { student_id, parent_id, is_primary_contact } = req.body;
    if (!student_id || !parent_id) {
      return res.status(400).json({
        success: false,
        message: "student_id and parent_id are required",
      });
    }

    const [student, parent] = await Promise.all([
      Student.findByPk(student_id),
      Parent.findByPk(parent_id),
    ]);
    if (!student || !parent) {
      return res.status(404).json({ success: false, message: "Student or parent not found" });
    }

    const row = await StudentParent.create({
      student_id,
      parent_id,
      is_primary_contact: !!is_primary_contact,
    });

    const full = await StudentParent.findByPk(row.id, {
      include: [
        { model: Student, include: [{ model: User, as: "user", attributes: userExclude }] },
        { model: Parent, include: [{ model: User, as: "user", attributes: userExclude }] },
      ],
    });
    return res.status(201).json({ success: true, data: full });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteLink = async (req, res) => {
  try {
    const row = await StudentParent.findByPk(req.params.id);
    if (!row) {
      return res.status(404).json({ success: false, message: "Link not found" });
    }
    await row.destroy();
    return res.json({ success: true, message: "Link removed" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
