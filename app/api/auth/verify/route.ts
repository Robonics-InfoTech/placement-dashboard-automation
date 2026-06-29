import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

/**
 * GET /api/auth/verify?token_hash=...&type=signup&email=...
 *
 * Called when the user clicks the verification link in their email.
 * Verifies the OTP, marks email_verified in the users table, then redirects.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = req.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const email = searchParams.get("email");

  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!tokenHash || type !== "signup" || !email) {
    return NextResponse.redirect(`${APP_URL}/auth/verify-error?reason=invalid_link`);
  }

  // Verify OTP with Supabase Auth
  const { data, error } = await supabaseAdmin.auth.verifyOtp({
    type: "signup",
    token_hash: tokenHash,
    // Supabase verifyOtp accepts token_hash; email not required but safe to pass
  });

  if (error || !data.user) {
    console.error("[verify] OTP error:", error?.message);
    const reason = error?.message?.toLowerCase().includes("expired")
      ? "expired"
      : "invalid";
    return NextResponse.redirect(`${APP_URL}/auth/verify-error?reason=${reason}`);
  }

  // Mark email_verified in our users table
  await supabaseAdmin
    .from("users")
    .update({ email_verified: true })
    .eq("id", data.user.id);

  return NextResponse.redirect(`${APP_URL}/auth/verified`);
}
