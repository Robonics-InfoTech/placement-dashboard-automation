import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { supabaseAdmin } from "@/lib/supabase/server";
import { sendOfferNotification } from "@/lib/email/student";

function getSessionClient(req: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)!,
    {
      cookies: {
        get: (name) => req.cookies.get(name)?.value,
        set: () => {},
        remove: () => {},
      },
    }
  );
}

/* ── PATCH /api/student/offers/[id] ──────────────────────────────────── */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = getSessionClient(req);
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: offerId } = params;
  let body: { action?: "accept" | "decline" };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  if (!["accept", "decline"].includes(body.action ?? "")) {
    return NextResponse.json({ error: "action must be 'accept' or 'decline'" }, { status: 400 });
  }

  // Get student profile
  const { data: sp } = await supabaseAdmin
    .from("student_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!sp) return NextResponse.json({ error: "Student profile not found" }, { status: 404 });

  // Verify offer ownership
  const { data: offer } = await supabaseAdmin
    .from("offers")
    .select(`
      id, offer_status, package_lpa, joining_date,
      employer_profiles!inner(company_name),
      applications!inner(job_id, jobs!inner(title))
    `)
    .eq("id", offerId)
    .eq("student_id", sp.id)
    .is("deleted_at", null)
    .single();

  if (!offer) return NextResponse.json({ error: "Offer not found" }, { status: 404 });

  if (offer.offer_status !== "issued") {
    return NextResponse.json({
      error: `Cannot ${body.action} an offer with status '${offer.offer_status}'. Only pending offers can be responded to.`,
    }, { status: 422 });
  }

  const newStatus = body.action === "accept" ? "accepted" : "declined";
  const now = new Date().toISOString();

  // Update offer status
  const { error: offerErr } = await supabaseAdmin
    .from("offers")
    .update({
      offer_status: newStatus,
      responded_at: now,
      updated_at: now,
    })
    .eq("id", offerId);

  if (offerErr) return NextResponse.json({ error: offerErr.message }, { status: 500 });

  const company = (offer.employer_profiles as { company_name: string }).company_name;
  const jobTitle = (offer.applications as { jobs: { title: string } }).jobs.title;

  // If accepted → mark student as placed
  if (body.action === "accept") {
    await supabaseAdmin
      .from("student_profiles")
      .update({ placement_status: "placed", updated_at: now })
      .eq("id", sp.id);

    // Create placement notification
    await supabaseAdmin.from("notifications").insert({
      user_id: user.id,
      title: "🎓 Congratulations! You are Placed!",
      message: `You have accepted the offer from ${company} for ${jobTitle}. Welcome to the professional world!`,
      notification_type: "offer",
      is_read: false,
    });

    // Send acceptance email
    try {
      await sendOfferNotification(user.email!, {
        company,
        role: jobTitle,
        packageLpa: offer.package_lpa,
        joiningDate: offer.joining_date,
        action: "accepted",
      });
    } catch (e) {
      console.error("[offers PATCH] Email send failed:", e);
    }
  } else {
    // Create declined notification
    await supabaseAdmin.from("notifications").insert({
      user_id: user.id,
      title: "Offer Declined",
      message: `You declined the offer from ${company} for ${jobTitle}.`,
      notification_type: "offer",
      is_read: false,
    });
  }

  return NextResponse.json({ success: true, status: newStatus });
}
