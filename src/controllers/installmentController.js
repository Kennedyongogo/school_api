const { Installment } = require("../models");

exports.listInstallments = async (req, res) => {
  try {
    const where = {};
    if (req.query.student_id) where.student_id = req.query.student_id;
    if (req.query.academic_year_id) where.academic_year_id = req.query.academic_year_id;
    if (req.query.term_id) where.term_id = req.query.term_id;
    if (req.query.status) where.status = req.query.status;

    const rows = await Installment.findAll({
      where,
      order: [
        ["due_date", "ASC"],
        ["installment_number", "ASC"],
      ],
    });
    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getInstallment = async (req, res) => {
  try {
    const row = await Installment.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, data: row });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createInstallment = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (payload.balance == null && payload.amount != null) {
      payload.balance = payload.amount;
    }
    const row = await Installment.create(payload);
    return res.status(201).json({ success: true, data: row });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateInstallment = async (req, res) => {
  try {
    const row = await Installment.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Not found" });
    const allowed = [
      "amount",
      "due_date",
      "paid_amount",
      "balance",
      "status",
      "late_fee",
      "late_fee_paid",
      "grace_days",
      "notes",
    ];
    const patch = {};
    for (const k of allowed) {
      if (req.body[k] !== undefined) patch[k] = req.body[k];
    }
    await row.update(patch);
    return res.json({ success: true, data: row });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteInstallment = async (req, res) => {
  try {
    const row = await Installment.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Not found" });
    await row.destroy();
    return res.json({ success: true, message: "Deleted" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
