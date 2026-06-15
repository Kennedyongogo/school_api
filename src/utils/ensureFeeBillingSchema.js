const { sequelize } = require("../config/database");

async function tableColumns(table) {
  const [cols] = await sequelize.query(`
    SELECT column_name FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = :table
  `, { replacements: { table } });
  return new Set((cols || []).map((r) => r.column_name));
}

async function addColumnIfMissing(table, column, ddl) {
  const names = await tableColumns(table);
  if (names.size === 0 || names.has(column)) return;
  await sequelize.query(ddl);
}

/**
 * Aligns fee billing tables with the Sequelize models.
 * The production DB may already have older fee_invoices / fee_payments tables.
 */
async function ensureFeeBillingSchema() {
  await addColumnIfMissing(
    "students",
    "curriculum_class_level_id",
    `ALTER TABLE students
       ADD COLUMN curriculum_class_level_id UUID
       REFERENCES curriculum_class_levels(id) ON DELETE SET NULL`
  );

  await addColumnIfMissing(
    "fee_invoices",
    "curriculum_id",
    `ALTER TABLE fee_invoices
       ADD COLUMN curriculum_id UUID
       REFERENCES curricula(id) ON DELETE SET NULL`
  );
  await addColumnIfMissing(
    "fee_invoices",
    "curriculum_class_id",
    `ALTER TABLE fee_invoices
       ADD COLUMN curriculum_class_id UUID
       REFERENCES curriculum_classes(id) ON DELETE SET NULL`
  );
  await addColumnIfMissing(
    "fee_invoices",
    "term_fee_amount",
    `ALTER TABLE fee_invoices ADD COLUMN term_fee_amount NUMERIC(12, 2)`
  );

  const invoiceCols = await tableColumns("fee_invoices");
  if (invoiceCols.size > 0) {
    await sequelize.query(`
      UPDATE fee_invoices fi
      SET
        curriculum_id = COALESCE(fi.curriculum_id, s.curriculum_id),
        curriculum_class_id = COALESCE(fi.curriculum_class_id, s.curriculum_class_id),
        curriculum_class_level_id = COALESCE(fi.curriculum_class_level_id, s.curriculum_class_level_id),
        term_fee_amount = COALESCE(fi.term_fee_amount, fi.amount_due)
      FROM students s
      WHERE fi.student_id = s.id
    `);
  }

  await addColumnIfMissing(
    "fee_payments",
    "applied_to_invoice",
    `ALTER TABLE fee_payments
       ADD COLUMN applied_to_invoice NUMERIC(12, 2) NOT NULL DEFAULT 0`
  );
  await addColumnIfMissing(
    "fee_payments",
    "excess_amount",
    `ALTER TABLE fee_payments
       ADD COLUMN excess_amount NUMERIC(12, 2) NOT NULL DEFAULT 0`
  );

  const paymentCols = await tableColumns("fee_payments");
  if (paymentCols.size > 0 && paymentCols.has("applied_to_invoice")) {
    await sequelize.query(`
      UPDATE fee_payments
      SET applied_to_invoice = amount
      WHERE applied_to_invoice IS NULL OR applied_to_invoice = 0
    `);
  }
}

module.exports = { ensureFeeBillingSchema };
