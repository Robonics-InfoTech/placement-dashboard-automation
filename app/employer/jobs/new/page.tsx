"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const RichTextEditor = dynamic(
  () => import("@/components/employer/RichTextEditor"),
  { ssr: false, loading: () => <div style={{ height: 200, background: "rgba(255,255,255,.04)", borderRadius: 12 }} /> }
);

/* ─── constants ─────────────────────────────────────────────────────────── */
const BRANCHES   = ["CSE", "ECE", "IT", "MECH", "CIVIL", "EEE", "MBA", "Other"];
const ROUNDS_OPT = ["Aptitude Test", "Group Discussion", "Technical Interview", "HR Interview", "Case Study"];
const JOB_TYPES  = [
  { value: "full_time",   label: "Full-time" },
  { value: "internship",  label: "Internship" },
  { value: "ppo",         label: "PPO (Pre-Placement Offer)" },
];
const CURRENT_YEAR = new Date().getFullYear();
const BATCH_YEARS  = [CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1, CURRENT_YEAR + 2];

/* ─── form state ────────────────────────────────────────────────────────── */
interface FormState {
  // Step 1
  title: string;
  description: string;
  job_type: string;
  location: string;
  is_remote: boolean;
  ctc_min: string;
  ctc_max: string;
  openings: string;
  deadline: string;
  // Step 2
  min_cgpa: number;
  allowed_branches: string[];
  max_backlogs: string;
  batch_years: number[];
  // Step 3
  selection_rounds: string[];
}

const INITIAL: FormState = {
  title: "", description: "", job_type: "full_time",
  location: "", is_remote: false, ctc_min: "", ctc_max: "",
  openings: "1", deadline: "",
  min_cgpa: 6.0, allowed_branches: [], max_backlogs: "0", batch_years: [],
  selection_rounds: [],
};

/* ─── shared input style ────────────────────────────────────────────────── */
const inputStyle: React.CSSProperties = {
  padding: "11px 14px", borderRadius: "10px", fontSize: "14px",
  background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)",
  color: "white", outline: "none", width: "100%",
};
const labelStyle: React.CSSProperties = { fontSize: "13px", fontWeight: 600, color: "#CBD5E1" };

