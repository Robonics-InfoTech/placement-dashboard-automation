export type UserRole =
  | "student"
  | "alumni"
  | "employer"
  | "college_admin"
  | "placement_committee"
  | "super_admin";

export const ALL_ROLES: UserRole[] = [
  "student",
  "alumni",
  "employer",
  "college_admin",
  "placement_committee",
  "super_admin",
];

export const ROLE_LABELS: Record<UserRole, string> = {
  student: "Student",
  alumni: "Alumni",
  employer: "Employer",
  college_admin: "College Admin",
  placement_committee: "Placement Committee",
  super_admin: "Super Admin",
};

export interface BaseSignupPayload {
  email: string;
  password: string;
  role: UserRole;
}

export interface StudentSignupPayload extends BaseSignupPayload {
  role: "student";
  full_name: string;
  branch: string;
  batch_year: number;
  enrollment_key: string;
  photo_url?: string;
}

export interface AlumniSignupPayload extends BaseSignupPayload {
  role: "alumni";
  full_name: string;
  graduation_year: number;
  branch: string;
  current_company?: string;
  enrollment_key: string;
}

export interface EmployerSignupPayload extends BaseSignupPayload {
  role: "employer";
  company_name: string;
  industry: string;
  logo_url?: string;
  hq_location?: string;
  hr_contact_name?: string;
}

export interface CollegeAdminSignupPayload extends BaseSignupPayload {
  role: "college_admin";
  full_name: string;
  designation: string;
  enrollment_key?: string;
}

export interface CommitteeSignupPayload extends BaseSignupPayload {
  role: "placement_committee";
  full_name: string;
  designation: string;
  enrollment_key: string;
}

export interface SuperAdminSignupPayload extends BaseSignupPayload {
  role: "super_admin";
  full_name: string;
}

export type SignupPayload =
  | StudentSignupPayload
  | AlumniSignupPayload
  | EmployerSignupPayload
  | CollegeAdminSignupPayload
  | CommitteeSignupPayload
  | SuperAdminSignupPayload;

export interface SignupApiResponse {
  success: boolean;
  message: string;
  userId?: string;
}
