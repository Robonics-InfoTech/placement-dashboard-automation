import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// GET /api/employer/drives/conflicts?date=2026-08-01&college_id=xxx
export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { cookies: { get: (n) => cookieStore.get(n)?.value, set: () => {}, remove: () => {} } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ conflict: false }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const date      = searchParams.get("date");
  const collegeId = searchParams.get("college_id");

  if (!date || !collegeId) {
    return NextResponse.json({ conflict: false, drives: [] });
  }

  // Check for drives on the same calendar day for the same college
  const dayStart = `${date}T00:00:00.000Z`;
  const dayEnd   = `${date}T23:59:59.999Z`;

  // Real table: placement_drives, column: drive_name (not name)
  const { data: conflicting } = await supabaseAdmin
    .from("placement_drives")
    .select("id, drive_name, drive_date, status")
    .eq("college_id", collegeId)
    .gte("drive_date", dayStart)
    .lte("drive_date", dayEnd)
    .neq("status", "cancelled");

  const drives = conflicting ?? [];
  return NextResponse.json({ conflict: drives.length > 0, drives });
}
