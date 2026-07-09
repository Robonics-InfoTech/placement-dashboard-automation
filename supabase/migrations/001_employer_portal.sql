-- =============================================================================
-- 001_employer_portal.sql
-- Additive migration — creates new tables for the employer portal.
-- Safe to run: no existing tables or data are dropped/modified.
-- Run in: Supabase Dashboard → SQL Editor → Run
-- =============================================================================


-- 1. job_postings ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS job_postings (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id         UUID        NOT NULL REFERENCES employer_profiles(id) ON DELETE CASCADE,
  college_id          UUID        NOT NULL,
  title               TEXT        NOT NULL,
  description         TEXT        NOT NULL,
  job_type            TEXT        NOT NULL CHECK (job_type IN ('full_time','internship','ppo')),
  location            TEXT        NOT NULL,
  ctc_min             NUMERIC(10,2),
  ctc_max             NUMERIC(10,2),
  openings            INTEGER     NOT NULL DEFAULT 1,
  min_cgpa            NUMERIC(4,2) NOT NULL DEFAULT 0,
  allowed_branches    TEXT[]      NOT NULL DEFAULT '{}',
  max_backlogs        INTEGER     NOT NULL DEFAULT 0,
  batch_years         INTEGER[]   NOT NULL DEFAULT '{}',
  selection_rounds    JSONB       NOT NULL DEFAULT '[]',
  deadline            DATE        NOT NULL,
  status              TEXT        NOT NULL DEFAULT 'pending_approval'
                        CHECK (status IN ('pending_approval','active','closed','rejected')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_job_postings_employer ON job_postings(employer_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_college  ON job_postings(college_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_status   ON job_postings(status);


-- 2. drives ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS drives (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id     UUID        NOT NULL REFERENCES employer_profiles(id) ON DELETE CASCADE,
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

CREATE INDEX IF NOT EXISTS idx_drives_employer ON drives(employer_id);
CREATE INDEX IF NOT EXISTS idx_drives_college  ON drives(college_id);
CREATE INDEX IF NOT EXISTS idx_drives_date     ON drives(drive_date);


-- 3. drive_jobs (junction) ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS drive_jobs (
  drive_id UUID NOT NULL REFERENCES drives(id)       ON DELETE CASCADE,
  job_id   UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
  PRIMARY KEY (drive_id, job_id)
);


-- 4. applications ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS applications (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id           UUID        NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
  student_id       UUID        NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  status           TEXT        NOT NULL DEFAULT 'applied'
                     CHECK (status IN (
                       'applied','shortlisted',
                       'round_1','round_2','round_3','round_4',
                       'offer_extended','rejected','withdrawn'
                     )),
  rejection_reason TEXT,
  current_round    INTEGER     NOT NULL DEFAULT 0,
  applied_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (job_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_applications_job     ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_student ON applications(student_id);
CREATE INDEX IF NOT EXISTS idx_applications_status  ON applications(status);


-- 5. audit_logs ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type     TEXT        NOT NULL,
  entity_id       UUID        NOT NULL,
  action          TEXT        NOT NULL,
  acting_user_id  UUID        NOT NULL,
  from_status     TEXT,
  to_status       TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_actor  ON audit_logs(acting_user_id);


-- 6. offers ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS offers (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id    UUID        NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  employer_id       UUID        NOT NULL REFERENCES employer_profiles(id),
  student_id        UUID        NOT NULL REFERENCES student_profiles(id),
  role_confirmed    TEXT        NOT NULL,
  ctc               NUMERIC(10,2) NOT NULL,
  joining_date      DATE        NOT NULL,
  location          TEXT        NOT NULL,
  bond_clause       TEXT,
  offer_letter_path TEXT,
  status            TEXT        NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending','accepted','declined')),
  published_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  responded_at      TIMESTAMPTZ,
  UNIQUE (application_id)
);

CREATE INDEX IF NOT EXISTS idx_offers_employer ON offers(employer_id);
CREATE INDEX IF NOT EXISTS idx_offers_student  ON offers(student_id);


-- 7. notifications ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL,
  type       TEXT        NOT NULL,
  title      TEXT        NOT NULL,
  body       TEXT        NOT NULL,
  link       TEXT,
  is_read    BOOLEAN     NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);


-- 8. Supabase Storage bucket for offer letters ────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'offer-letters',
  'offer-letters',
  false,
  10485760,                         -- 10 MB
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;       -- safe to re-run

-- Employers can upload into their own folder (uid/ prefix)
CREATE POLICY "Employers upload offer letters"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'offer-letters'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Employers can read their own uploads; students can read offers addressed to them
CREATE POLICY "Offer letter read access"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'offer-letters'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM offers o
      WHERE o.offer_letter_path = name
        AND o.student_id IN (
          SELECT id FROM student_profiles WHERE user_id = auth.uid()
        )
    )
  )
);
