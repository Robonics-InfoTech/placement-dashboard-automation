/** Platform-wide types */

export interface Tenant {
  id: string;
  name: string;
  code?: string;
  logo_url?: string;
  created_at: string;
}

export interface PlatformSettings {
  id: string;
  tenant_id: string | null;
  key: string;
  value: Record<string, unknown>;
  updated_at: string;
}

export interface Feedback {
  id: string;
  user_id: string;
  tenant_id: string | null;
  category: "general" | "bug" | "feature" | "complaint" | "praise";
  subject: string;
  body: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  created_at: string;
  updated_at: string;
}

export interface Announcement {
  id: string;
  tenant_id: string | null;
  author_id: string;
  title: string;
  body: string;
  priority: "low" | "normal" | "high" | "urgent";
  target_roles: string[];
  is_pinned: boolean;
  published_at: string;
  expires_at: string | null;
  created_at: string;
}

export interface EmailTemplate {
  id: string;
  tenant_id: string | null;
  name: string;
  subject: string;
  body_html: string;
  variables: string[];
  created_at: string;
  updated_at: string;
}

export interface AlumniProfile {
  id: string;
  user_id: string;
  tenant_id: string | null;
  full_name: string | null;
  phone: string | null;
  graduation_year: number | null;
  branch: string | null;
  course: string | null;
  current_company: string | null;
  current_role: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  portfolio_url: string | null;
  resume_url: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CommitteeMember {
  id: string;
  user_id: string;
  college_id: string;
  full_name: string | null;
  designation: string | null;
  is_active: boolean;
  created_at: string;
}

export interface AlumniJob {
  id: string;
  employer_id: string;
  title: string;
  description: string | null;
  location: string | null;
  job_type: string;
  salary_min: number | null;
  salary_max: number | null;
  requirements: string | null;
  status: "active" | "closed" | "draft";
  deadline: string | null;
  created_at: string;
  updated_at: string;
}

/** Search result item */
export interface SearchResult {
  type: "page" | "drive" | "job" | "student" | "employer" | "application";
  title: string;
  description?: string;
  href: string;
  icon?: string;
}
