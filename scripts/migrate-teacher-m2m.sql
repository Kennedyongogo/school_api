-- Postgres: teacher profile refactor (run after app creates new junction tables via sync, or create tables first).
-- Drops removed columns from `teachers`. Adjust if your DB never had these columns.

ALTER TABLE teachers DROP COLUMN IF EXISTS department;
-- Keep is_class_teacher / class_teacher_curriculum_class_id: optional homeroom (see migrations/add_teacher_homeroom_curriculum_class.sql).
ALTER TABLE teachers DROP COLUMN IF EXISTS class_teacher_of;
ALTER TABLE teachers DROP COLUMN IF EXISTS awards;
