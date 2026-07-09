export interface StudentProfile {
  id: string;
  user_id: string;

  full_name: string | null;
  phone: string | null;
  dob: string | null;
  photo_url: string | null;

  college_id: string;
  enrollment_number: string;

  branch: string;
  course: string;
  specialization: string | null;
  semester: number | null;
  graduation_year: number;

  cgpa: number;
  active_backlogs: number;

  linkedin_url: string | null;
  github_url: string | null;
  portfolio_url: string | null;

  placement_status: string;

  created_at: string;
  updated_at: string;
}