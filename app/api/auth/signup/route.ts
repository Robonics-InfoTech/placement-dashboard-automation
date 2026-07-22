import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
// TODO: Re-enable email verification once Resend sender domain is confirmed.
// import { sendVerificationEmail } from "@/lib/email/verification";
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
    const required = ["company_name", "industry"];
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

  // TODO: Re-enable generateLink + sendVerificationEmail when Resend is configured.
  // 1. Create user in Supabase Auth with email auto-confirmed (dev mode — no email verification).
  const { data: createData, error: createError } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // ← skips email verification entirely
      user_metadata: { role },
    });

  if (createError) {
    const isDuplicate =
      createError.message.toLowerCase().includes("already") ||
      createError.message.toLowerCase().includes("exists") ||
      createError.message.toLowerCase().includes("registered");

    return NextResponse.json(
      {
        success: false,
        message: isDuplicate
          ? "An account with this email already exists."
          : `Failed to create account: ${createError.message}`,
      },
      { status: isDuplicate ? 409 : 500 }
    );
  }

  const userId = createData.user.id;

  // 2. Insert the base users row (mirrors ERD `users` table)
  const { error: userRowError } = await supabaseAdmin.from("users").insert({
    id: userId,
    email,
    role,
    email_verified: true, // auto-confirmed
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
      graduation_year: payload.batch_year,
      ...(payload.photo_url ? { photo_url: payload.photo_url } : {}),
    });
    if (e) console.error("[signup] student_profiles insert error:", e.message);
  }

  if (payload.role === "employer") {
    const { error: e } = await supabaseAdmin.from("employer_profiles").insert({
      user_id: userId,
      company_name: payload.company_name,
      industry: payload.industry,
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

  // TODO: Step 4 — send branded verification email via Resend (re-enable later).
  // const token = ...; await sendVerificationEmail(email, token, role);

  return NextResponse.json(
    {
      success: true,
      message: "Account created! You can now log in.",
      userId,
    },
    { status: 201 }
  );
}
