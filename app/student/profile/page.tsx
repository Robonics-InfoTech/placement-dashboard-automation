"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase/client";

/* ─── Types ──────────────────────────────────────────────────────────────── */
type Tab = "personal" | "academic" | "skills";

type ProfileForm = {
  full_name: string;
  phone: string;
  dob: string;
  linkedin_url: string;
  github_url: string;
  portfolio_url: string;
  college_id: string;
  branch: string;
  course: string;
  specialization: string;
  semester: string;
  graduation_year: string;
  cgpa: string;
  active_backlogs: string;
  skills: string[];
};

/* ─── Icons ──────────────────────────────────────────────────────────────── */
const IconCamera = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
  </svg>
);
const IconSave = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
  </svg>
);
const IconX = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const BRANCHES = ["CSE", "IT", "ECE", "EEE", "ME", "CE", "CH", "BioTech", "MBA", "MCA", "Other"];
const COURSES  = ["B.Tech", "M.Tech", "BCA", "MCA", "BBA", "MBA", "B.Sc", "M.Sc", "Other"];

export default function StudentProfilePage() {
  const [tab, setTab] = useState<Tab>("personal");
  const [form, setForm] = useState<ProfileForm>({
    full_name: "", phone: "", dob: "", linkedin_url: "", github_url: "", portfolio_url: "",
    college_id: "", branch: "", course: "", specialization: "", semester: "",
    graduation_year: "", cgpa: "", active_backlogs: "0", skills: [],
  });
  const [skillInput, setSkillInput] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileForm, string>>>({});
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [college, setCollege] = useState<{ id: string; name: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      // Get public user + student profile joined
      const { data: publicUser } = await supabase
        .from("users")
        .select("id, full_name, phone, college_id, colleges!inner(id, name)")
        .eq("id", user.id)
        .single();

      const { data: sp } = await supabase
        .from("student_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (publicUser) {
        const col = (publicUser as unknown as { colleges: { id: string; name: string } }).colleges;
        if (col) setCollege(col);

        setForm((f) => ({
          ...f,
          full_name: (publicUser as { full_name?: string }).full_name ?? "",
          phone: (publicUser as { phone?: string }).phone ?? "",
          college_id: (publicUser as { college_id?: string }).college_id ?? "",
        }));
      }

      if (sp) {
        setForm((f) => ({
          ...f,
          phone: sp.phone ?? f.phone,
          linkedin_url: sp.linkedin_url ?? "",
          github_url: sp.github_url ?? "",
          portfolio_url: sp.portfolio_url ?? "",
          branch: sp.branch ?? "",
          course: sp.course ?? "",
          specialization: sp.specialization ?? "",
          semester: sp.semester ? String(sp.semester) : "",
          graduation_year: sp.graduation_year ? String(sp.graduation_year) : "",
          cgpa: sp.cgpa ? String(sp.cgpa) : "",
          active_backlogs: sp.active_backlogs ? String(sp.active_backlogs) : "0",
          skills: sp.skills ?? [],
        }));
        setPhotoUrl(sp.resume_url ? null : null); // photo stored in documents table
      }

      // Get photo from documents
      const { data: photoDocs } = await supabase
        .from("documents")
        .select("file_path")
        .eq("user_id", user.id)
        .eq("document_type", "photo")
        .is("deleted_at", null)
        .limit(1);
      if (photoDocs && photoDocs[0]) setPhotoUrl(photoDocs[0].file_path);

      setLoading(false);
    };
    init();
  }, []);

  /* ── Photo upload ── */
  const handlePhotoUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) { alert("Please select an image file."); return; }
    if (file.size > 5 * 1024 * 1024) { alert("Image must be under 5 MB."); return; }
    setPhotoUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("doc_type", "photo");
    try {
      const res = await fetch("/api/student/documents", { method: "POST", body: fd });
      const json = await res.json();
      if (json.url) setPhotoUrl(json.url);
    } catch { /* ignore */ }
    setPhotoUploading(false);
  };

  /* ── Skill tag helpers ── */
  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !form.skills.includes(s)) {
      setForm((f) => ({ ...f, skills: [...f.skills, s] }));
    }
    setSkillInput("");
  };
  const removeSkill = (s: string) => setForm((f) => ({ ...f, skills: f.skills.filter((x) => x !== s) }));

  /* ── Validation ── */
  const validate = (): boolean => {
    const errs: typeof errors = {};
    if (tab === "personal") {
      if (!form.full_name.trim()) errs.full_name = "Name is required";
      if (form.phone && !/^\+?[\d\s\-]{7,15}$/.test(form.phone)) errs.phone = "Invalid phone number";
    }
    if (tab === "academic") {
      if (!form.branch) errs.branch = "Branch is required";
      if (!form.course) errs.course = "Course is required";
      if (form.cgpa) {
        const n = parseFloat(form.cgpa);
        if (isNaN(n) || n < 0 || n > 10) errs.cgpa = "CGPA must be between 0.0 and 10.0";
      }
      if (form.graduation_year) {
        const y = parseInt(form.graduation_year);
        if (isNaN(y) || y < 2000 || y > 2040) errs.graduation_year = "Enter a valid graduation year";
      }
      if (form.active_backlogs) {
        const b = parseInt(form.active_backlogs);
        if (isNaN(b) || b < 0) errs.active_backlogs = "Backlog count cannot be negative";
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /* ── Save ── */
  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      // Update public users table
      await fetch("/api/student/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: form.full_name,
          phone: form.phone,
          branch: form.branch,
          course: form.course,
          specialization: form.specialization,
          semester: form.semester ? parseInt(form.semester) : null,
          graduation_year: form.graduation_year ? parseInt(form.graduation_year) : null,
          cgpa: form.cgpa ? parseFloat(form.cgpa) : null,
          active_backlogs: form.active_backlogs ? parseInt(form.active_backlogs) : 0,
          skills: form.skills,
          linkedin_url: form.linkedin_url,
          github_url: form.github_url,
          portfolio_url: form.portfolio_url,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { /* ignore */ }
    setSaving(false);
  };

  const f = (key: keyof ProfileForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [key]: e.target.value }));

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid rgba(99,102,241,.2)", borderTopColor: "#6366F1", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .sp-wrap { padding: 28px 32px; max-width: 860px; margin: 0 auto; }

        /* ── Tabs ── */
        .sp-tabs { display: flex; gap: 4px; margin-bottom: 24px; background: rgba(255,255,255,.04); padding: 4px; border-radius: 12px; border: 1px solid rgba(255,255,255,.07); }
        .sp-tab {
          flex: 1; padding: 9px 16px; border-radius: 9px; border: none; cursor: pointer;
          font-size: 13px; font-weight: 600; transition: all .18s; text-align: center;
          color: #64748B; background: transparent;
        }
        .sp-tab.active { background: rgba(99,102,241,.2); color: #A5B4FC; }
        .sp-tab:hover:not(.active) { color: #CBD5E1; background: rgba(255,255,255,.04); }

        /* ── Card ── */
        .sp-card { background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.07); border-radius: 18px; padding: 28px; }

        /* ── Photo section ── */
        .sp-photo-wrap { display: flex; align-items: center; gap: 24px; margin-bottom: 28px; padding-bottom: 28px; border-bottom: 1px solid rgba(255,255,255,.06); }
        .sp-photo {
          width: 88px; height: 88px; border-radius: 50%; flex-shrink: 0; position: relative;
          background: linear-gradient(135deg,#6366F1,#8B5CF6);
          display: flex; align-items: center; justify-content: center;
          font-size: 30px; font-weight: 800; color: white; cursor: pointer;
          border: 3px solid rgba(99,102,241,.3); overflow: hidden;
          transition: opacity .2s;
        }
        .sp-photo:hover { opacity: .85; }
        .sp-photo img { width: 100%; height: 100%; object-fit: cover; }
        .sp-photo-overlay {
          position: absolute; inset: 0; background: rgba(0,0,0,.55);
          display: flex; align-items: center; justify-content: center;
          opacity: 0; transition: opacity .2s; color: white;
        }
        .sp-photo:hover .sp-photo-overlay { opacity: 1; }
        .sp-photo-info h3 { font-size: 15px; font-weight: 700; color: white; }
        .sp-photo-info p  { font-size: 12px; color: #64748B; margin-top: 4px; }
        .sp-upload-btn {
          margin-top: 10px; padding: 7px 16px; border-radius: 8px; border: 1px solid rgba(99,102,241,.3);
          background: rgba(99,102,241,.1); color: #A5B4FC; font-size: 12px; font-weight: 600;
          cursor: pointer; transition: all .2s; display: inline-flex; align-items: center; gap: 7px;
        }
        .sp-upload-btn:hover { background: rgba(99,102,241,.18); }

        /* ── Form fields ── */
        .sp-field-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
        .sp-field      { display: flex; flex-direction: column; gap: 6px; }
        .sp-field.full { grid-column: 1 / -1; }
        .sp-label { font-size: 12px; font-weight: 600; color: #94A3B8; text-transform: uppercase; letter-spacing: .5px; }
        .sp-input {
          padding: 10px 14px; border-radius: 10px; font-size: 14px; color: #E2E8F0;
          background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1);
          outline: none; transition: border-color .18s, box-shadow .18s;
          font-family: inherit; width: 100%;
        }
        .sp-input:focus { border-color: rgba(99,102,241,.5); box-shadow: 0 0 0 3px rgba(99,102,241,.12); }
        .sp-input.error { border-color: rgba(239,68,68,.5); }
        .sp-error { font-size: 11px; color: #F87171; }
        select.sp-input option { background: #0E1629; }

        /* ── Skills tag input ── */
        .sp-tags-wrap {
          display: flex; flex-wrap: wrap; gap: 8px; align-items: center;
          min-height: 46px; padding: 8px 12px; border-radius: 10px;
          background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1);
          cursor: text;
        }
        .sp-tags-wrap:focus-within { border-color: rgba(99,102,241,.5); box-shadow: 0 0 0 3px rgba(99,102,241,.12); }
        .sp-tag {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600;
          background: rgba(99,102,241,.15); color: #A5B4FC; border: 1px solid rgba(99,102,241,.2);
          animation: sp-tag-in .15s ease;
        }
        @keyframes sp-tag-in { from { opacity: 0; transform: scale(.85); } to { opacity: 1; transform: scale(1); } }
        .sp-tag-remove { background: transparent; border: none; cursor: pointer; color: #818CF8; display: flex; padding: 0; opacity: .7; }
        .sp-tag-remove:hover { opacity: 1; color: #F87171; }
        .sp-tag-input { background: transparent; border: none; outline: none; color: #E2E8F0; font-family: inherit; font-size: 13px; flex: 1; min-width: 100px; }
        .sp-tag-hint { font-size: 11px; color: #475569; margin-top: 5px; }
        .sp-tag-suggest { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
        .sp-suggest-chip {
          padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600;
          background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.08);
          color: #94A3B8; cursor: pointer; transition: all .15s;
        }
        .sp-suggest-chip:hover { background: rgba(99,102,241,.12); color: #A5B4FC; border-color: rgba(99,102,241,.2); }

        /* ── Save bar ── */
        .sp-save-bar {
          display: flex; align-items: center; justify-content: flex-end; gap: 12px;
          margin-top: 24px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,.06);
        }
        .sp-save-btn {
          display: flex; align-items: center; gap: 8px; padding: 10px 24px;
          border-radius: 10px; border: none; cursor: pointer; font-size: 14px; font-weight: 700;
          background: linear-gradient(135deg,#6366F1,#8B5CF6); color: white;
          transition: opacity .2s, transform .15s;
        }
        .sp-save-btn:hover:not(:disabled) { opacity: .88; transform: translateY(-1px); }
        .sp-save-btn:disabled { opacity: .6; cursor: not-allowed; }
        .sp-saved-badge {
          display: flex; align-items: center; gap: 6px;
          font-size: 13px; font-weight: 600; color: #34D399;
          animation: sp-fade-in .3s ease;
        }
        @keyframes sp-fade-in { from { opacity: 0; } to { opacity: 1; } }

        /* ── Section header ── */
        .sp-section-title { font-size: 16px; font-weight: 700; color: white; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,.06); }

        /* ── College badge ── */
        .sp-college-badge {
          display: flex; align-items: center; gap: 10px;
          padding: 12px 16px; border-radius: 10px;
          background: rgba(99,102,241,.08); border: 1px solid rgba(99,102,241,.15);
          grid-column: 1 / -1;
        }
        .sp-college-icon { font-size: 20px; }
        .sp-college-name { font-size: 13px; font-weight: 600; color: #A5B4FC; }
        .sp-college-sub  { font-size: 11px; color: #64748B; }

        @media (max-width: 700px) {
          .sp-field-grid { grid-template-columns: 1fr; }
          .sp-wrap { padding: 16px; }
          .sp-photo-wrap { flex-direction: column; text-align: center; }
        }
      `}</style>

      <div className="sp-wrap">
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "white" }}>My Profile</h1>
          <p style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>Keep your information up-to-date to maximise placement opportunities.</p>
        </div>

        {/* Tabs */}
        <div className="sp-tabs">
          {(["personal", "academic", "skills"] as Tab[]).map((t) => (
            <button key={t} className={`sp-tab${tab === t ? " active" : ""}`} onClick={() => setTab(t)}>
              {t === "personal" ? "👤 Personal" : t === "academic" ? "🎓 Academic" : "⚡ Skills"}
            </button>
          ))}
        </div>

        <div className="sp-card">
          {/* ── Personal Tab ── */}
          {tab === "personal" && (
            <>
              <div className="sp-section-title">Personal Information</div>

              {/* Photo upload */}
              <div className="sp-photo-wrap">
                <div className="sp-photo" onClick={() => fileRef.current?.click()}>
                  {photoUrl ? (
                    <img src={photoUrl} alt="Profile" />
                  ) : (
                    <span>{form.full_name ? form.full_name[0]?.toUpperCase() : "?"}</span>
                  )}
                  <div className="sp-photo-overlay"><IconCamera /></div>
                  {photoUploading && (
                    <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ width: 24, height: 24, borderRadius: "50%", border: "2px solid rgba(255,255,255,.3)", borderTopColor: "white", animation: "spin 0.8s linear infinite" }} />
                    </div>
                  )}
                </div>
                <div className="sp-photo-info">
                  <h3>{form.full_name || "Your Name"}</h3>
                  <p>Student · {college?.name ?? "College not linked"}</p>
                  <button className="sp-upload-btn" onClick={() => fileRef.current?.click()}>
                    <IconCamera /> Change Photo
                  </button>
                </div>
                <input
                  ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
                  onChange={(e) => { if (e.target.files?.[0]) handlePhotoUpload(e.target.files[0]); }}
                />
              </div>

              <div className="sp-field-grid">
                <div className="sp-field">
                  <label className="sp-label">Full Name *</label>
                  <input className={`sp-input${errors.full_name ? " error" : ""}`} value={form.full_name} onChange={f("full_name")} placeholder="e.g. Priya Sharma" />
                  {errors.full_name && <span className="sp-error">{errors.full_name}</span>}
                </div>
                <div className="sp-field">
                  <label className="sp-label">Date of Birth</label>
                  <input className="sp-input" type="date" value={form.dob} onChange={f("dob")} />
                </div>
                <div className="sp-field">
                  <label className="sp-label">Phone Number</label>
                  <input className={`sp-input${errors.phone ? " error" : ""}`} value={form.phone} onChange={f("phone")} placeholder="+91 98765 43210" />
                  {errors.phone && <span className="sp-error">{errors.phone}</span>}
                </div>
                <div className="sp-field">
                  <label className="sp-label">LinkedIn URL</label>
                  <input className="sp-input" value={form.linkedin_url} onChange={f("linkedin_url")} placeholder="linkedin.com/in/your-profile" />
                </div>
                <div className="sp-field">
                  <label className="sp-label">GitHub URL</label>
                  <input className="sp-input" value={form.github_url} onChange={f("github_url")} placeholder="github.com/username" />
                </div>
                <div className="sp-field">
                  <label className="sp-label">Portfolio URL</label>
                  <input className="sp-input" value={form.portfolio_url} onChange={f("portfolio_url")} placeholder="yoursite.dev" />
                </div>
              </div>
            </>
          )}

          {/* ── Academic Tab ── */}
          {tab === "academic" && (
            <>
              <div className="sp-section-title">Academic Information</div>
              <div className="sp-field-grid">
                {college && (
                  <div className="sp-college-badge">
                    <span className="sp-college-icon">🏫</span>
                    <div>
                      <div className="sp-college-name">{college.name}</div>
                      <div className="sp-college-sub">Your enrolled institution</div>
                    </div>
                  </div>
                )}
                <div className="sp-field">
                  <label className="sp-label">Course *</label>
                  <select className={`sp-input${errors.course ? " error" : ""}`} value={form.course} onChange={f("course")}>
                    <option value="">Select course</option>
                    {COURSES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.course && <span className="sp-error">{errors.course}</span>}
                </div>
                <div className="sp-field">
                  <label className="sp-label">Branch *</label>
                  <select className={`sp-input${errors.branch ? " error" : ""}`} value={form.branch} onChange={f("branch")}>
                    <option value="">Select branch</option>
                    {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                  {errors.branch && <span className="sp-error">{errors.branch}</span>}
                </div>
                <div className="sp-field">
                  <label className="sp-label">Specialization</label>
                  <input className="sp-input" value={form.specialization} onChange={f("specialization")} placeholder="e.g. Machine Learning" />
                </div>
                <div className="sp-field">
                  <label className="sp-label">Current Semester</label>
                  <input className="sp-input" type="number" min="1" max="12" value={form.semester} onChange={f("semester")} placeholder="e.g. 6" />
                </div>
                <div className="sp-field">
                  <label className="sp-label">Graduation Year</label>
                  <input className={`sp-input${errors.graduation_year ? " error" : ""}`} type="number" min="2020" max="2040" value={form.graduation_year} onChange={f("graduation_year")} placeholder="e.g. 2026" />
                  {errors.graduation_year && <span className="sp-error">{errors.graduation_year}</span>}
                </div>
                <div className="sp-field">
                  <label className="sp-label">CGPA <span style={{ color: "#64748B", fontWeight: 400 }}>(0.0 – 10.0)</span></label>
                  <input
                    className={`sp-input${errors.cgpa ? " error" : ""}`}
                    type="number" step="0.01" min="0" max="10"
                    value={form.cgpa} onChange={f("cgpa")} placeholder="e.g. 8.75"
                  />
                  {errors.cgpa && <span className="sp-error">{errors.cgpa}</span>}
                </div>
                <div className="sp-field">
                  <label className="sp-label">Active Backlogs</label>
                  <input className={`sp-input${errors.active_backlogs ? " error" : ""}`} type="number" min="0" value={form.active_backlogs} onChange={f("active_backlogs")} placeholder="0" />
                  {errors.active_backlogs && <span className="sp-error">{errors.active_backlogs}</span>}
                </div>
              </div>
            </>
          )}

          {/* ── Skills Tab ── */}
          {tab === "skills" && (
            <>
              <div className="sp-section-title">Skills & Technologies</div>
              <div className="sp-field">
                <label className="sp-label">Your Skills</label>
                <div className="sp-tags-wrap" onClick={() => document.getElementById("skill-input")?.focus()}>
                  {form.skills.map((s) => (
                    <span key={s} className="sp-tag">
                      {s}
                      <button className="sp-tag-remove" onClick={() => removeSkill(s)}><IconX /></button>
                    </span>
                  ))}
                  <input
                    id="skill-input"
                    className="sp-tag-input"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addSkill(); }
                      if (e.key === "Backspace" && !skillInput && form.skills.length) {
                        setForm((f) => ({ ...f, skills: f.skills.slice(0, -1) }));
                      }
                    }}
                    placeholder={form.skills.length === 0 ? "Type a skill and press Enter…" : "Add more…"}
                  />
                </div>
                <p className="sp-tag-hint">Press Enter or comma to add a skill. Backspace to remove the last one.</p>
              </div>

              {/* Suggestions */}
              <div style={{ marginTop: 18 }}>
                <div style={{ fontSize: 12, color: "#64748B", marginBottom: 8, fontWeight: 600 }}>POPULAR SKILLS</div>
                <div className="sp-tag-suggest">
                  {["React", "Node.js", "Python", "Java", "C++", "SQL", "Machine Learning", "Data Analysis", "AWS", "Docker", "TypeScript", "MongoDB", "Figma", "Excel", "Communication"].filter((s) => !form.skills.includes(s)).map((s) => (
                    <button key={s} className="sp-suggest-chip" onClick={() => setForm((f) => ({ ...f, skills: [...f.skills, s] }))}>
                      + {s}
                    </button>
                  ))}
                </div>
              </div>

              {form.skills.length > 0 && (
                <div style={{ marginTop: 20, padding: "14px 16px", borderRadius: 10, background: "rgba(16,185,129,.06)", border: "1px solid rgba(16,185,129,.15)" }}>
                  <div style={{ fontSize: 12, color: "#34D399", fontWeight: 700, marginBottom: 8 }}>{form.skills.length} skills added</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {form.skills.map((s) => (
                      <span key={s} style={{ padding: "3px 10px", borderRadius: 20, fontSize: 12, background: "rgba(16,185,129,.12)", color: "#34D399", border: "1px solid rgba(16,185,129,.2)" }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── Save bar ── */}
          <div className="sp-save-bar">
            {saved && (
              <div className="sp-saved-badge">
                <IconCheck /> Profile saved successfully!
              </div>
            )}
            <button className="sp-save-btn" onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(255,255,255,.3)", borderTopColor: "white", animation: "spin 0.8s linear infinite" }} />
                  Saving…
                </>
              ) : (
                <><IconSave /> Save Changes</>
              )}
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
