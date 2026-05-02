const { InstallmentPayment, Installment } = require("../models");

/**
 * Recalculate paid_amount (principal), late_fee_paid, balance, status from completed payments.
 */
async function refreshInstallmentFromPayments(installmentId) {
  const installment = await Installment.findByPk(installmentId);
  if (!installment) return null;

  const payments = await InstallmentPayment.findAll({
    where: { installment_id: installmentId, status: "completed" },
  });

  let principalSum = 0;
  let lateSum = 0;
  for (const p of payments) {
    const amt = Number(p.amount);
    const late = Number(p.late_fee_included || 0);
    lateSum += late;
    principalSum += amt - late;
  }

  const amountDue = Number(installment.amount);
  const lateDue = Number(installment.late_fee || 0);
  const outPrincipal = Math.max(0, amountDue - principalSum);
  const outLate = Math.max(0, lateDue - lateSum);
  const balance = Number((outPrincipal + outLate).toFixed(2));

  let status = "pending";
  if (balance <= 0.005) status = "paid";
  else if (principalSum > 0 || lateSum > 0) status = "partial";

  await installment.update({
    paid_amount: Number(principalSum.toFixed(2)),
    late_fee_paid: Number(lateSum.toFixed(2)),
    balance,
    status,
  });

  return installment.reload();
}

module.exports = { refreshInstallmentFromPayments };
