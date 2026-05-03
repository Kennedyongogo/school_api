-- Optional one-time Postgres migration (run if sync does not add columns/tables in your environment).

ALTER TABLE curriculum_classes ADD COLUMN IF NOT EXISTS period VARCHAR(120);

CREATE TABLE IF NOT EXISTS curriculum_class_levels (
  id UUID PRIMARY KEY,
  curriculum_class_id UUID NOT NULL REFERENCES curriculum_classes(id) ON DELETE CASCADE,
  name VARCHAR(120) NOT NULL,
  level_order INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT curriculum_class_levels_class_name_uniq UNIQUE (curriculum_class_id, name)
);

CREATE INDEX IF NOT EXISTS curriculum_class_levels_class_order_idx ON curriculum_class_levels (curriculum_class_id, level_order);
