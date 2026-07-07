import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { supabaseAdmin } from "@/lib/supabase/server";
import { v2 as cloudinary } from "cloudinary";

/* ─── Cloudinary config ──────────────────────────────────────────────────── */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key:    process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

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

const DOC_TYPE_MAP: Record<string, string> = {
  resume: "placementhub/documents/resumes",
  marksheet: "placementhub/documents/marksheets",
  certification: "placementhub/documents/certifications",
  photo: "placementhub/students/photos",
};

const DOC_LIMITS: Record<string, number> = { resume: 5, marksheet: 3, certification: 5 };
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

/* ── GET /api/student/documents ──────────────────────────────────────── */
export async function GET(req: NextRequest) {
  const supabase = getSessionClient(req);
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const docType = searchParams.get("type");

  let query = supabaseAdmin
    .from("documents")
    .select("id, document_name, document_type, file_path, file_size, mime_type, created_at")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (docType) query = query.eq("document_type", docType);

  const { data, error: dbErr } = await query;
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json({ documents: data });
}

/* ── POST /api/student/documents ─────────────────────────────────────── */
export async function POST(req: NextRequest) {
  const supabase = getSessionClient(req);
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let formData: FormData;
  try { formData = await req.formData(); }
  catch { return NextResponse.json({ error: "Invalid form data" }, { status: 400 }); }

  const file    = formData.get("file") as File | null;
  const docType = formData.get("doc_type") as string | null;

  if (!file || !docType) return NextResponse.json({ error: "file and doc_type are required" }, { status: 400 });
  if (file.size > MAX_FILE_SIZE) return NextResponse.json({ error: "File too large. Max 5 MB." }, { status: 413 });
  if (docType === "resume" && file.type !== "application/pdf") {
    return NextResponse.json({ error: "Resume must be a PDF file." }, { status: 422 });
  }

  // Check file count limits
  if (DOC_LIMITS[docType]) {
    const { count } = await supabaseAdmin
      .from("documents")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("document_type", docType)
      .is("deleted_at", null);

    if ((count ?? 0) >= DOC_LIMITS[docType]) {
      return NextResponse.json({ error: `Maximum ${DOC_LIMITS[docType]} ${docType} files allowed.` }, { status: 422 });
    }
  }

  // Upload to Cloudinary
  const buffer = Buffer.from(await file.arrayBuffer());
  const folder = DOC_TYPE_MAP[docType] ?? "placementhub/documents/other";

  const uploadResult = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
        use_filename: true,
        unique_filename: true,
      },
      (err, result) => {
        if (err || !result) reject(err ?? new Error("Upload failed"));
        else resolve({ secure_url: result.secure_url, public_id: result.public_id });
      }
    );
    stream.end(buffer);
  }).catch((e) => {
    return NextResponse.json({ error: `Cloudinary upload failed: ${(e as Error).message}` }, { status: 500 }) as unknown as { secure_url: string; public_id: string };
  });

  if (!("secure_url" in uploadResult)) return uploadResult as unknown as NextResponse;

  // Insert into documents table
  const { data: doc, error: dbErr } = await supabaseAdmin.from("documents").insert({
    user_id: user.id,
    document_name: file.name,
    document_type: docType,
    file_path: uploadResult.secure_url,
    file_size: file.size,
    mime_type: file.type,
    verified: false,
  }).select().single();

  if (dbErr) {
    // Rollback Cloudinary upload
    await cloudinary.uploader.destroy(uploadResult.public_id, { resource_type: "raw" }).catch(() => {});
    return NextResponse.json({ error: dbErr.message }, { status: 500 });
  }

  return NextResponse.json({ doc, url: uploadResult.secure_url }, { status: 201 });
}

/* ── DELETE /api/student/documents?id=<docId> ──────────────────────── */
export async function DELETE(req: NextRequest) {
  const supabase = getSessionClient(req);
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const docId = searchParams.get("id");
  if (!docId) return NextResponse.json({ error: "Missing document id" }, { status: 400 });

  // Verify ownership
  const { data: doc, error: fetchErr } = await supabaseAdmin
    .from("documents")
    .select("id, file_path, user_id, document_type")
    .eq("id", docId)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .single();

  if (fetchErr || !doc) return NextResponse.json({ error: "Document not found" }, { status: 404 });

  // Extract Cloudinary public_id from URL
  // URL format: https://res.cloudinary.com/<cloud>/image/upload/v<version>/<public_id>.<ext>
  const publicIdMatch = doc.file_path.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/);
  if (publicIdMatch) {
    const publicId = publicIdMatch[1];
    const resourceType = doc.file_path.includes("/raw/") || doc.file_path.endsWith(".pdf") ? "raw" : "image";
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType }).catch((e) => {
      console.error("[documents DELETE] Cloudinary destroy failed:", e);
    });
  }

  // Soft delete in DB
  const { error: delErr } = await supabaseAdmin
    .from("documents")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", docId);

  if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 });

  // If this was the primary resume, clear it from student_profiles
  if (doc.document_type === "resume") {
    const { data: sp } = await supabaseAdmin
      .from("student_profiles")
      .select("id, resume_url")
      .eq("user_id", user.id)
      .single();
    if (sp?.resume_url === doc.file_path) {
      await supabaseAdmin.from("student_profiles").update({ resume_url: null }).eq("user_id", user.id);
    }
  }

  return NextResponse.json({ success: true });
}

/* ── PATCH /api/student/documents (set primary resume) ─────────────── */
export async function PATCH(req: NextRequest) {
  const supabase = getSessionClient(req);
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { doc_id?: string; file_path?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  if (!body.file_path) return NextResponse.json({ error: "file_path required" }, { status: 400 });

  // Verify the document belongs to this user
  const { data: doc } = await supabaseAdmin
    .from("documents")
    .select("id")
    .eq("id", body.doc_id)
    .eq("user_id", user.id)
    .eq("document_type", "resume")
    .is("deleted_at", null)
    .single();

  if (!doc) return NextResponse.json({ error: "Document not found" }, { status: 404 });

  // Set resume_url in student_profiles (this field serves as primary resume indicator)
  const { error: updateErr } = await supabaseAdmin
    .from("student_profiles")
    .update({ resume_url: body.file_path, updated_at: new Date().toISOString() })
    .eq("user_id", user.id);

  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
