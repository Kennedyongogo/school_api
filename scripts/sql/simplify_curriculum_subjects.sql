-- Remove code, marks, credits, display_order from curriculum_subjects.
-- Replaces code-based uniqueness with name-based partial unique indexes (Postgres).

DROP INDEX IF EXISTS curriculum_subjects_curriculum_code_global_uniq;
DROP INDEX IF EXISTS curriculum_subjects_level_code_uniq;
ALTER TABLE curriculum_subjects DROP CONSTRAINT IF EXISTS curriculum_subjects_curriculum_code_uniq;

ALTER TABLE curriculum_subjects DROP COLUMN IF EXISTS code;
ALTER TABLE curriculum_subjects DROP COLUMN IF EXISTS credit_hours;
ALTER TABLE curriculum_subjects DROP COLUMN IF EXISTS passing_mark;
ALTER TABLE curriculum_subjects DROP COLUMN IF EXISTS full_mark;
ALTER TABLE curriculum_subjects DROP COLUMN IF EXISTS display_order;

CREATE UNIQUE INDEX IF NOT EXISTS curriculum_subjects_curriculum_name_global_uniq
  ON curriculum_subjects (curriculum_id, name)
  WHERE curriculum_class_level_id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS curriculum_subjects_level_name_uniq
  ON curriculum_subjects (curriculum_class_level_id, name)
  WHERE curriculum_class_level_id IS NOT NULL;
