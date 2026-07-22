export type UserRole = "student" | "employer" | "college_admin";

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

export interface EmployerSignupPayload extends BaseSignupPayload {
  role: "employer";
  company_name: string;
  industry: string;
  logo_url?: string; // Cloudinary secure_url (optional)
}

export interface CollegeAdminSignupPayload extends BaseSignupPayload {
  role: "college_admin";
  full_name: string;
  designation: string;
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
