-- Align existing PostgreSQL `curricula` table with the simplified model (name, description, type).
-- Backup first. Run statements one-by-one if something fails on your schema version.

ALTER TABLE curricula DROP COLUMN IF EXISTS code;
ALTER TABLE curricula DROP COLUMN IF EXISTS grading_system_summary;
ALTER TABLE curricula DROP COLUMN IF EXISTS grade_levels;
ALTER TABLE curricula DROP COLUMN IF EXISTS subjects;
ALTER TABLE curricula DROP COLUMN IF EXISTS duration_years;
ALTER TABLE curricula DROP COLUMN IF EXISTS features;
ALTER TABLE curricula DROP COLUMN IF EXISTS image_url;
ALTER TABLE curricula DROP COLUMN IF EXISTS brochure_url;
ALTER TABLE curricula DROP COLUMN IF EXISTS is_active;
ALTER TABLE curricula DROP COLUMN IF EXISTS display_order;

-- If `type` is still a Postgres ENUM, cast to text then widen:
ALTER TABLE curricula ALTER COLUMN type DROP DEFAULT;
ALTER TABLE curricula ALTER COLUMN type TYPE VARCHAR(120) USING (trim(type::text));
