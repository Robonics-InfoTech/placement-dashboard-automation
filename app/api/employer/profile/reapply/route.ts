import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { supabaseAdmin } from "@/lib/supabase/server";
import { cookies } from "next/headers";

// POST /api/employer/profile/reapply
// Allowed only when current approval_status is 'rejected'.
export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: { get: (n) => cookieStore.get(n)?.value, set: () => {}, remove: () => {} },
    }
  );

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  // Verify current status is 'rejected' before allowing re-apply
  const { data: profile } = await supabaseAdmin
    .from("employer_profiles")
    .select("approval_status")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ success: false, message: "Profile not found." }, { status: 404 });
  }
  if (profile.approval_status !== "rejected") {
    return NextResponse.json(
      { success: false, message: "Re-apply is only allowed for rejected accounts." },
      { status: 409 }
    );
  }

  const { error: updateErr } = await supabaseAdmin
    .from("employer_profiles")
    .update({ approval_status: "pending", updated_at: new Date().toISOString() })
    .eq("user_id", user.id);

  if (updateErr) {
    return NextResponse.json({ success: false, message: updateErr.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: "Application re-submitted for approval." });
}
