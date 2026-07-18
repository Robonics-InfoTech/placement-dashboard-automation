-- =============================================================================
-- 003_drop_addon_columns.sql
-- Removes columns added by 002_employer_portal_addon.sql that do NOT exist
-- in the real production schema. After this migration the DB matches the
-- schema snapshot provided on 2026-07-18.
--
-- Safe to run: every statement is guarded with IF EXISTS.
-- Run in: Supabase Dashboard → SQL Editor → Run
-- =============================================================================

-- ── employer_profiles: remove columns that don't exist in the real schema ─────
ALTER TABLE public.employer_profiles
  DROP COLUMN IF EXISTS approval_status,
  DROP COLUMN IF EXISTS college_id,
  DROP COLUMN IF EXISTS hq_location,
  DROP COLUMN IF EXISTS about,
  DROP COLUMN IF EXISTS website_url,
  DROP COLUMN IF EXISTS hr_contact_name,
  DROP COLUMN IF EXISTS hr_contact_email,
  DROP COLUMN IF EXISTS hr_contact_phone;

-- ── jobs: remove columns that don't exist in the real schema ─────────────────
ALTER TABLE public.jobs
  DROP COLUMN IF EXISTS ctc_min,
  DROP COLUMN IF EXISTS ctc_max,
  DROP COLUMN IF EXISTS openings,
  DROP COLUMN IF EXISTS selection_rounds,
  DROP COLUMN IF EXISTS college_id;

-- ── placement_drives: remove columns that don't exist in the real schema ──────
ALTER TABLE public.placement_drives
  DROP COLUMN IF EXISTS rounds_schedule,
  DROP COLUMN IF EXISTS max_students,
  DROP COLUMN IF EXISTS college_id;

-- ── applications: remove columns that don't exist in the real schema ──────────
-- (use the existing `remarks` column for rejection notes instead)
ALTER TABLE public.applications
  DROP COLUMN IF EXISTS current_round,
  DROP COLUMN IF EXISTS rejection_reason;

-- ── offers: remove columns that don't exist in the real schema ───────────────
-- Real schema has: offer_type, package_lpa, offer_status, offered_at, remarks
ALTER TABLE public.offers
  DROP COLUMN IF EXISTS role_confirmed,
  DROP COLUMN IF EXISTS location,
  DROP COLUMN IF EXISTS bond_clause,
  DROP COLUMN IF EXISTS offer_letter_path;

-- ── notifications: remove columns that don't exist in the real schema ─────────
ALTER TABLE public.notifications
  DROP COLUMN IF EXISTS link;

-- ── audit_logs: remove columns that don't exist in the real schema ────────────
-- Real schema uses old_data JSONB / new_data JSONB instead
ALTER TABLE public.audit_logs
  DROP COLUMN IF EXISTS from_status,
  DROP COLUMN IF EXISTS to_status,
  DROP COLUMN IF EXISTS notes;

-- ── Drop the old employer-portal tables created by 001_employer_portal.sql ────
-- These shadow real tables and are safe to drop (they are empty stubs).
-- The real tables (jobs, placement_drives, drive_jobs, applications, offers,
-- audit_logs, notifications) already exist in the production schema.
DROP TABLE IF EXISTS public.drive_jobs_old    CASCADE;
DROP TABLE IF EXISTS public.job_postings      CASCADE;
DROP TABLE IF EXISTS public.drives            CASCADE;
