-- Scope curriculum subjects to a term (CurriculumClassLevel).
-- Postgres: subject name uniqueness — global per curriculum when no term, per term when a term is set.

ALTER TABLE curriculum_subjects
  ADD COLUMN IF NOT EXISTS curriculum_class_level_id UUID NULL
  REFERENCES curriculum_class_levels(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS curriculum_subjects_level_idx ON curriculum_subjects (curriculum_class_level_id);

-- Legacy code-based uniques removed by simplify_curriculum_subjects.sql (name-based uniques).
ALTER TABLE curriculum_subjects DROP CONSTRAINT IF EXISTS curriculum_subjects_curriculum_code_uniq;
DROP INDEX IF EXISTS curriculum_subjects_curriculum_code_global_uniq;
DROP INDEX IF EXISTS curriculum_subjects_level_code_uniq;

CREATE UNIQUE INDEX IF NOT EXISTS curriculum_subjects_curriculum_name_global_uniq
  ON curriculum_subjects (curriculum_id, name)
  WHERE curriculum_class_level_id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS curriculum_subjects_level_name_uniq
  ON curriculum_subjects (curriculum_class_level_id, name)
  WHERE curriculum_class_level_id IS NOT NULL;