/* ─── component ─────────────────────────────────────────────────────────── */
export default function NewJobPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const toggleBranch = (b: string) =>
    set("allowed_branches",
      form.allowed_branches.includes(b)
        ? form.allowed_branches.filter((x) => x !== b)
        : [...form.allowed_branches, b]
    );

  const toggleBatchYear = (y: number) =>
    set("batch_years",
      form.batch_years.includes(y)
        ? form.batch_years.filter((x) => x !== y)
        : [...form.batch_years, y]
    );

  const toggleRound = (r: string) =>
    set("selection_rounds",
      form.selection_rounds.includes(r)
        ? form.selection_rounds.filter((x) => x !== r)
        : [...form.selection_rounds, r]
    );

  /* ── validation ──────────────────────────────────────────────────────── */
  const validateStep1 = () => {
    if (!form.title.trim())       return "Job title is required.";
    if (!form.description || form.description === "<p></p>") return "Job description is required.";
    if (!form.location.trim() && !form.is_remote) return "Location is required.";
    if (!form.deadline)           return "Application deadline is required.";
    if (new Date(form.deadline) <= new Date()) return "Deadline must be a future date.";
    if (Number(form.openings) < 1) return "Number of openings must be at least 1.";
    return null;
  };

  const validateStep2 = () => {
    if (form.allowed_branches.length === 0) return "Select at least one allowed branch.";
    if (form.batch_years.length === 0)      return "Select at least one batch year.";
    return null;
  };

  const next = () => {
    setError("");
    const err = step === 1 ? validateStep1() : step === 2 ? validateStep2() : null;
    if (err) { setError(err); return; }
    setStep((s) => s + 1);
  };

  const submit = async () => {
    setError("");
    setSubmitting(true);
    const payload = {
      title:            form.title,
      description:      form.description,
      job_type:         form.job_type,
      location:         form.is_remote ? "Remote" : form.location,
      ctc_min:          form.ctc_min ? Number(form.ctc_min) : null,
      ctc_max:          form.ctc_max ? Number(form.ctc_max) : null,
      openings:         Number(form.openings),
      deadline:         form.deadline,
      min_cgpa:         form.min_cgpa,
      allowed_branches: form.allowed_branches,
      max_backlogs:     Number(form.max_backlogs),
      batch_years:      form.batch_years,
      selection_rounds: form.selection_rounds.map((name, idx) => ({ order: idx + 1, name })),
    };

    const res = await fetch("/api/employer/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.message ?? "Submission failed.");
      setSubmitting(false);
      return;
    }
    router.push("/employer/jobs");
  };

  /* ── step indicator ───────────────────────────────────────────────────── */
  const STEPS = ["Basic Info", "Eligibility", "Selection Process"];

  return (
    <>
      <style>{`
        .njp-topbar { padding: 22px 32px; border-bottom: 1px solid rgba(255,255,255,.07); background: rgba(255,255,255,.02); }
        .njp-topbar h2 { font-size: 20px; font-weight: 700; color: white; }
        .njp-topbar p  { font-size: 13px; color: #64748B; margin-top: 2px; }
        .njp-content { padding: 28px 32px; max-width: 720px; }

        /* Steps */
        .njp-steps { display: flex; align-items: center; gap: 0; margin-bottom: 32px; }
        .njp-step-item { display: flex; align-items: center; gap: 10px; }
        .njp-step-num {
          width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center;
          justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0;
        }
        .njp-step-num.done    { background: #0EA5E9; color: white; }
        .njp-step-num.current { background: linear-gradient(135deg,#0EA5E9,#6366F1); color: white; }
        .njp-step-num.future  { background: rgba(255,255,255,.08); color: #64748B; }
        .njp-step-label { font-size: 13px; font-weight: 600; color: #94A3B8; }
        .njp-step-label.current { color: white; }
        .njp-step-divider { flex: 1; height: 1px; background: rgba(255,255,255,.1); margin: 0 12px; min-width: 30px; }

        /* Form */
        .njp-section { margin-bottom: 20px; display: flex; flex-direction: column; gap: 7px; }
        .njp-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
        .njp-grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 16px; }
        .njp-label { font-size: 13px; font-weight: 600; color: #CBD5E1; margin-bottom: 7px; display: block; }

        /* Radio / Checkbox groups */
        .njp-radio-group { display: flex; flex-wrap: wrap; gap: 10px; }
        .njp-radio-btn {
          padding: 8px 16px; border-radius: 8px; cursor: pointer;
          font-size: 13px; font-weight: 600; border: 1px solid rgba(255,255,255,.1);
          background: rgba(255,255,255,.04); color: #94A3B8; transition: all .2s; user-select: none;
        }
        .njp-radio-btn.selected { background: rgba(14,165,233,.15); border-color: rgba(14,165,233,.35); color: #38BDF8; }

        /* CGPA slider */
        .njp-slider { width: 100%; accent-color: #0EA5E9; }

        /* Rounds drag list */
        .njp-round-chip {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 14px; border-radius: 10px; margin-bottom: 8px;
          background: rgba(99,102,241,.1); border: 1px solid rgba(99,102,241,.2);
          font-size: 13px; font-weight: 600; color: #A78BFA; cursor: pointer;
        }
        .njp-round-chip.selected { background: rgba(99,102,241,.2); border-color: rgba(99,102,241,.4); }
        .njp-round-chip .check { margin-left: auto; }

        /* Nav buttons */
        .njp-nav { display: flex; gap: 12px; margin-top: 28px; }
        .njp-btn { padding: 11px 24px; border-radius: 10px; border: none; cursor: pointer; font-size: 14px; font-weight: 600; transition: all .2s; }
        .njp-btn.primary { background: linear-gradient(135deg,#0EA5E9,#6366F1); color: white; }
        .njp-btn.primary:hover { opacity: .88; }
        .njp-btn.primary:disabled { opacity: .5; cursor: not-allowed; }
        .njp-btn.secondary { background: rgba(255,255,255,.07); color: #94A3B8; border: 1px solid rgba(255,255,255,.1); }
        .njp-btn.secondary:hover { background: rgba(255,255,255,.1); }

        .njp-error { padding: 10px 14px; border-radius: 9px; background: rgba(239,68,68,.1); border: 1px solid rgba(239,68,68,.2); color: #FCA5A5; font-size: 13px; font-weight: 600; margin-top: 12px; }

        input[type="range"] { cursor: pointer; }
        input:focus { border-color: #0EA5E9 !important; box-shadow: 0 0 0 3px rgba(14,165,233,.15); }
        select { padding: 11px 14px; border-radius: 10px; font-size: 14px; background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.1); color: white; outline: none; width: 100%; }
        select option { background: #1E293B; }
      `}</style>

      <div className="njp-topbar">
        <h2>Post a New Job</h2>
        <p>Fill in all details. The job will go live after college admin approval.</p>
      </div>

      <div className="njp-content">
        {/* Step indicator */}
        <div className="njp-steps">
          {STEPS.map((label, i) => {
            const n = i + 1;
            const state = n < step ? "done" : n === step ? "current" : "future";
            return (
              <div key={label} style={{ display: "flex", alignItems: "center", flex: n < STEPS.length ? 1 : 0 }}>
                <div className="njp-step-item">
                  <div className={`njp-step-num ${state}`}>
                    {state === "done" ? "✓" : n}
                  </div>
                  <div className={`njp-step-label${state === "current" ? " current" : ""}`}>{label}</div>
                </div>
                {n < STEPS.length && <div className="njp-step-divider" />}
              </div>
            );
          })}
        </div>

        {/* ── Step 1: Basic Info ──────────────────────────────────────── */}
        {step === 1 && (
          <>
            <div className="njp-section">
              <label className="njp-label">Role Title *</label>
              <input style={inputStyle} value={form.title} placeholder="e.g. Software Engineer"
                onChange={(e) => set("title", e.target.value)} />
            </div>

            <div className="njp-section">
              <label className="njp-label">Job Type *</label>
              <div className="njp-radio-group">
                {JOB_TYPES.map((t) => (
                  <div key={t.value}
                    className={`njp-radio-btn${form.job_type === t.value ? " selected" : ""}`}
                    onClick={() => set("job_type", t.value)}
                  >{t.label}</div>
                ))}
              </div>
            </div>

            <div className="njp-section">
              <label className="njp-label">Job Description *</label>
              <RichTextEditor
                value={form.description}
                onChange={(html) => set("description", html)}
                placeholder="Describe the role, responsibilities, and what you're looking for…"
                minHeight="200px"
              />
            </div>

            <div className="njp-grid2">
              <div className="njp-section">
                <label className="njp-label">Location *</label>
                <input style={inputStyle} value={form.location} placeholder="City or 'Remote'"
                  disabled={form.is_remote}
                  onChange={(e) => set("location", e.target.value)} />
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#94A3B8", marginTop: 6, cursor: "pointer" }}>
                  <input type="checkbox" checked={form.is_remote}
                    onChange={(e) => { set("is_remote", e.target.checked); if (e.target.checked) set("location", ""); }}
                  /> Remote position
                </label>
              </div>
              <div className="njp-section">
                <label className="njp-label">Number of Openings *</label>
                <input style={inputStyle} type="number" min={1} value={form.openings}
                  onChange={(e) => set("openings", e.target.value)} />
              </div>
            </div>

            <div className="njp-grid2">
              <div className="njp-section">
                <label className="njp-label">CTC Min (LPA)</label>
                <input style={inputStyle} type="number" step="0.5" placeholder="e.g. 4.5"
                  value={form.ctc_min} onChange={(e) => set("ctc_min", e.target.value)} />
              </div>
              <div className="njp-section">
                <label className="njp-label">CTC Max (LPA)</label>
                <input style={inputStyle} type="number" step="0.5" placeholder="e.g. 8.0"
                  value={form.ctc_max} onChange={(e) => set("ctc_max", e.target.value)} />
              </div>
            </div>

            <div className="njp-section">
              <label className="njp-label">Application Deadline *</label>
              <input style={inputStyle} type="date" value={form.deadline}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => set("deadline", e.target.value)} />
            </div>
          </>
        )}

        {/* ── Step 2: Eligibility ─────────────────────────────────────── */}
        {step === 2 && (
          <>
            <div className="njp-section">
              <label className="njp-label">
                Minimum CGPA: <strong style={{ color: "#38BDF8" }}>{form.min_cgpa.toFixed(1)}</strong>
              </label>
              <input type="range" className="njp-slider"
                min={0} max={10} step={0.1}
                value={form.min_cgpa}
                onChange={(e) => set("min_cgpa", parseFloat(e.target.value))}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748B", marginTop: 4 }}>
                <span>0.0</span><span>5.0</span><span>10.0</span>
              </div>
            </div>

            <div className="njp-section">
              <label className="njp-label">Allowed Branches *</label>
              <div className="njp-radio-group">
                {BRANCHES.map((b) => (
                  <div key={b}
                    className={`njp-radio-btn${form.allowed_branches.includes(b) ? " selected" : ""}`}
                    onClick={() => toggleBranch(b)}
                  >{b}</div>
                ))}
              </div>
            </div>

            <div className="njp-grid2">
              <div className="njp-section">
                <label className="njp-label">Maximum Active Backlogs Allowed</label>
                <input style={inputStyle} type="number" min={0} value={form.max_backlogs}
                  onChange={(e) => set("max_backlogs", e.target.value)} />
                <small style={{ color: "#64748B", fontSize: 12 }}>Enter 0 for no backlogs allowed.</small>
              </div>
              <div className="njp-section">
                <label className="njp-label">Eligible Batch Year(s) *</label>
                <div className="njp-radio-group" style={{ marginTop: 4 }}>
                  {BATCH_YEARS.map((y) => (
                    <div key={y}
                      className={`njp-radio-btn${form.batch_years.includes(y) ? " selected" : ""}`}
                      onClick={() => toggleBatchYear(y)}
                    >{y}</div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── Step 3: Selection Process ────────────────────────────────── */}
        {step === 3 && (
          <>
            <div className="njp-section">
              <label className="njp-label">Select Rounds (in order)</label>
              <p style={{ fontSize: 13, color: "#64748B", marginBottom: 14 }}>
                Click to add/remove. The order shown is the order they'll appear to students.
              </p>
              {ROUNDS_OPT.map((r, i) => {
                const selected = form.selection_rounds.includes(r);
                const idx      = form.selection_rounds.indexOf(r);
                return (
                  <div key={r} className={`njp-round-chip${selected ? " selected" : ""}`}
                    onClick={() => toggleRound(r)}>
                    <span style={{ fontSize: 18 }}>{selected ? "☑" : "☐"}</span>
                    <span>{r}</span>
                    {selected && (
                      <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700,
                        background: "rgba(99,102,241,.3)", padding: "2px 8px", borderRadius: 20, color: "#C4B5FD" }}>
                        Round {idx + 1}
                      </span>
                    )}
                  </div>
                );
              })}
              {form.selection_rounds.length === 0 && (
                <p style={{ fontSize: 12, color: "#F59E0B", marginTop: 8 }}>
                  ⚠ No rounds selected — students will see the job but no round information.
                </p>
              )}
            </div>
          </>
        )}

        {/* Error */}
        {error && <div className="njp-error">{error}</div>}

        {/* Navigation */}
        <div className="njp-nav">
          {step > 1 && (
            <button className="njp-btn secondary" onClick={() => { setError(""); setStep((s) => s - 1); }}>
              ← Back
            </button>
          )}
          {step < 3 ? (
            <button className="njp-btn primary" onClick={next}>
              Continue →
            </button>
          ) : (
            <button className="njp-btn primary" onClick={submit} disabled={submitting}>
              {submitting ? "Submitting…" : "Submit for Approval"}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
