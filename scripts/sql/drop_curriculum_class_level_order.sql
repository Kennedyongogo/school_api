-- Removes sort-order column from curriculum_classes (ordering is by name only via API).
ALTER TABLE curriculum_classes DROP COLUMN IF EXISTS level_order;
