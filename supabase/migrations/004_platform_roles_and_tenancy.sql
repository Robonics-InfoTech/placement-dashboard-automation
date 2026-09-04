-- =============================================================================
-- 004_platform_roles_and_tenancy.sql
-- Additive migration — adds new roles, tenancy columns, and platform tables.
-- Safe to run: every statement is guarded with IF NOT EXISTS / DO $$ checks.
-- Run in: Supabase Dashboard → SQL Editor → Run
-- =============================================================================

-- ── 1. Extend the users table for multi-tenancy ─────────────────────────────
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.colleges(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_users_tenant ON public.users(tenant_id);

-- ── 2. Add tenant_id to student_profiles ─────────────────────────────────────
ALTER TABLE public.student_profiles
  ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.colleges(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_student_profiles_tenant ON public.student_profiles(tenant_id);

-- ── 3. Add tenant_id + approval_status to employer_profiles ──────────────────
ALTER TABLE public.employer_profiles
  ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.colleges(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS approval_status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS hq_location TEXT,
  ADD COLUMN IF NOT EXISTS about TEXT,
  ADD COLUMN IF NOT EXISTS website_url TEXT,
  ADD COLUMN IF NOT EXISTS hr_contact_name TEXT,
  ADD COLUMN IF NOT EXISTS hr_contact_email TEXT,
  ADD COLUMN IF NOT EXISTS hr_contact_phone TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'employer_profiles_approval_status_check'
  ) THEN
    BEGIN
      ALTER TABLE public.employer_profiles
        ADD CONSTRAINT employer_profiles_approval_status_check
        CHECK (approval_status IN ('pending','approved','rejected'));
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_employer_profiles_tenant ON public.employer_profiles(tenant_id);

-- ── 4. Alumni profiles ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.alumni_profiles (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id         UUID        REFERENCES public.colleges(id) ON DELETE SET NULL,
  full_name         TEXT,
  phone             TEXT,
  graduation_year   INTEGER,
  branch            TEXT,
  course            TEXT,
  current_company   TEXT,
  current_role      TEXT,
  linkedin_url      TEXT,
  github_url        TEXT,
  portfolio_url     TEXT,
  resume_url        TEXT,
  photo_url         TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_alumni_profiles_user   ON public.alumni_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_alumni_profiles_tenant ON public.alumni_profiles(tenant_id);

-- ── 5. Committee members ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.committee_members (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  college_id  UUID        NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
  full_name   TEXT,
  designation TEXT,
  is_active   BOOLEAN     NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_committee_members_user    ON public.committee_members(user_id);
CREATE INDEX IF NOT EXISTS idx_committee_members_college ON public.committee_members(college_id);

-- ── 6. Platform settings (key-value per tenant) ──────────────────────────────
CREATE TABLE IF NOT EXISTS public.platform_settings (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID        REFERENCES public.colleges(id) ON DELETE CASCADE,
  key         TEXT        NOT NULL,
  value       JSONB       NOT NULL DEFAULT '{}',
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, key)
);

-- ── 7. Feedback ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.feedback (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL,
  tenant_id   UUID        REFERENCES public.colleges(id) ON DELETE SET NULL,
  category    TEXT        NOT NULL DEFAULT 'general',
  subject     TEXT        NOT NULL,
  body        TEXT        NOT NULL,
  status      TEXT        NOT NULL DEFAULT 'open'
                CHECK (status IN ('open','in_progress','resolved','closed')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_feedback_user   ON public.feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_tenant ON public.feedback(tenant_id);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON public.feedback(status);

-- ── 8. Announcements ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.announcements (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID        REFERENCES public.colleges(id) ON DELETE CASCADE,
  author_id   UUID        NOT NULL,
  title       TEXT        NOT NULL,
  body        TEXT        NOT NULL,
  priority    TEXT        NOT NULL DEFAULT 'normal'
                CHECK (priority IN ('low','normal','high','urgent')),
  target_roles TEXT[]     NOT NULL DEFAULT '{}',
  is_pinned   BOOLEAN     NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_announcements_tenant ON public.announcements(tenant_id);

-- ── 9. Email templates ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.email_templates (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID        REFERENCES public.colleges(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  subject     TEXT        NOT NULL,
  body_html   TEXT        NOT NULL,
  variables   TEXT[]      NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, name)
);

-- ── 10. Alumni jobs ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.alumni_jobs (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id     UUID        NOT NULL REFERENCES public.employer_profiles(id) ON DELETE CASCADE,
  title           TEXT        NOT NULL,
  description     TEXT,
  location        TEXT,
  job_type        TEXT        NOT NULL DEFAULT 'full_time',
  salary_min      NUMERIC(12,2),
  salary_max      NUMERIC(12,2),
  requirements    TEXT,
  status          TEXT        NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active','closed','draft')),
  deadline        DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_alumni_jobs_employer ON public.alumni_jobs(employer_id);
CREATE INDEX IF NOT EXISTS idx_alumni_jobs_status   ON public.alumni_jobs(status);

-- ── Done ─────────────────────────────────────────────────────────────────────
