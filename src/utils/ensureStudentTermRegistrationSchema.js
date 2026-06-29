const { sequelize } = require("../config/database");

async function ensureStudentTermRegistrationSchema() {
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS student_term_registrations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      curriculum_id UUID NOT NULL REFERENCES curricula(id) ON DELETE CASCADE,
      curriculum_class_id UUID NOT NULL REFERENCES curriculum_classes(id) ON DELETE CASCADE,
      curriculum_class_level_id UUID NOT NULL REFERENCES curriculum_class_levels(id) ON DELETE CASCADE,
      started_on DATE NOT NULL,
      term_start_date DATE,
      term_end_date DATE,
      status VARCHAR(20) NOT NULL DEFAULT 'active',
      completed_on DATE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT student_term_registrations_status_chk
        CHECK (status IN ('active', 'completed', 'cancelled'))
    )
  `);

  await sequelize.query(`
    CREATE INDEX IF NOT EXISTS student_term_registrations_student_id_idx
      ON student_term_registrations(student_id)
  `);
  await sequelize.query(`
    CREATE INDEX IF NOT EXISTS student_term_registrations_level_id_idx
      ON student_term_registrations(curriculum_class_level_id)
  `);
  await sequelize.query(`
    CREATE INDEX IF NOT EXISTS student_term_registrations_student_status_idx
      ON student_term_registrations(student_id, status)
  `);
}

module.exports = { ensureStudentTermRegistrationSchema };
