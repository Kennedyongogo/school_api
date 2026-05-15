-- PostgreSQL ENUM (name matches Sequelize: enum_admission_applications_status)
DO $$ BEGIN
  CREATE TYPE enum_admission_applications_status AS ENUM (
    'pending',
    'under_review',
    'documents_verified',
    'interview_scheduled',
    'accepted',
    'rejected',
    'waitlisted'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE admission_applications
  ADD COLUMN IF NOT EXISTS status enum_admission_applications_status NOT NULL DEFAULT 'pending';

UPDATE admission_applications
SET status = 'pending'::enum_admission_applications_status
WHERE status IS NULL;
