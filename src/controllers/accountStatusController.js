const { AccountStatus } = require("../models");

exports.listAccountStatuses = async (req, res) => {
  try {
    const where = {};
    if (req.query.student_id) where.student_id = req.query.student_id;
    if (req.query.status) where.status = req.query.status;

    const rows = await AccountStatus.findAll({
      where,
      order: [["created_at", "DESC"]],
      limit: Math.min(Number(req.query.limit) || 200, 500),
    });
    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAccountStatus = async (req, res) => {
  try {
    const row = await AccountStatus.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, data: row });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
