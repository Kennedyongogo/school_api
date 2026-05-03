-- Run once against Postgres after deploying code that removes grade_level_id from curriculum_classes.
ALTER TABLE curriculum_classes DROP COLUMN IF EXISTS grade_level_id;
