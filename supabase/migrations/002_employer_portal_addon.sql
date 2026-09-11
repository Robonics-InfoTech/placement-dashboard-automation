-- =============================================================================
-- 002_employer_portal_addon.sql  (rewritten to be safe against live schema)
-- Only ADDs columns that don't exist yet. All statements use IF NOT EXISTS.
-- =============================================================================

-- ── employer_profiles: add employer-portal columns ───────────────────────────
ALTER TABLE public.employer_profiles
  ADD COLUMN IF NOT EXISTS approval_status   TEXT NOT NULL DEFAULT 'pending'
                             CHECK (approval_status IN ('pending','approved','rejected')),
  ADD COLUMN IF NOT EXISTS hq_location       TEXT,
  ADD COLUMN IF NOT EXISTS about             TEXT,
  ADD COLUMN IF NOT EXISTS website_url       TEXT,
  ADD COLUMN IF NOT EXISTS hr_contact_name   TEXT,
  ADD COLUMN IF NOT EXISTS hr_contact_email  TEXT,
  ADD COLUMN IF NOT EXISTS hr_contact_phone  TEXT;

-- ── jobs: add missing columns ────────────────────────────────────────────────
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS ctc_min           NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS ctc_max           NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS openings          INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS selection_rounds  JSONB   NOT NULL DEFAULT '[]';

-- ── placement_drives: add missing columns ────────────────────────────────────
ALTER TABLE public.placement_drives
  ADD COLUMN IF NOT EXISTS rounds_schedule   JSONB   NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS max_students      INTEGER;

-- ── applications: add round-tracking columns ─────────────────────────────────
ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS current_round     INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rejection_reason  TEXT;

-- ── offers: add offer-letter and role columns ─────────────────────────────────
ALTER TABLE public.offers
  ADD COLUMN IF NOT EXISTS role_confirmed    TEXT,
  ADD COLUMN IF NOT EXISTS bond_clause       TEXT,
  ADD COLUMN IF NOT EXISTS offer_letter_path TEXT;

-- ── notifications: add deep-link column ──────────────────────────────────────
ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS link              TEXT;

-- ── audit_logs: add status-tracking columns ───────────────────────────────────
ALTER TABLE public.audit_logs
  ADD COLUMN IF NOT EXISTS from_status       TEXT,
  ADD COLUMN IF NOT EXISTS to_status         TEXT,
  ADD COLUMN IF NOT EXISTS notes             TEXT;

-- ── Storage bucket (idempotent) ───────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'offer-letters',
  'offer-letters',
  false,
  10485760,
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- RLS policies are already created idempotently in 001 — skip here.
