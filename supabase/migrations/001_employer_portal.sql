-- =============================================================================
-- 001_employer_portal.sql  (rewritten to be safe against live schema)
-- Creates NEW tables only; all indexes guarded; policies idempotent.
-- Tables that already exist in production (applications, audit_logs, offers,
-- notifications, drive_jobs) are skipped via CREATE TABLE IF NOT EXISTS.
-- =============================================================================

-- 1. job_postings ─────────────────────────────────────────────────────────────
-- New table — does not exist in the live schema.
CREATE TABLE IF NOT EXISTS public.job_postings (
  id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id         UUID          NOT NULL REFERENCES public.employer_profiles(id) ON DELETE CASCADE,
  college_id          UUID          NOT NULL,
  title               TEXT          NOT NULL,
  description         TEXT          NOT NULL,
  job_type            TEXT          NOT NULL CHECK (job_type IN ('full_time','internship','ppo')),
  location            TEXT          NOT NULL,
  ctc_min             NUMERIC(10,2),
  ctc_max             NUMERIC(10,2),
  openings            INTEGER       NOT NULL DEFAULT 1,
  min_cgpa            NUMERIC(4,2)  NOT NULL DEFAULT 0,
  allowed_branches    TEXT[]        NOT NULL DEFAULT '{}',
  max_backlogs        INTEGER       NOT NULL DEFAULT 0,
  batch_years         INTEGER[]     NOT NULL DEFAULT '{}',
  selection_rounds    JSONB         NOT NULL DEFAULT '[]',
  deadline            DATE          NOT NULL,
  status              TEXT          NOT NULL DEFAULT 'pending_approval'
                        CHECK (status IN ('pending_approval','active','closed','rejected')),
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_job_postings_employer ON public.job_postings(employer_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_college  ON public.job_postings(college_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_status   ON public.job_postings(status);


-- 2. drives ───────────────────────────────────────────────────────────────────
-- New table — does not exist in the live schema (live uses placement_drives).
CREATE TABLE IF NOT EXISTS public.drives (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id     UUID        NOT NULL REFERENCES public.employer_profiles(id) ON DELETE CASCADE,
  college_id      UUID        NOT NULL,
  name            TEXT        NOT NULL,
  drive_date      TIMESTAMPTZ NOT NULL,
  venue_type      TEXT        NOT NULL CHECK (venue_type IN ('physical','virtual')),
  venue           TEXT        NOT NULL,
  rounds_schedule JSONB       NOT NULL DEFAULT '[]',
  max_students    INTEGER,
  status          TEXT        NOT NULL DEFAULT 'scheduled'
                    CHECK (status IN ('scheduled','in_progress','completed','cancelled')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_drives_employer ON public.drives(employer_id);
CREATE INDEX IF NOT EXISTS idx_drives_college  ON public.drives(college_id);
CREATE INDEX IF NOT EXISTS idx_drives_date     ON public.drives(drive_date);


-- 3. drive_jobs_new (junction for job_postings ↔ drives) ──────────────────────
-- Named drive_jobs_new to avoid collision with the live drive_jobs table which
-- links public.placement_drives ↔ public.jobs with a different schema.
CREATE TABLE IF NOT EXISTS public.drive_jobs_new (
  drive_id UUID NOT NULL REFERENCES public.drives(id)        ON DELETE CASCADE,
  job_id   UUID NOT NULL REFERENCES public.job_postings(id)  ON DELETE CASCADE,
  PRIMARY KEY (drive_id, job_id)
);


-- 4. applications indexes ─────────────────────────────────────────────────────
-- Live table uses application_status (not status). Guard accordingly.
DO $$
BEGIN
  -- Index on application_status (live column name)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'applications'
      AND column_name = 'application_status'
  ) THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public'
        AND tablename = 'applications' AND indexname = 'idx_applications_status') THEN
      CREATE INDEX idx_applications_status ON public.applications(application_status);
    END IF;
  END IF;

  -- Index on student_id
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public'
      AND tablename = 'applications' AND indexname = 'idx_applications_student') THEN
    CREATE INDEX idx_applications_student ON public.applications(student_id);
  END IF;

  -- Index on job_id
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public'
      AND tablename = 'applications' AND indexname = 'idx_applications_job') THEN
    CREATE INDEX idx_applications_job ON public.applications(job_id);
  END IF;
END $$;


-- 5. audit_logs indexes ───────────────────────────────────────────────────────
-- Live table uses entity_name + user_id, NOT entity_type + acting_user_id.
-- Guard against both column names.
DO $$
BEGIN
  -- Live schema: entity_name
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'audit_logs'
      AND column_name = 'entity_name'
  ) THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public'
        AND tablename = 'audit_logs' AND indexname = 'idx_audit_entity') THEN
      CREATE INDEX idx_audit_entity ON public.audit_logs(entity_name, entity_id);
    END IF;
  -- Migration-created schema: entity_type
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'audit_logs'
      AND column_name = 'entity_type'
  ) THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public'
        AND tablename = 'audit_logs' AND indexname = 'idx_audit_entity') THEN
      CREATE INDEX idx_audit_entity ON public.audit_logs(entity_type, entity_id);
    END IF;
  END IF;

  -- actor index: live uses user_id, migration used acting_user_id
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'audit_logs'
      AND column_name = 'user_id'
  ) THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public'
        AND tablename = 'audit_logs' AND indexname = 'idx_audit_actor') THEN
      CREATE INDEX idx_audit_actor ON public.audit_logs(user_id);
    END IF;
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'audit_logs'
      AND column_name = 'acting_user_id'
  ) THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public'
        AND tablename = 'audit_logs' AND indexname = 'idx_audit_actor') THEN
      CREATE INDEX idx_audit_actor ON public.audit_logs(acting_user_id);
    END IF;
  END IF;
