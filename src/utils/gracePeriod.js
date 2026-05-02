const moment = require("moment");
const { Op } = require("sequelize");
const { Installment, PaymentGracePeriod } = require("../models");

async function getRemainingGraceDays(studentId) {
  const todayStr = moment().format("YYYY-MM-DD");
  const row = await Installment.findOne({
    where: {
      student_id: studentId,
      balance: { [Op.gt]: 0 },
      due_date: { [Op.lt]: todayStr },
      status: { [Op.notIn]: ["cancelled", "paid"] },
    },
    order: [["due_date", "ASC"]],
  });

  if (!row) return null;

  const gp = await PaymentGracePeriod.findOne({
    where: {
      academic_year_id: row.academic_year_id,
      term_id: row.term_id,
      is_active: true,
    },
  });
  const graceDays = gp ? gp.grace_days : row.grace_days || 14;
  const graceEnd = moment(row.due_date).add(graceDays, "days").startOf("day");
  const left = graceEnd.diff(moment().startOf("day"), "days");
  return Math.max(0, left);
}

module.exports = { getRemainingGraceDays };
