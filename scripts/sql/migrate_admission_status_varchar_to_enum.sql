-- Run only if status was previously added as VARCHAR(50)
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
  ALTER COLUMN status DROP DEFAULT;

ALTER TABLE admission_applications
  ALTER COLUMN status TYPE enum_admission_applications_status
  USING (
    CASE TRIM(status::text)
      WHEN 'under_review' THEN 'under_review'::enum_admission_applications_status
      WHEN 'documents_verified' THEN 'documents_verified'::enum_admission_applications_status
      WHEN 'interview_scheduled' THEN 'interview_scheduled'::enum_admission_applications_status
      WHEN 'accepted' THEN 'accepted'::enum_admission_applications_status
      WHEN 'rejected' THEN 'rejected'::enum_admission_applications_status
      WHEN 'waitlisted' THEN 'waitlisted'::enum_admission_applications_status
      ELSE 'pending'::enum_admission_applications_status
    END
  );

ALTER TABLE admission_applications
  ALTER COLUMN status SET DEFAULT 'pending'::enum_admission_applications_status;

ALTER TABLE admission_applications
  ALTER COLUMN status SET NOT NULL;
