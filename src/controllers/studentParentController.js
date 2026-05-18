const { Op } = require("sequelize");
const { Parent, User } = require("../models");
const { hydrateParent } = require("./parentController");

const userExclude = { exclude: ["password_hash"] };

function linksFromParent(parentJson) {
  const students = Array.isArray(parentJson.students) ? parentJson.students : [];
  if (!students.length) {
    return [];
  }
  return students.map((student) => ({
    id: `${parentJson.id}:${student.id}`,
    parent_id: parentJson.id,
    student_id: student.id,
    parent: parentJson,
    student,
    created_at: parentJson.created_at,
    updated_at: parentJson.updated_at,
  }));
}

exports.listLinks = async (req, res) => {
  try {
    const { student_id, parent_id } = req.query;
    const where = {};
    if (parent_id) where.id = parent_id;
    if (student_id) {
      where.student_ids = { [Op.contains]: [student_id] };
    }

    const rows = await Parent.findAll({
      where,
      include: [{ model: User, as: "user", attributes: userExclude }],
      order: [["created_at", "DESC"]],
    });

    const hydrated = await Promise.all(rows.map((row) => hydrateParent(row)));
    const data = hydrated.flatMap(linksFromParent);
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createLink = async (req, res) => {
  return res.status(400).json({
    success: false,
    message: "Use POST /api/parents with student_ids to create a parent profile linked to students",
  });
};

/** `:id` is parent profile id, or `parentId:studentId` to unlink one student from the array. */
exports.deleteLink = async (req, res) => {
  try {
    const param = String(req.params.id || "");
    if (param.includes(":")) {
      const [parentId, studentId] = param.split(":");
      const parent = await Parent.findByPk(parentId);
      if (!parent) {
        return res.status(404).json({ success: false, message: "Parent profile not found" });
      }
      const nextIds = (parent.student_ids || []).filter((id) => String(id) !== String(studentId));
      if (nextIds.length === (parent.student_ids || []).length) {
        return res.status(404).json({ success: false, message: "Student not linked to this parent" });
      }
      if (nextIds.length === 0) {
        await parent.destroy();
        return res.json({ success: true, message: "Parent profile removed (no students left)" });
      }
      await parent.update({ student_ids: nextIds });
      return res.json({ success: true, message: "Student removed from parent profile" });
    }

    const parent = await Parent.findByPk(param);
    if (!parent) {
      return res.status(404).json({ success: false, message: "Parent profile not found" });
    }
    await parent.destroy();
    return res.json({ success: true, message: "Parent profile removed" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
