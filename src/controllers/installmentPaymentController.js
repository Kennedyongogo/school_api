const { InstallmentPayment, Installment } = require("../models");
const { refreshInstallmentFromPayments } = require("../utils/installmentPaymentApply");
const { tryAutoReactivateStudent } = require("../services/reactivationService");
const { reconcileStudentPendingPayment } = require("../services/deactivationService");

async function afterInstallmentPaymentsUpdated(installmentId) {
  const installment = await Installment.findByPk(installmentId);
  if (!installment) return;
  await reconcileStudentPendingPayment(installment.student_id);
  await tryAutoReactivateStudent(installment.student_id);
}

exports.listInstallmentPayments = async (req, res) => {
  try {
    const where = {};
    if (req.query.installment_id) where.installment_id = req.query.installment_id;
    if (req.query.student_id) where.student_id = req.query.student_id;
    if (req.query.parent_id) where.parent_id = req.query.parent_id;
    if (req.query.status) where.status = req.query.status;

    const rows = await InstallmentPayment.findAll({
      where,
      order: [["payment_date", "DESC"]],
      limit: Math.min(Number(req.query.limit) || 200, 500),
    });
    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getInstallmentPayment = async (req, res) => {
  try {
    const row = await InstallmentPayment.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, data: row });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createInstallmentPayment = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (!payload.payment_date) {
      payload.payment_date = new Date().toISOString().slice(0, 10);
    }
    if (req.user?.id && payload.recorded_by == null) {
      payload.recorded_by = req.user.id;
    }

    const row = await InstallmentPayment.create(payload);

    if (row.status === "completed") {
      await refreshInstallmentFromPayments(row.installment_id);
    }

    return res.status(201).json({ success: true, data: row });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateInstallmentPayment = async (req, res) => {
  try {
    const row = await InstallmentPayment.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Not found" });

    const installmentId = row.installment_id;

    const allowed = [
      "amount",
      "late_fee_included",
      "payment_method",
      "transaction_id",
      "payment_date",
      "receipt_number",
      "status",
      "payment_proof_url",
      "notes",
      "recorded_by",
    ];
    const patch = {};
    for (const k of allowed) {
      if (req.body[k] !== undefined) patch[k] = req.body[k];
    }
    await row.update(patch);

    await refreshInstallmentFromPayments(installmentId);
    await afterInstallmentPaymentsUpdated(installmentId);

    return res.json({ success: true, data: row });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteInstallmentPayment = async (req, res) => {
  try {
    const row = await InstallmentPayment.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Not found" });
    const installmentId = row.installment_id;
    await row.destroy();
    await refreshInstallmentFromPayments(installmentId);
    await afterInstallmentPaymentsUpdated(installmentId);
    return res.json({ success: true, message: "Deleted" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
