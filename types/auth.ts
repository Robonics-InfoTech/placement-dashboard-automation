export type UserRole = "student" | "employer" | "college_admin";

export interface BaseSignupPayload {
  email: string;
  password: string;
  role: UserRole;
}

export interface StudentSignupPayload extends BaseSignupPayload {
  role: "student";
  full_name: string;
  roll_number: string;
  branch: string;
  batch_year: number;
  enrollment_key: string; // college enrollment key
}

export interface EmployerSignupPayload extends BaseSignupPayload {
  role: "employer";
  company_name: string;
  industry: string;
  hq_location: string;
  hr_contact_name: string;
}

export interface CollegeAdminSignupPayload extends BaseSignupPayload {
  role: "college_admin";
  full_name: string;
  designation: string;
  enrollment_key: string; // college enrollment key
}

export type SignupPayload =
  | StudentSignupPayload
  | EmployerSignupPayload
  | CollegeAdminSignupPayload;

export interface SignupApiResponse {
  success: boolean;
  message: string;
  userId?: string;
}
