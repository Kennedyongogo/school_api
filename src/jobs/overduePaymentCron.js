const cron = require("node-cron");
const { runOverduePaymentCheck } = require("../services/deactivationService");

function registerOverduePaymentCron() {
  const expr = process.env.OVERDUE_PAYMENT_CRON || "30 2 * * *";
  cron.schedule(expr, async () => {
    try {
      await runOverduePaymentCheck();
    } catch (err) {
      console.error("[overdue-payment-cron]", err);
    }
  });
  console.log(`📅 Overdue payment job scheduled: ${expr}`);
}

module.exports = { registerOverduePaymentCron };
