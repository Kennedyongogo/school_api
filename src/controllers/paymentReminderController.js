const { PaymentReminder } = require("../models");

exports.listPaymentReminders = async (req, res) => {
  try {
    const where = {};
    if (req.query.installment_id) where.installment_id = req.query.installment_id;
    if (req.query.parent_id) where.parent_id = req.query.parent_id;

    const rows = await PaymentReminder.findAll({
      where,
      order: [["sent_at", "DESC"]],
      limit: Math.min(Number(req.query.limit) || 200, 500),
    });
    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPaymentReminder = async (req, res) => {
  try {
    const row = await PaymentReminder.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, data: row });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createPaymentReminder = async (req, res) => {
  try {
    const row = await PaymentReminder.create(req.body);
    return res.status(201).json({ success: true, data: row });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.updatePaymentReminder = async (req, res) => {
  try {
    const row = await PaymentReminder.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Not found" });
    const allowed = ["reminder_type", "reminder_stage", "sent_at", "opened_at", "link_clicked"];
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

exports.deletePaymentReminder = async (req, res) => {
  try {
    const row = await PaymentReminder.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Not found" });
    await row.destroy();
    return res.json({ success: true, message: "Deleted" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
