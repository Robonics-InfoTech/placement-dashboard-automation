// ─── Employer profile (mirrors employer_profiles table) ──────────────────────
export interface EmployerProfile {
  id: string;
  user_id: string;
  company_name: string;
  logo_url: string | null;
  industry: string;
  hq_location: string;
  website_url: string | null;
  about: string | null;           // Tiptap HTML, max 500 words
  hr_contact_name: string;
  hr_contact_email: string | null;
  hr_contact_phone: string | null;
  approval_status: "pending" | "approved" | "rejected";
  college_id: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Job posting ─────────────────────────────────────────────────────────────
export type JobType = "full_time" | "internship" | "ppo";
export type JobStatus = "pending_approval" | "active" | "closed" | "rejected";

export interface SelectionRound {
  order: number;
  name: string;
  notes?: string;
}

export interface JobPosting {
  id: string;
  employer_id: string;
  college_id: string;
  title: string;
  description: string;         // Tiptap HTML
  job_type: JobType;
  location: string;
  ctc_min: number | null;
  ctc_max: number | null;
  openings: number;
  min_cgpa: number;
  allowed_branches: string[];
  max_backlogs: number;
  batch_years: number[];
  selection_rounds: SelectionRound[];
  deadline: string;            // ISO date string
  status: JobStatus;
  created_at: string;
  updated_at: string;
  // Computed joins (optional, returned by some queries)
  applicant_count?: number;
}

// ─── Drive ───────────────────────────────────────────────────────────────────
export type DriveStatus = "scheduled" | "in_progress" | "completed" | "cancelled";
export type VenueType = "physical" | "virtual";

export interface DriveRound {
  name: string;
  duration_min: number;
  format: string;
}

export interface Drive {
  id: string;
  employer_id: string;
  college_id: string;
  name: string;
  drive_date: string;           // ISO datetime
  venue_type: VenueType;
  venue: string;
  rounds_schedule: DriveRound[];
  max_students: number | null;
  status: DriveStatus;
  created_at: string;
  updated_at: string;
  // Joins
  job_ids?: string[];
}

// ─── Application ─────────────────────────────────────────────────────────────
export type ApplicationStatus =
  | "applied"
  | "shortlisted"
  | "round_1"
  | "round_2"
  | "round_3"
  | "round_4"
  | "offer_extended"
  | "rejected"
  | "withdrawn";

export interface Application {
  id: string;
  job_id: string;
  student_id: string;
  status: ApplicationStatus;
  rejection_reason: string | null;
  current_round: number;
  applied_at: string;
  updated_at: string;
  // Joins (returned when fetching applicants table)
  student?: {
    id: string;
    full_name: string | null;
    branch: string;
    cgpa: number;
    resume_url: string | null;
    enrollment_number: string;
  };
}

// ─── Audit log ───────────────────────────────────────────────────────────────
export interface AuditLog {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  acting_user_id: string;
  from_status: string | null;
  to_status: string | null;
  notes: string | null;
  created_at: string;
}

// ─── Offer ───────────────────────────────────────────────────────────────────
export type OfferStatus = "pending" | "accepted" | "declined";

export interface Offer {
  id: string;
  application_id: string;
  employer_id: string;
  student_id: string;
  role_confirmed: string;
  ctc: number;
  joining_date: string;
  location: string;
  bond_clause: string | null;
  offer_letter_path: string | null;
  status: OfferStatus;
  published_at: string;
  responded_at: string | null;
  // Joins
  student?: {
    full_name: string | null;
    branch: string;
  };
}

// ─── Notification ─────────────────────────────────────────────────────────────
export interface Notification {
  id: string;
  user_id: string;
  type: "offer" | "rejection" | "status_update" | "approval";
  title: string;
  body: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

// ─── API response helpers ─────────────────────────────────────────────────────
export interface ApiSuccess<T> {
  success: true;
  data: T;
}
export interface ApiError {
  success: false;
  message: string;
}
export type ApiResponse<T> = ApiSuccess<T> | ApiError;
