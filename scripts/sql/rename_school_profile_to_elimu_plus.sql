-- Run once if school_profiles still uses the legacy name.
UPDATE school_profiles
SET
  name = 'Elimu Plus',
  short_name = COALESCE(NULLIF(TRIM(short_name), ''), 'EP'),
  updated_at = NOW()
WHERE name ILIKE '%carlvyne%' OR name ILIKE '%international school%';
