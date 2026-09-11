-- =============================================================================
-- 003_drop_addon_columns.sql  (rewritten to be safe against live schema)
-- Reverses the temporary columns added by 002. All guarded with IF EXISTS.
-- =============================================================================

-- ── employer_profiles: remove columns added by 002 ───────────────────────────
-- NOTE: approval_status, hq_location, about, website_url, hr_contact_*
-- are KEPT here (not dropped) because migration 004 re-adds them permanently.
-- Only drop columns that are truly not wanted in the final schema.
-- (Nothing to drop from employer_profiles — 004 owns those columns.)

-- ── jobs: remove temporary columns ───────────────────────────────────────────
ALTER TABLE public.jobs
  DROP COLUMN IF EXISTS ctc_min,
  DROP COLUMN IF EXISTS ctc_max,
  DROP COLUMN IF EXISTS openings,
  DROP COLUMN IF EXISTS selection_rounds;

-- ── placement_drives: remove temporary columns ────────────────────────────────
ALTER TABLE public.placement_drives
  DROP COLUMN IF EXISTS rounds_schedule,
  DROP COLUMN IF EXISTS max_students;

-- ── applications: remove temporary columns ────────────────────────────────────
ALTER TABLE public.applications
  DROP COLUMN IF EXISTS current_round,
  DROP COLUMN IF EXISTS rejection_reason;

-- ── offers: remove temporary columns ─────────────────────────────────────────
ALTER TABLE public.offers
  DROP COLUMN IF EXISTS role_confirmed,
  DROP COLUMN IF EXISTS bond_clause,
  DROP COLUMN IF EXISTS offer_letter_path;

-- ── notifications: remove temporary column ────────────────────────────────────
ALTER TABLE public.notifications
  DROP COLUMN IF EXISTS link;

-- ── audit_logs: remove temporary columns ─────────────────────────────────────
ALTER TABLE public.audit_logs
  DROP COLUMN IF EXISTS from_status,
  DROP COLUMN IF EXISTS to_status,
  DROP COLUMN IF EXISTS notes;

-- ── Drop stub tables created by 001 ──────────────────────────────────────────
-- drive_jobs_new was the junction table for the stub schema; drop it first.
DROP TABLE IF EXISTS public.drive_jobs_new    CASCADE;
DROP TABLE IF EXISTS public.job_postings      CASCADE;
DROP TABLE IF EXISTS public.drives            CASCADE;
