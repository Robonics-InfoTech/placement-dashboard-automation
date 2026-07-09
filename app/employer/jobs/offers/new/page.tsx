"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface ShortlistedStudent {
  applicationId: string;
  jobTitle: string;
  studentName: string;
  branch: string;
  cgpa: number;
  enrollment: string;
}

export default function NewOfferPage() {
  const router        = useRouter();
  const searchParams  = useSearchParams();
  const prefilledAppId = searchParams.get("applicationId");

  const [shortlisted, setShortlisted] = useState<ShortlistedStudent[]>([]);
  const [form, setForm] = useState({
    application_id:    prefilledAppId ?? "",
    role_confirmed:    "",
    ctc:               "",
    joining_date:      "",
    location:          "",
    bond_clause:       "",
    offer_letter_path: "",   // Supabase Storage path after upload
  });
  const [uploading, setUploading]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState("");
  const [preview, setPreview]       = useState(false);

  /* ── Load shortlisted applicants ──────────────────────────────────── */
  const loadShortlisted = useCallback(async () => {
    const res = await fetch("/api/employer/offers/shortlisted");
    if (res.ok) {
      const json = await res.json();
      setShortlisted(json.data ?? []);
      // If a student was pre-selected, auto-fill role from their job
      if (prefilledAppId) {
        const match = (json.data as ShortlistedStudent[])?.find(
          (s) => s.applicationId === prefilledAppId
        );
        if (match) setForm((f) => ({ ...f, role_confirmed: match.jobTitle }));
      }
    }
  }, [prefilledAppId]);

  useEffect(() => { loadShortlisted(); }, [loadShortlisted]);

  const selectedStudent = shortlisted.find((s) => s.applicationId === form.application_id);

  /* ── PDF upload ───────────────────────────────────────────────────── */
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      setError("Only PDF files are allowed for offer letters.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be under 10 MB.");
      return;
    }

    setUploading(true);
    setError("");
    try {
      // Get signed upload URL from our API
      const signRes = await fetch("/api/employer/offers/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: "application/pdf" }),
      });
      const { signedUrl, path } = await signRes.json();

      // Upload to Supabase Storage using the signed URL
      const uploadRes = await fetch(signedUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/pdf" },
        body: file,
      });

      if (!uploadRes.ok) throw new Error("Upload failed.");
      setForm((f) => ({ ...f, offer_letter_path: path }));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    }
    setUploading(false);
  };

  /* ── Submit ───────────────────────────────────────────────────────── */
  const handleSubmit = async () => {
    setError("");
    if (!form.application_id) { setError("Please select a student."); return; }
    if (!form.role_confirmed.trim()) { setError("Role is required."); return; }
    if (!form.ctc || isNaN(Number(form.ctc))) { setError("Valid CTC is required."); return; }
    if (!form.joining_date) { setError("Joining date is required."); return; }
    if (!form.location.trim()) { setError("Location is required."); return; }

    setSubmitting(true);
    const res = await fetch("/api/employer/offers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        ctc: Number(form.ctc),
      }),
    });
    const json = await res.json();
    if (!res.ok) { setError(json.message ?? "Submission failed."); setSubmitting(false); return; }
    router.push("/employer/jobs/offers");
  };

  const inputStyle: React.CSSProperties = {
    padding: "11px 14px", borderRadius: "10px", fontSize: "14px",
    background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)",
    color: "white", outline: "none", width: "100%",
  };
  const labelStyle: React.CSSProperties = { fontSize: "13px", fontWeight: 600, color: "#CBD5E1", marginBottom: 7, display: "block" };

  return (
    <>
      <style>{`
        .nop-topbar { padding: 22px 32px; border-bottom: 1px solid rgba(255,255,255,.07); background: rgba(255,255,255,.02); }
        .nop-topbar h2 { font-size: 20px; font-weight: 700; color: white; }
        .nop-topbar p  { font-size: 13px; color: #64748B; margin-top: 2px; }
        .nop-content { padding: 28px 32px; max-width: 680px; }
        .nop-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
        .nop-section { display: flex; flex-direction: column; gap: 7px; margin-bottom: 16px; }

        .nop-student-card {
          padding: 14px 16px; border-radius: 12px; margin-top: 8px;
          background: rgba(14,165,233,.07); border: 1px solid rgba(14,165,233,.15);
        }
        .nop-student-card .name { font-size: 14px; font-weight: 700; color: white; }
        .nop-student-card .meta { font-size: 12px; color: #64748B; margin-top: 4px; display: flex; gap: 12px; }

        .nop-preview-card {
          padding: 20px; border-radius: 14px; margin-top: 24px;
          background: rgba(16,185,129,.06); border: 1px solid rgba(16,185,129,.15);
        }
        .nop-preview-card h4 { font-size: 15px; font-weight: 700; color: white; margin-bottom: 14px; }
        .nop-preview-row { display: flex; gap: 12px; margin-bottom: 8px; font-size: 13px; }
        .nop-preview-row .lbl { color: #64748B; min-width: 120px; }
        .nop-preview-row .val { color: #E2E8F0; font-weight: 600; }

        .nop-upload-area {
          padding: 20px; border-radius: 11px; border: 2px dashed rgba(255,255,255,.12);
          text-align: center; cursor: pointer; transition: border-color .2s; position: relative;
        }
        .nop-upload-area:hover { border-color: rgba(14,165,233,.4); }
        .nop-upload-input { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; }

        .nop-btns { display: flex; gap: 12px; margin-top: 24px; }
        .nop-btn { padding: 11px 24px; border-radius: 10px; border: none; cursor: pointer; font-size: 14px; font-weight: 700; transition: all .2s; }
        .nop-btn.primary { background: linear-gradient(135deg,#0EA5E9,#6366F1); color: white; }
        .nop-btn.primary:hover { opacity: .88; }
        .nop-btn.primary:disabled { opacity: .5; cursor: not-allowed; }
        .nop-btn.secondary { background: rgba(255,255,255,.07); color: #94A3B8; border: 1px solid rgba(255,255,255,.1); }

        .nop-error { padding: 10px 14px; border-radius: 9px; background: rgba(239,68,68,.1); border: 1px solid rgba(239,68,68,.2); color: #FCA5A5; font-size: 13px; font-weight: 600; margin-top: 12px; }
        input:focus { border-color: #0EA5E9 !important; }
        select { padding: 11px 14px; border-radius: 10px; font-size: 14px; background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.1); color: white; outline: none; width: 100%; }
        select option { background: #1E293B; }
      `}</style>

      <div className="nop-topbar">
        <h2>Publish Offer Letter</h2>
        <p>Fill in the offer details. The student will be notified immediately on publish.</p>
      </div>

      <div className="nop-content">
        {/* Student selector */}
        <div className="nop-section">
          <label style={labelStyle}>Select Student *</label>
          <select
            value={form.application_id}
            onChange={(e) => {
              const s = shortlisted.find((x) => x.applicationId === e.target.value);
              setForm((f) => ({ ...f, application_id: e.target.value, role_confirmed: s?.jobTitle ?? f.role_confirmed }));
            }}
          >
            <option value="">Select a shortlisted applicant…</option>
            {shortlisted.map((s) => (
              <option key={s.applicationId} value={s.applicationId}>
                {s.studentName} — {s.jobTitle} ({s.branch})
              </option>
            ))}
          </select>
          {selectedStudent && (
            <div className="nop-student-card">
              <div className="name">{selectedStudent.studentName}</div>
              <div className="meta">
                <span>{selectedStudent.branch}</span>
                <span>CGPA: {selectedStudent.cgpa?.toFixed(1)}</span>
                <span>{selectedStudent.enrollment}</span>
              </div>
            </div>
          )}
        </div>

        {/* Offer details */}
        <div className="nop-section">
          <label style={labelStyle}>Role Confirmed *</label>
          <input style={inputStyle} value={form.role_confirmed}
            placeholder="e.g. Software Engineer" onChange={(e) => setForm((f) => ({ ...f, role_confirmed: e.target.value }))} />
        </div>

        <div className="nop-grid2">
          <div className="nop-section">
            <label style={labelStyle}>CTC (LPA) *</label>
            <input style={inputStyle} type="number" step="0.5" value={form.ctc}
              placeholder="e.g. 8.5" onChange={(e) => setForm((f) => ({ ...f, ctc: e.target.value }))} />
          </div>
          <div className="nop-section">
            <label style={labelStyle}>Joining Date *</label>
            <input style={inputStyle} type="date" value={form.joining_date}
              onChange={(e) => setForm((f) => ({ ...f, joining_date: e.target.value }))} />
          </div>
        </div>

        <div className="nop-section">
          <label style={labelStyle}>Location *</label>
          <input style={inputStyle} value={form.location}
            placeholder="e.g. Bangalore, Karnataka" onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
        </div>

        <div className="nop-section">
          <label style={labelStyle}>Bond Clause (optional)</label>
          <textarea
            value={form.bond_clause} placeholder="e.g. 2-year service bond, ₹2L penalty for early exit"
            onChange={(e) => setForm((f) => ({ ...f, bond_clause: e.target.value }))}
            style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
          />
        </div>

        {/* PDF Upload */}
        <div className="nop-section">
          <label style={labelStyle}>Offer Letter PDF (optional, max 10 MB)</label>
          <div className="nop-upload-area">
            <input type="file" accept="application/pdf" className="nop-upload-input" onChange={handleFileUpload} />
            {uploading ? (
              <p style={{ color: "#38BDF8", fontSize: 14 }}>Uploading…</p>
            ) : form.offer_letter_path ? (
              <p style={{ color: "#34D399", fontSize: 14 }}>✅ PDF uploaded successfully</p>
            ) : (
              <>
                <p style={{ fontSize: 14, color: "#64748B" }}>📄 Click or drag to upload offer letter PDF</p>
                <p style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>Max size: 10 MB · PDF only</p>
              </>
            )}
          </div>
        </div>

        {/* Preview */}
        {preview && selectedStudent && (
          <div className="nop-preview-card">
            <h4>📋 Offer Preview</h4>
            {[
              ["Student",      selectedStudent.studentName],
              ["Role",         form.role_confirmed],
              ["CTC",          `${form.ctc} LPA`],
              ["Joining Date", form.joining_date],
              ["Location",     form.location],
              ["Bond",         form.bond_clause || "None"],
            ].map(([lbl, val]) => (
              <div key={lbl} className="nop-preview-row">
                <span className="lbl">{lbl}</span>
                <span className="val">{val}</span>
              </div>
            ))}
          </div>
        )}

        {error && <div className="nop-error">{error}</div>}

        <div className="nop-btns">
          <button className="nop-btn secondary" onClick={() => setPreview((p) => !p)}>
            {preview ? "Hide Preview" : "Preview Offer"}
          </button>
          <button className="nop-btn primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Publishing…" : "🚀 Publish Offer"}
          </button>
        </div>
      </div>
    </>
  );
}
