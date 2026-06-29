import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { sendVerificationEmail } from "@/lib/email/verification";
import type {
  SignupPayload,
  SignupApiResponse,
  UserRole,
} from "@/types/auth";

// ─── Validation helpers ───────────────────────────────────────────────────────

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isStrongPassword(password: string): boolean {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
}

function validatePayload(
  body: unknown
): { valid: true; payload: SignupPayload } | { valid: false; error: string } {
  if (typeof body !== "object" || body === null) {
    return { valid: false, error: "Invalid request body." };
  }

  const b = body as Record<string, unknown>;
  const validRoles: UserRole[] = ["student", "employer", "college_admin"];

  if (!b.role || !validRoles.includes(b.role as UserRole)) {
    return { valid: false, error: "Invalid or missing role." };
  }

  const role = b.role as UserRole;

  if (!b.email || !isValidEmail(String(b.email))) {
    return { valid: false, error: "Invalid or missing email." };
  }

  if (!b.password || !isStrongPassword(String(b.password))) {
    return {
      valid: false,
      error:
        "Password must be at least 8 characters with uppercase, lowercase, and a number.",
    };
  }

  if (role === "student") {
    const required = ["full_name", "branch", "batch_year", "enrollment_key"];
    for (const field of required) {
      if (!b[field]) return { valid: false, error: `Missing field: ${field}` };
    }
  }

  if (role === "employer") {
    const required = ["company_name", "industry", "hq_location", "hr_contact_name"];
    for (const field of required) {
      if (!b[field]) return { valid: false, error: `Missing field: ${field}` };
    }
  }

  if (role === "college_admin") {
    const required = ["full_name", "designation"];
    for (const field of required) {
      if (!b[field]) return { valid: false, error: `Missing field: ${field}` };
    }
  }

  return { valid: true, payload: b as unknown as SignupPayload };
}

// ─── POST /api/auth/signup ────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse<SignupApiResponse>> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Malformed JSON body." },
      { status: 400 }
    );
  }

  const validation = validatePayload(body);
  if (!validation.valid) {
    return NextResponse.json(
      { success: false, message: validation.error },
      { status: 422 }
    );
  }

  const { payload } = validation;
  const { email, password, role } = payload;

  // 1. generateLink atomically creates the user in Supabase Auth AND returns a
  //    hashed_token we use to build our own branded verification URL via Resend.
  //    We do NOT call createUser separately — that would create a duplicate user
  //    and cause a conflict when generateLink is called.
  const { data: linkData, error: linkError } =
    await supabaseAdmin.auth.admin.generateLink({
      type: "signup",
      email,
      password,
      options: {
        data: { role }, // stored in user_metadata
      },
    });

  if (linkError) {
    const isDuplicate =
      linkError.message.toLowerCase().includes("already") ||
      linkError.message.toLowerCase().includes("exists") ||
      linkError.message.toLowerCase().includes("registered");

    return NextResponse.json(
      {
        success: false,
        message: isDuplicate
          ? "An account with this email already exists."
          : `Failed to create account: ${linkError.message}`,
      },
      { status: isDuplicate ? 409 : 500 }
    );
  }

  const userId = linkData.user.id;
  const token = linkData.properties?.hashed_token;

  // 2. Insert the base users row (mirrors ERD `users` table)
  const { error: userRowError } = await supabaseAdmin.from("users").insert({
    id: userId,
    email,
    role,
    email_verified: false,
    is_active: true,
    is_suspended: false,
    failed_login_attempts: 0,
  });

  if (userRowError) {
    // Non-fatal — table may not exist yet if migrations haven't run
    console.error("[signup] users insert error:", userRowError.message);
  }

  // 3. Insert role-specific profile row
  if (payload.role === "student") {
    const { error: e } = await supabaseAdmin.from("student_profiles").insert({
      user_id: userId,
      full_name: payload.full_name,
      branch: payload.branch,
      batch_year: payload.batch_year,
      ...(payload.photo_url ? { photo_url: payload.photo_url } : {}),
    });
    if (e) console.error("[signup] student_profiles insert error:", e.message);
  }

  if (payload.role === "employer") {
    const { error: e } = await supabaseAdmin.from("employer_profiles").insert({
      user_id: userId,
      company_name: payload.company_name,
      industry: payload.industry,
      hq_location: payload.hq_location,
      hr_contact_name: payload.hr_contact_name,
      approval_status: "pending",
      ...(payload.logo_url ? { logo_url: payload.logo_url } : {}),
    });
    if (e) console.error("[signup] employer_profiles insert error:", e.message);
  }

  if (payload.role === "college_admin") {
    const { error: e } = await supabaseAdmin.from("college_admin_profiles").insert({
      user_id: userId,
      full_name: payload.full_name,
      designation: payload.designation,
    });
    if (e) console.error("[signup] college_admin_profiles insert error:", e.message);
  }

  // 4. Send branded verification email via Resend
  if (!token) {
    console.warn("[signup] No hashed_token in generateLink response");
    return NextResponse.json(
      {
        success: true,
        message:
          "Account created! We couldn't generate a verification link. Please contact support.",
        userId,
      },
      { status: 201 }
    );
  }

  try {
    await sendVerificationEmail(email, token, role);
  } catch (emailErr) {
    console.error("[signup] Email send failed:", emailErr);
    return NextResponse.json(
      {
        success: true,
        message:
          "Account created, but we couldn't deliver your verification email. Please try resending.",
        userId,
      },
      { status: 201 }
    );
  }

  return NextResponse.json(
    {
      success: true,
      message: "Account created! Check your inbox to verify your email.",
      userId,
    },
    { status: 201 }
  );
}
