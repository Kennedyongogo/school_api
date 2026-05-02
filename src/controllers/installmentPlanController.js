const { InstallmentPlan } = require("../models");

exports.listInstallmentPlans = async (req, res) => {
  try {
    const rows = await InstallmentPlan.findAll({ order: [["name", "ASC"]] });
    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getInstallmentPlan = async (req, res) => {
  try {
    const row = await InstallmentPlan.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, data: row });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createInstallmentPlan = async (req, res) => {
  try {
    const row = await InstallmentPlan.create(req.body);
    return res.status(201).json({ success: true, data: row });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateInstallmentPlan = async (req, res) => {
  try {
    const row = await InstallmentPlan.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Not found" });
    const allowed = ["name", "total_installments", "installment_interval_days", "is_default"];
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

exports.deleteInstallmentPlan = async (req, res) => {
  try {
    const row = await InstallmentPlan.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Not found" });
    await row.destroy();
    return res.json({ success: true, message: "Deleted" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
