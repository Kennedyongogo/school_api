const { sequelize } = require("../config/database");

async function ensureFeeBillingSchema() {
  const q = (sql) => sequelize.query(sql);

  const [studentCols] = await sequelize.query(`
    SELECT column_name FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'students'
  `);
  const studentNames = new Set((studentCols || []).map((r) => r.column_name));
  if (studentNames.size > 0 && !studentNames.has("curriculum_class_level_id")) {
    await q(`
      ALTER TABLE students ADD COLUMN curriculum_class_level_id UUID
      REFERENCES curriculum_class_levels(id) ON DELETE SET NULL
    `);
  }

  const [examCols] = await sequelize.query(`
    SELECT column_name FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'exams'
  `);
  const examNames = new Set((examCols || []).map((r) => r.column_name));
  if (examNames.size > 0) {
    if (examNames.has("exam_fee_access_mode")) {
      await q(`ALTER TABLE exams DROP COLUMN IF EXISTS exam_fee_access_mode`);
    }
    if (examNames.has("exam_fee_minimum_amount")) {
      await q(`ALTER TABLE exams DROP COLUMN IF EXISTS exam_fee_minimum_amount`);
    }
    if (examNames.has("exam_fee_minimum_basis")) {
      await q(`ALTER TABLE exams DROP COLUMN IF EXISTS exam_fee_minimum_basis`);
    }
  }

  await q(`
    CREATE TABLE IF NOT EXISTS fee_invoices (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      invoice_number VARCHAR(40) NOT NULL UNIQUE,
      parent_id UUID REFERENCES parents(id) ON DELETE SET NULL,
      student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      fee_structure_id UUID REFERENCES fee_structures(id) ON DELETE SET NULL,
      curriculum_class_level_id UUID REFERENCES curriculum_class_levels(id) ON DELETE SET NULL,
      fee_snapshot_json JSONB NOT NULL DEFAULT '{}',
      amount_due DECIMAL(12, 2) NOT NULL DEFAULT 0,
      amount_paid DECIMAL(12, 2) NOT NULL DEFAULT 0,
      balance DECIMAL(12, 2) NOT NULL DEFAULT 0,
      status VARCHAR(20) NOT NULL DEFAULT 'draft',
      sent_at TIMESTAMPTZ,
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await q(`CREATE INDEX IF NOT EXISTS fee_invoices_student_id_idx ON fee_invoices(student_id)`);
  await q(`CREATE INDEX IF NOT EXISTS fee_invoices_parent_id_idx ON fee_invoices(parent_id)`);

  await q(`
    CREATE TABLE IF NOT EXISTS fee_payments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      fee_invoice_id UUID NOT NULL REFERENCES fee_invoices(id) ON DELETE CASCADE,
      parent_id UUID REFERENCES parents(id) ON DELETE SET NULL,
      student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      curriculum_class_level_id UUID REFERENCES curriculum_class_levels(id) ON DELETE SET NULL,
      amount DECIMAL(12, 2) NOT NULL,
      payment_method VARCHAR(24) NOT NULL DEFAULT 'manual',
      reference VARCHAR(120),
      notes TEXT,
      recorded_by UUID REFERENCES users(id) ON DELETE SET NULL,
      paid_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await q(`CREATE INDEX IF NOT EXISTS fee_payments_invoice_id_idx ON fee_payments(fee_invoice_id)`);
  await q(`CREATE INDEX IF NOT EXISTS fee_payments_student_id_idx ON fee_payments(student_id)`);

  for (const table of ["fee_invoices", "fee_payments"]) {
    const [cols] = await sequelize.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = '${table}'
    `);
    const names = new Set((cols || []).map((r) => r.column_name));
    if (names.size > 0 && !names.has("curriculum_class_level_id")) {
      await q(`
        ALTER TABLE ${table} ADD COLUMN curriculum_class_level_id UUID
        REFERENCES curriculum_class_levels(id) ON DELETE SET NULL
      `);
    }
  }
}

module.exports = { ensureFeeBillingSchema };
