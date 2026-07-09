import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { supabaseAdmin } from "@/lib/supabase/server";
import { cookies } from "next/headers";

async function getUser(req: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        get: (n) => cookieStore.get(n)?.value,
        set: () => {},
        remove: () => {},
      },
    }
  );
  return supabase.auth.getUser();
}

// GET /api/employer/profile
export async function GET(req: NextRequest) {
  const { data: { user }, error } = await getUser(req);
  if (error || !user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { data, error: dbErr } = await supabaseAdmin
    .from("employer_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (dbErr) {
    return NextResponse.json({ success: false, message: dbErr.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}

// PATCH /api/employer/profile
export async function PATCH(req: NextRequest) {
  const { data: { user }, error } = await getUser(req);
  if (error || !user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON" }, { status: 400 });
  }

  // Validate word count for about field
  if (body.about && typeof body.about === "string") {
    const wordCount = body.about
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .split(" ")
      .filter(Boolean).length;
    if (wordCount > 500) {
      return NextResponse.json(
        { success: false, message: `About section exceeds 500 words (${wordCount} used).` },
        { status: 422 }
      );
    }
  }

  const allowedFields = [
    "company_name", "industry", "hq_location", "website_url",
    "about", "hr_contact_name", "hr_contact_email", "hr_contact_phone", "logo_url",
  ];

  const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const key of allowedFields) {
    if (key in body) updateData[key] = body[key];
  }

  const { error: updateErr } = await supabaseAdmin
    .from("employer_profiles")
    .update(updateData)
    .eq("user_id", user.id);

  if (updateErr) {
    return NextResponse.json({ success: false, message: updateErr.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: "Profile updated." });
}
