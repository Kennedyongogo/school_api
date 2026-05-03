-- Migrates self-referential curriculum_subject_topics into:
--   - topics: rows with no parent (or all rows after children moved)
--   - curriculum_subject_subtopics: former child rows linked to parent topic id
-- Then drops parent_topic_id, code, and renames title -> name if needed.
-- Run once against your Postgres DB. Review data before DELETE.

BEGIN;

CREATE TABLE IF NOT EXISTS curriculum_subject_subtopics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curriculum_subject_topic_id UUID NOT NULL REFERENCES curriculum_subject_topics(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS curriculum_subject_subtopics_topic_idx
  ON curriculum_subject_subtopics(curriculum_subject_topic_id);

-- Move old nested "topics" (had parent_topic_id) into subtopics table
INSERT INTO curriculum_subject_subtopics (id, curriculum_subject_topic_id, name, description, order_index, created_at, updated_at)
SELECT gen_random_uuid(),
       c.parent_topic_id,
       COALESCE(NULLIF(trim(c.title::text), ''), 'Untitled'),
       c.description,
       COALESCE(c.order_index, 0),
       COALESCE(c.created_at, NOW()),
       COALESCE(c.updated_at, NOW())
FROM curriculum_subject_topics c
WHERE c.parent_topic_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM curriculum_subject_topics p WHERE p.id = c.parent_topic_id);

DELETE FROM curriculum_subject_topics WHERE parent_topic_id IS NOT NULL;

ALTER TABLE curriculum_subject_topics DROP CONSTRAINT IF EXISTS curriculum_subject_topics_parent_topic_id_fkey;
DROP INDEX IF EXISTS curriculum_subject_topics_parent_idx;

ALTER TABLE curriculum_subject_topics DROP COLUMN IF EXISTS parent_topic_id;
ALTER TABLE curriculum_subject_topics DROP COLUMN IF EXISTS code;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'curriculum_subject_topics' AND column_name = 'title'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'curriculum_subject_topics' AND column_name = 'name'
  ) THEN
    ALTER TABLE curriculum_subject_topics RENAME COLUMN title TO name;
  END IF;
END $$;

COMMIT;
