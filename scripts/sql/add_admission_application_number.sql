ALTER TABLE admission_applications ADD COLUMN IF NOT EXISTS application_number VARCHAR(20);
CREATE UNIQUE INDEX IF NOT EXISTS admission_applications_application_number_key
  ON admission_applications (application_number)
  WHERE application_number IS NOT NULL;