END $$;


-- 6. offers indexes ───────────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public'
      AND tablename = 'offers' AND indexname = 'idx_offers_employer') THEN
    CREATE INDEX idx_offers_employer ON public.offers(employer_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public'
      AND tablename = 'offers' AND indexname = 'idx_offers_student') THEN
    CREATE INDEX idx_offers_student ON public.offers(student_id);
  END IF;
END $$;


-- 7. notifications index ──────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public'
      AND tablename = 'notifications' AND indexname = 'idx_notifications_user') THEN
    CREATE INDEX idx_notifications_user ON public.notifications(user_id, is_read);
  END IF;
END $$;


-- 8. Storage bucket for offer letters ─────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'offer-letters',
  'offer-letters',
  false,
  10485760,
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Upload policy — idempotent
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Employers upload offer letters'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Employers upload offer letters"
      ON storage.objects FOR INSERT TO authenticated
      WITH CHECK (
        bucket_id = 'offer-letters'
        AND (storage.foldername(name))[1] = auth.uid()::text
      )
    $policy$;
  END IF;
END $$;

-- Read policy — adapts to whether offer_letter_path column exists
DO $$
DECLARE
  v_has_path BOOLEAN;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Offer letter read access'
  ) THEN
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'offers'
        AND column_name = 'offer_letter_path'
    ) INTO v_has_path;

    IF v_has_path THEN
      EXECUTE $policy$
        CREATE POLICY "Offer letter read access"
        ON storage.objects FOR SELECT TO authenticated
        USING (
          bucket_id = 'offer-letters'
          AND (
            (storage.foldername(name))[1] = auth.uid()::text
            OR EXISTS (
              SELECT 1 FROM public.offers o
              WHERE o.offer_letter_path = name
                AND o.student_id IN (
                  SELECT id FROM public.student_profiles WHERE user_id = auth.uid()
                )
            )
          )
        )
      $policy$;
    ELSE
      -- Live schema: offers has no offer_letter_path; grant folder-owner access only
      EXECUTE $policy$
        CREATE POLICY "Offer letter read access"
        ON storage.objects FOR SELECT TO authenticated
        USING (
          bucket_id = 'offer-letters'
          AND (storage.foldername(name))[1] = auth.uid()::text
        )
      $policy$;
    END IF;
  END IF;
END $$;
