"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import ApprovalBanner from "@/components/employer/ApprovalBanner";
import StatusChip from "@/components/employer/StatusChip";
import dynamic from "next/dynamic";

// Dynamically import RichTextEditor so it's only loaded client-side (Tiptap requirement)
const RichTextEditor = dynamic(
  () => import("@/components/employer/RichTextEditor"),
  { ssr: false, loading: () => <div style={{ height: 180, background: "rgba(255,255,255,.04)", borderRadius: 12 }} /> }
);

const INDUSTRIES = [
  "Information Technology", "Finance & Banking", "Healthcare", "Manufacturing",
  "E-Commerce", "Consulting", "Education", "Logistics", "Media & Entertainment",
  "Government / PSU", "Automobile", "Other",
];

interface ProfileForm {
  company_name: string;
  industry: string;
  hq_location: string;
  website_url: string;
  about: string;
  hr_contact_name: string;
  hr_contact_email: string;
  hr_contact_phone: string;
}

export default function EmployerProfilePage() {
  const [form, setForm]       = useState<ProfileForm>({
    company_name: "", industry: "", hq_location: "", website_url: "",
    about: "", hr_contact_name: "", hr_contact_email: "", hr_contact_phone: "",
  });
  const [approvalStatus, setApprovalStatus] = useState<"pending" | "approved" | "rejected">("pending");
  const [saving, setSaving]   = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(true);

  /* ── Load existing profile ──────────────────────────────────────────── */
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const res = await fetch("/api/employer/profile");
      if (res.ok) {
        const { data } = await res.json();
        if (data) {
          setApprovalStatus(data.approval_status ?? "pending");
          setForm({
            company_name:     data.company_name     ?? "",
            industry:         data.industry         ?? "",
            hq_location:      data.hq_location      ?? "",
            website_url:      data.website_url      ?? "",
            about:            data.about            ?? "",
            hr_contact_name:  data.hr_contact_name  ?? "",
            hr_contact_email: data.hr_contact_email ?? "",
            hr_contact_phone: data.hr_contact_phone ?? "",
          });
        }
      }
      setLoading(false);
    })();
  }, []);

  const handleChange = (field: keyof ProfileForm, val: string) =>
    setForm((f) => ({ ...f, [field]: val }));

  /* ── Save ──────────────────────────────────────────────────────────── */
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const res = await fetch("/api/employer/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const json = await res.json();
    setMessage(
      res.ok
        ? { type: "success", text: "Profile saved successfully." }
        : { type: "error",   text: json.message ?? "Save failed." }
    );
    setSaving(false);
  };

  /* ── Re-apply ──────────────────────────────────────────────────────── */
  const handleReapply = async () => {
    const res = await fetch("/api/employer/profile/reapply", { method: "POST" });
    if (res.ok) setApprovalStatus("pending");
    else alert("Re-apply failed. Please try again.");
  };

  /* ── Helpers ────────────────────────────────────────────────────────── */
  const field = (label: string, key: keyof ProfileForm, opts?: { type?: string; placeholder?: string }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
      <label style={{ fontSize: "13px", fontWeight: 600, color: "#CBD5E1" }}>{label}</label>
      <input
        type={opts?.type ?? "text"}
        value={form[key]}
        placeholder={opts?.placeholder}
        onChange={(e) => handleChange(key, e.target.value)}
        style={{
          padding: "12px 14px", borderRadius: "10px", fontSize: "14px",
          background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)",
          color: "white", outline: "none",
        }}
      />
    </div>
  );

  if (loading) return (
    <div style={{ padding: 40, color: "#64748B" }}>Loading profile…</div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .epp-topbar { padding: 22px 32px; border-bottom: 1px solid rgba(255,255,255,.07); background: rgba(255,255,255,.02); }
        .epp-topbar h2 { font-size: 20px; font-weight: 700; color: white; }
        .epp-topbar p  { font-size: 13px; color: #64748B; margin-top: 2px; }
        .epp-content { padding: 28px 32px; max-width: 760px; }
        .epp-section-title { font-size: 14px; font-weight: 700; color: #94A3B8; text-transform: uppercase; letter-spacing: .06em; margin: 28px 0 14px; }
        .epp-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .epp-save-btn {
          margin-top: 28px; padding: 12px 28px; border-radius: 11px; border: none; cursor: pointer;
          background: linear-gradient(135deg,#0EA5E9,#6366F1); color: white;
          font-size: 14px; font-weight: 700; transition: opacity .2s;
        }
        .epp-save-btn:hover { opacity: .88; }
        .epp-save-btn:disabled { opacity: .5; cursor: not-allowed; }
        .epp-msg { padding: 12px 16px; border-radius: 9px; font-size: 13px; font-weight: 600; margin-top: 16px; }
        .epp-msg.success { background: rgba(16,185,129,.1); color: #34D399; border: 1px solid rgba(16,185,129,.2); }
        .epp-msg.error   { background: rgba(239,68,68,.1);  color: #FCA5A5; border: 1px solid rgba(239,68,68,.2); }
        select { padding: 12px 14px; border-radius: 10px; font-size: 14px; background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.1); color: white; outline: none; width: 100%; }
        select option { background: #1E293B; }
        input:focus { border-color: #0EA5E9 !important; box-shadow: 0 0 0 3px rgba(14,165,233,.15); }
      `}</style>

      <div className="epp-topbar">
        <h2>Company Profile</h2>
        <p>Keep your profile up to date to attract top talent.</p>
      </div>

      <div className="epp-content">
        {/* Approval banner */}
        <div style={{ marginTop: 4 }}>
          <ApprovalBanner
            approvalStatus={approvalStatus}
            onReapply={approvalStatus === "rejected" ? handleReapply : undefined}
          />
        </div>

        {/* Status badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <span style={{ fontSize: 13, color: "#64748B" }}>Account status:</span>
          <StatusChip status={approvalStatus} />
        </div>

        <form onSubmit={handleSave}>
          {/* Company details */}
          <div className="epp-section-title">Company Details</div>
          <div className="epp-grid2">
            {field("Company Name", "company_name", { placeholder: "Acme Corp" })}
            <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "#CBD5E1" }}>Industry</label>
              <select
                value={form.industry}
                onChange={(e) => handleChange("industry", e.target.value)}
              >
                <option value="">Select industry…</option>
                {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            {field("HQ Location",  "hq_location",  { placeholder: "Mumbai, India" })}
            {field("Website URL",  "website_url",  { type: "url", placeholder: "https://acme.com" })}
          </div>

          {/* About */}
          <div className="epp-section-title">About the Company</div>
          <RichTextEditor
            value={form.about}
            onChange={(html) => handleChange("about", html)}
            placeholder="Tell students about your company, culture, and what makes you unique…"
            maxWords={500}
            minHeight="200px"
          />

          {/* HR Contact */}
          <div className="epp-section-title">HR Contact Details</div>
          <div className="epp-grid2">
            {field("HR Contact Name",  "hr_contact_name",  { placeholder: "Jane Smith" })}
            {field("HR Email",         "hr_contact_email", { type: "email", placeholder: "hr@company.com" })}
            {field("HR Phone",         "hr_contact_phone", { type: "tel",   placeholder: "+91 98765 43210" })}
          </div>

          {/* Message */}
          {message && (
            <div className={`epp-msg ${message.type}`}>{message.text}</div>
          )}

          <button type="submit" className="epp-save-btn" disabled={saving}>
            {saving ? "Saving…" : "Save Profile"}
          </button>
        </form>
      </div>
    </>
  );
}
