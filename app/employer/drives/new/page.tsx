"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Job { id: string; title: string; }
interface RoundRow { name: string; duration_min: string; format: string; }

const ROUND_FORMATS = ["Online", "In-person", "Video call", "Written", "Group"];

export default function NewDrivePage() {
  const router = useRouter();
  const [jobs, setJobs]       = useState<Job[]>([]);
  const [form, setForm]       = useState({
    name:         "",
    job_ids:      [] as string[],
    drive_date:   "",
    venue_type:   "physical" as "physical" | "virtual",
    venue:        "",
    max_students: "",
  });
  const [rounds, setRounds]   = useState<RoundRow[]>([]);
  const [conflict, setConflict] = useState<{ name: string; drive_date: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]     = useState("");

  /* ── Load active jobs ─────────────────────────────────────────────── */
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/employer/jobs");
      if (res.ok) {
        const json = await res.json();
        setJobs((json.data ?? []).filter((j: { status: string }) => j.status === "active"));
      }
    })();
  }, []);

  /* ── Conflict detection ──────────────────────────────────────────── */
  const checkConflict = async (date: string) => {
    if (!date) return;
    const dateOnly = date.split("T")[0];
    // Get college_id from profile (fetched client-side)
    const profileRes = await fetch("/api/employer/profile");
    if (!profileRes.ok) return;
    const { data: profile } = await profileRes.json();
    if (!profile?.college_id) return;

    const res = await fetch(
      `/api/employer/drives/conflicts?date=${dateOnly}&college_id=${profile.college_id}`
    );
    if (res.ok) {
      const json = await res.json();
      setConflict(json.drives ?? []);
    }
  };

  /* ── Round management ────────────────────────────────────────────── */
  const addRound = () =>
    setRounds((r) => [...r, { name: "", duration_min: "60", format: "In-person" }]);

  const updateRound = (i: number, field: keyof RoundRow, val: string) =>
    setRounds((r) => r.map((row, idx) => idx === i ? { ...row, [field]: val } : row));

  const removeRound = (i: number) =>
    setRounds((r) => r.filter((_, idx) => idx !== i));

  /* ── Toggle job selection ────────────────────────────────────────── */
  const toggleJob = (id: string) =>
    setForm((f) => ({
      ...f,
      job_ids: f.job_ids.includes(id)
        ? f.job_ids.filter((j) => j !== id)
        : [...f.job_ids, id],
    }));

  /* ── Submit ───────────────────────────────────────────────────────── */
  const handleSubmit = async () => {
    setError("");
    if (!form.name.trim()) { setError("Drive name is required."); return; }
    if (!form.drive_date)  { setError("Date and time is required."); return; }
    if (!form.venue.trim()) { setError(`${form.venue_type === "physical" ? "Venue address" : "Meeting link"} is required.`); return; }

    setSubmitting(true);
    const res = await fetch("/api/employer/drives", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        rounds_schedule: rounds.map((r) => ({ ...r, duration_min: Number(r.duration_min) })),
        max_students: form.max_students ? Number(form.max_students) : null,
      }),
    });
    const json = await res.json();
    if (!res.ok) { setError(json.message ?? "Failed to schedule drive."); setSubmitting(false); return; }
    router.push("/employer/drives");
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
        .ndp-topbar { padding: 22px 32px; border-bottom: 1px solid rgba(255,255,255,.07); background: rgba(255,255,255,.02); }
        .ndp-topbar h2 { font-size: 20px; font-weight: 700; color: white; }
        .ndp-topbar p  { font-size: 13px; color: #64748B; margin-top: 2px; }
        .ndp-content { padding: 28px 32px; max-width: 720px; }
        .ndp-section { margin-bottom: 20px; }
        .ndp-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

        .ndp-toggle { display: flex; gap: 0; border: 1px solid rgba(255,255,255,.1); border-radius: 10px; overflow: hidden; }
        .ndp-toggle-btn { flex: 1; padding: 10px; border: none; cursor: pointer; font-size: 13px; font-weight: 600; transition: all .2s; background: transparent; color: #64748B; }
        .ndp-toggle-btn.active { background: rgba(14,165,233,.15); color: #38BDF8; }

        .ndp-conflict-warn { padding: 10px 14px; border-radius: 9px; background: rgba(245,158,11,.1); border: 1px solid rgba(245,158,11,.25); color: #FCD34D; font-size: 13px; margin-top: 8px; }

        .ndp-job-item {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 13px; border-radius: 9px; margin-bottom: 8px;
          border: 1px solid rgba(255,255,255,.08); cursor: pointer; transition: all .2s;
          font-size: 13px; font-weight: 500; color: #94A3B8;
        }
        .ndp-job-item:hover { background: rgba(255,255,255,.04); }
        .ndp-job-item.selected { background: rgba(14,165,233,.1); border-color: rgba(14,165,233,.25); color: #38BDF8; }

        .ndp-round-row {
          display: grid; grid-template-columns: 1fr 100px 130px 36px;
          gap: 10px; margin-bottom: 10px; align-items: center;
        }
        .ndp-add-round {
          padding: 9px 16px; border-radius: 9px; border: 1px dashed rgba(255,255,255,.15);
          background: transparent; cursor: pointer; font-size: 13px; font-weight: 600;
          color: #64748B; transition: all .2s; width: 100%; margin-top: 4px;
        }
        .ndp-add-round:hover { border-color: #0EA5E9; color: #38BDF8; }
        .ndp-del-btn { padding: 8px; border-radius: 7px; border: none; cursor: pointer; background: rgba(239,68,68,.1); color: #FCA5A5; font-size: 14px; }

        .ndp-submit-btn { margin-top: 28px; padding: 12px 28px; border-radius: 11px; border: none; cursor: pointer; background: linear-gradient(135deg,#0EA5E9,#6366F1); color: white; font-size: 14px; font-weight: 700; transition: opacity .2s; }
        .ndp-submit-btn:hover { opacity: .88; }
        .ndp-submit-btn:disabled { opacity: .5; cursor: not-allowed; }
        .ndp-error { padding: 10px 14px; border-radius: 9px; background: rgba(239,68,68,.1); border: 1px solid rgba(239,68,68,.2); color: #FCA5A5; font-size: 13px; font-weight: 600; margin-top: 12px; }
        input:focus { border-color: #0EA5E9 !important; }
        select { padding: 10px 12px; border-radius: 10px; font-size: 13px; background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.1); color: white; outline: none; width: 100%; }
        select option { background: #1E293B; }
      `}</style>

      <div className="ndp-topbar">
        <h2>Schedule a Drive</h2>
        <p>Create a recruitment event linked to your active job postings.</p>
      </div>

      <div className="ndp-content">
        {/* Drive name */}
        <div className="ndp-section">
          <label style={labelStyle}>Drive Name *</label>
          <input style={inputStyle} value={form.name} placeholder="e.g. Campus Recruitment Drive 2026"
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        </div>

        {/* Associated jobs */}
        <div className="ndp-section">
          <label style={labelStyle}>Associated Job(s)</label>
          {jobs.length === 0 ? (
            <p style={{ color: "#64748B", fontSize: 13 }}>No active jobs found. Publish and get a job approved first.</p>
          ) : (
            jobs.map((job) => (
              <div key={job.id} className={`ndp-job-item${form.job_ids.includes(job.id) ? " selected" : ""}`}
                onClick={() => toggleJob(job.id)}>
                <span>{form.job_ids.includes(job.id) ? "☑" : "☐"}</span>
                <span>{job.title}</span>
              </div>
            ))
          )}
        </div>

        {/* Date + conflict */}
        <div className="ndp-section">
          <label style={labelStyle}>Date & Time *</label>
          <input style={inputStyle} type="datetime-local" value={form.drive_date}
            onChange={(e) => { setForm((f) => ({ ...f, drive_date: e.target.value })); checkConflict(e.target.value); }}
          />
          {conflict.length > 0 && (
            <div className="ndp-conflict-warn">
              ⚠ Another drive is scheduled on this date for your college:{" "}
              <strong>{conflict.map((c) => c.name).join(", ")}</strong>. You can still proceed.
            </div>
          )}
        </div>

        {/* Venue */}
        <div className="ndp-section">
          <label style={labelStyle}>Venue Type</label>
          <div className="ndp-toggle">
            {(["physical", "virtual"] as const).map((t) => (
              <button key={t} className={`ndp-toggle-btn${form.venue_type === t ? " active" : ""}`}
                onClick={() => setForm((f) => ({ ...f, venue_type: t, venue: "" }))}>
                {t === "physical" ? "🏢 Physical" : "💻 Virtual"}
              </button>
            ))}
          </div>
          <div style={{ marginTop: 12 }}>
            <input style={inputStyle} value={form.venue}
              placeholder={form.venue_type === "physical" ? "Enter venue address…" : "Enter meeting link (Zoom / Meet / Teams)…"}
              onChange={(e) => setForm((f) => ({ ...f, venue: e.target.value }))} />
          </div>
        </div>

        {/* Rounds schedule */}
        <div className="ndp-section">
          <label style={labelStyle}>Rounds Schedule</label>
          {rounds.map((r, i) => (
            <div key={i} className="ndp-round-row">
              <input style={inputStyle} value={r.name} placeholder="Round name"
                onChange={(e) => updateRound(i, "name", e.target.value)} />
              <input style={inputStyle} type="number" value={r.duration_min} placeholder="Min"
                onChange={(e) => updateRound(i, "duration_min", e.target.value)} />
              <select value={r.format} onChange={(e) => updateRound(i, "format", e.target.value)}>
                {ROUND_FORMATS.map((f) => <option key={f}>{f}</option>)}
              </select>
              <button className="ndp-del-btn" onClick={() => removeRound(i)}>✕</button>
            </div>
          ))}
          <button className="ndp-add-round" onClick={addRound}>+ Add Round</button>
        </div>

        {/* Max students */}
        <div className="ndp-section">
          <label style={labelStyle}>Maximum Students Allowed (optional)</label>
          <input style={{ ...inputStyle, maxWidth: 200 }} type="number" min={1} value={form.max_students}
            placeholder="e.g. 100" onChange={(e) => setForm((f) => ({ ...f, max_students: e.target.value }))} />
        </div>

        {error && <div className="ndp-error">{error}</div>}

        <button className="ndp-submit-btn" onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Scheduling…" : "🗓 Schedule Drive"}
        </button>
      </div>
    </>
  );
}
