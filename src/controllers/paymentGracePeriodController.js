const { PaymentGracePeriod } = require("../models");

exports.listPaymentGracePeriods = async (req, res) => {
  try {
    const where = {};
    if (req.query.academic_year_id) where.academic_year_id = req.query.academic_year_id;
    if (req.query.term_id) where.term_id = req.query.term_id;
    if (req.query.is_active !== undefined) where.is_active = req.query.is_active === "true";

    const rows = await PaymentGracePeriod.findAll({
      where,
      order: [["created_at", "DESC"]],
    });
    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPaymentGracePeriod = async (req, res) => {
  try {
    const row = await PaymentGracePeriod.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, data: row });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createPaymentGracePeriod = async (req, res) => {
  try {
    const allowed = ["academic_year_id", "term_id", "grace_days", "warning_days", "reconnection_fee", "is_active"];
    const payload = {};
    for (const k of allowed) {
      if (req.body[k] !== undefined) payload[k] = req.body[k];
    }
    const row = await PaymentGracePeriod.create(payload);
    return res.status(201).json({ success: true, data: row });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.updatePaymentGracePeriod = async (req, res) => {
  try {
    const row = await PaymentGracePeriod.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Not found" });
    const allowed = ["grace_days", "warning_days", "reconnection_fee", "is_active"];
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

exports.deletePaymentGracePeriod = async (req, res) => {
  try {
    const row = await PaymentGracePeriod.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Not found" });
    await row.destroy();
    return res.json({ success: true, message: "Deleted" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
