import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";

// POST /api/employer/offers/upload
// Returns a signed upload URL for Supabase Storage
export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { cookies: { get: (n) => cookieStore.get(n)?.value, set: () => {}, remove: () => {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  let body: { filename: string; contentType: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ success: false, message: "Invalid JSON" }, { status: 400 }); }

  if (body.contentType !== "application/pdf") {
    return NextResponse.json({ success: false, message: "Only PDF allowed." }, { status: 422 });
  }

  // Path: {userId}/{uuid}-{sanitized-filename}
  const sanitized = body.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path      = `${user.id}/${uuidv4()}-${sanitized}`;

  const { data, error } = await supabaseAdmin.storage
    .from("offer-letters")
    .createSignedUploadUrl(path);

  if (error || !data) {
    return NextResponse.json({ success: false, message: error?.message ?? "Failed to create upload URL." }, { status: 500 });
  }

  return NextResponse.json({ success: true, signedUrl: data.signedUrl, path });
}
