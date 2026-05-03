-- One-time: add Student.account_status columns to match Sequelize model (students table).
-- Run via: npm run db:add-student-account-columns (from school_api)
-- Or: psql "$DATABASE_URL" -f scripts/sql/add_student_account_columns.sql

DO $$ BEGIN
  CREATE TYPE enum_students_account_status AS ENUM (
    'active',
    'pending_payment',
    'suspended',
    'deactivated',
    'expelled',
    'graduated',
    'withdrawn'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE students ADD COLUMN IF NOT EXISTS account_status enum_students_account_status NOT NULL DEFAULT 'active'::enum_students_account_status;
ALTER TABLE students ADD COLUMN IF NOT EXISTS account_status_updated_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE students ADD COLUMN IF NOT EXISTS last_deactivation_reason TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS reactivation_required BOOLEAN NOT NULL DEFAULT false;
