import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// PATCH /api/employer/drives/[driveId] — update status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ driveId: string }> }
) {
  const { driveId } = await params;
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { cookies: { get: (n) => cookieStore.get(n)?.value, set: () => {}, remove: () => {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabaseAdmin
    .from("employer_profiles").select("id").eq("user_id", user.id).single();
  if (!profile) return NextResponse.json({ success: false, message: "Profile not found." }, { status: 404 });

  let body: { status: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ success: false, message: "Invalid JSON" }, { status: 400 }); }

  const VALID_STATUSES = ["scheduled", "in_progress", "completed", "cancelled"];
  if (!VALID_STATUSES.includes(body.status)) {
    return NextResponse.json({ success: false, message: "Invalid status." }, { status: 422 });
  }

  // Verify ownership
  const { data: drive } = await supabaseAdmin
    .from("drives").select("employer_id").eq("id", driveId).single();
  if (!drive || drive.employer_id !== profile.id) {
    return NextResponse.json({ success: false, message: "Not found or unauthorized." }, { status: 404 });
  }

  const { error } = await supabaseAdmin
    .from("drives")
    .update({ status: body.status, updated_at: new Date().toISOString() })
    .eq("id", driveId);

  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  return NextResponse.json({ success: true, message: "Drive status updated." });
}
