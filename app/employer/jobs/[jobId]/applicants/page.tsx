"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import StatusChip from "@/components/employer/StatusChip";

interface Applicant {
  id: string;
  status: string;
  rejection_reason: string | null;
  current_round: number;
  applied_at: string;
  student_profiles: {
    id: string;
    full_name: string | null;
    branch: string;
    cgpa: number;
    resume_url: string | null;
    enrollment_number: string;
  } | null;
}

const STATUS_FLOW = ["applied", "shortlisted", "round_1", "round_2", "round_3", "round_4", "offer_extended"];

export default function ApplicantsPage() {
  const params   = useParams<{ jobId: string }>();
  const jobId    = params.jobId;

  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading]       = useState(true);
  const [selected, setSelected]     = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState("all");

  // Reject modal
  const [rejectModal, setRejectModal] = useState<{ appId: string | "bulk"; ids?: string[] } | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [submitting, setSubmitting]   = useState(false);
  const [message, setMessage]         = useState<{ type: "success" | "error"; text: string } | null>(null);

  /* ── Fetch ─────────────────────────────────────────────────────────── */
  const fetchApplicants = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/employer/jobs/${jobId}/applicants`);
    if (res.ok) {
      const json = await res.json();
      setApplicants(json.data ?? []);
    }
    setLoading(false);
  }, [jobId]);

  useEffect(() => { fetchApplicants(); }, [fetchApplicants]);

  /* ── Filtering ──────────────────────────────────────────────────────── */
  const filtered = filterStatus === "all"
    ? applicants
    : applicants.filter((a) => a.status === filterStatus);

  /* ── Selection ──────────────────────────────────────────────────────── */
  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };
  const toggleAll = () => {
    setSelected(selected.size === filtered.length ? new Set() : new Set(filtered.map((a) => a.id)));
  };

  /* ── Single status update ───────────────────────────────────────────── */
  const updateStatus = async (appId: string, status: string, rejectionReason?: string) => {
    setSubmitting(true);
    const res = await fetch(`/api/employer/applications/${appId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, rejection_reason: rejectionReason }),
    });
    const json = await res.json();
    setMessage({ type: res.ok ? "success" : "error", text: json.message });
    if (res.ok) await fetchApplicants();
    setSubmitting(false);
  };

  /* ── Bulk update ────────────────────────────────────────────────────── */
  const bulkUpdate = async (status: string, rejectionReason?: string) => {
    setSubmitting(true);
    const res = await fetch("/api/employer/applications/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        applicationIds: Array.from(selected),
        status,
        rejection_reason: rejectionReason,
      }),
    });
    const json = await res.json();
    setMessage({ type: res.ok ? "success" : "error", text: json.message });
    if (res.ok) { setSelected(new Set()); await fetchApplicants(); }
    setSubmitting(false);
  };

  /* ── Reject modal handler ───────────────────────────────────────────── */
  const handleRejectConfirm = async () => {
    if (!rejectReason.trim()) return;
    if (rejectModal?.appId === "bulk") {
      await bulkUpdate("rejected", rejectReason);
    } else if (rejectModal?.appId) {
      await updateStatus(rejectModal.appId, "rejected", rejectReason);
    }
    setRejectModal(null);
    setRejectReason("");
  };

  /* ── Move to next round ─────────────────────────────────────────────── */
  const moveForward = async (app: Applicant) => {
    const idx  = STATUS_FLOW.indexOf(app.status);
    const next = idx >= 0 && idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : null;
    if (next) await updateStatus(app.id, next);
  };

  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

  const statuses = ["all", ...Array.from(new Set(applicants.map((a) => a.status)))];

  return (
    <>
      <style>{`
        .ap-topbar { padding: 22px 32px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,.07); background: rgba(255,255,255,.02); }
        .ap-topbar h2 { font-size: 20px; font-weight: 700; color: white; }
        .ap-topbar p  { font-size: 13px; color: #64748B; margin-top: 2px; }
        .ap-content { padding: 24px 32px; }

        .ap-filter-bar { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; }
        .ap-filter-chip { padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; cursor: pointer; border: 1px solid rgba(255,255,255,.1); background: rgba(255,255,255,.04); color: #94A3B8; transition: all .2s; }
        .ap-filter-chip.active { background: rgba(14,165,233,.15); border-color: rgba(14,165,233,.3); color: #38BDF8; }

        /* Bulk action bar */
        .ap-bulk-bar {
          position: sticky; bottom: 16px; margin: 16px 0 0;
          padding: 12px 18px; border-radius: 12px;
          background: #1E293B; border: 1px solid rgba(14,165,233,.25);
          display: flex; align-items: center; gap: 12px;
          box-shadow: 0 8px 32px rgba(0,0,0,.4);
        }
        .ap-bulk-count { font-size: 13px; font-weight: 700; color: #38BDF8; }
        .ap-bulk-btn { padding: 7px 14px; border-radius: 8px; border: none; cursor: pointer; font-size: 12px; font-weight: 700; }
        .ap-bulk-btn.shortlist { background: rgba(14,165,233,.2); color: #38BDF8; }
        .ap-bulk-btn.shortlist:hover { background: rgba(14,165,233,.3); }
        .ap-bulk-btn.reject { background: rgba(239,68,68,.15); color: #FCA5A5; }
        .ap-bulk-btn.reject:hover { background: rgba(239,68,68,.25); }
        .ap-bulk-btn:disabled { opacity: .5; cursor: not-allowed; }

        /* Table */
        .ap-table-wrap { background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.07); border-radius: 14px; overflow: hidden; }
        .ap-table { width: 100%; border-collapse: collapse; }
        .ap-th { padding: 11px 14px; text-align: left; font-size: 11px; font-weight: 600; color: #64748B; text-transform: uppercase; letter-spacing: .05em; border-bottom: 1px solid rgba(255,255,255,.07); background: rgba(255,255,255,.02); white-space: nowrap; }
        .ap-td { padding: 13px 14px; font-size: 13px; color: #CBD5E1; border-bottom: 1px solid rgba(255,255,255,.04); vertical-align: middle; }
        .ap-tr:last-child .ap-td { border-bottom: none; }
        .ap-tr:hover .ap-td { background: rgba(255,255,255,.02); }
        .ap-tr.selected .ap-td { background: rgba(14,165,233,.05); }
        .ap-checkbox { accent-color: #0EA5E9; width: 14px; height: 14px; cursor: pointer; }

        .ap-name { font-weight: 600; color: white; }
        .ap-resume { color: #38BDF8; text-decoration: none; font-size: 12px; font-weight: 600; }
        .ap-resume:hover { opacity: .8; }
        .ap-resume.none { color: #475569; }

        /* Action buttons */
        .ap-actions { display: flex; gap: 6px; flex-wrap: wrap; }
        .ap-act { padding: 5px 10px; border-radius: 7px; border: none; cursor: pointer; font-size: 11px; font-weight: 700; white-space: nowrap; transition: all .15s; }
        .ap-act.forward    { background: rgba(99,102,241,.15); color: #A78BFA; }
        .ap-act.forward:hover { background: rgba(99,102,241,.25); }
        .ap-act.shortlist  { background: rgba(14,165,233,.15); color: #38BDF8; }
        .ap-act.shortlist:hover { background: rgba(14,165,233,.25); }
        .ap-act.reject     { background: rgba(239,68,68,.12);  color: #FCA5A5; }
        .ap-act.reject:hover  { background: rgba(239,68,68,.22); }
        .ap-act.offer      { background: rgba(16,185,129,.12); color: #34D399; }
        .ap-act.offer:hover   { background: rgba(16,185,129,.22); }
        .ap-act:disabled   { opacity: .4; cursor: not-allowed; }

        .ap-empty { padding: 50px; text-align: center; color: #475569; font-size: 14px; }

        /* Reject modal */
        .ap-modal-bg { position: fixed; inset: 0; background: rgba(0,0,0,.7); display: flex; align-items: center; justify-content: center; z-index: 999; }
        .ap-modal { background: #0F172A; border: 1px solid rgba(255,255,255,.1); border-radius: 16px; padding: 28px; width: 480px; max-width: 95vw; }
        .ap-modal h3 { font-size: 17px; font-weight: 700; color: white; margin-bottom: 8px; }
        .ap-modal p  { font-size: 13px; color: #94A3B8; margin-bottom: 16px; }
        .ap-modal textarea {
          width: 100%; padding: 12px; border-radius: 10px; font-size: 13px; resize: vertical; min-height: 100px;
          background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.1); color: white; outline: none;
        }
        .ap-modal textarea:focus { border-color: #0EA5E9; }
        .ap-modal-btns { display: flex; gap: 10px; margin-top: 16px; justify-content: flex-end; }
        .ap-modal-btn { padding: 9px 18px; border-radius: 9px; border: none; cursor: pointer; font-size: 13px; font-weight: 700; }
        .ap-modal-btn.cancel { background: rgba(255,255,255,.07); color: #94A3B8; }
        .ap-modal-btn.confirm { background: rgba(239,68,68,.2); color: #FCA5A5; }
        .ap-modal-btn.confirm:disabled { opacity: .5; cursor: not-allowed; }

        .ap-message { padding: 10px 14px; border-radius: 9px; font-size: 13px; font-weight: 600; margin-bottom: 16px; }
        .ap-message.success { background: rgba(16,185,129,.1); color: #34D399; border: 1px solid rgba(16,185,129,.2); }
        .ap-message.error   { background: rgba(239,68,68,.1);  color: #FCA5A5; border: 1px solid rgba(239,68,68,.2); }
      `}</style>

      <div className="ap-topbar">
        <div>
          <h2>Applicants</h2>
          <p>{filtered.length} applicant{filtered.length !== 1 ? "s" : ""} · {filterStatus !== "all" ? filterStatus : "all statuses"}</p>
        </div>
      </div>

      <div className="ap-content">
        {/* Message */}
        {message && (
          <div className={`ap-message ${message.type}`} onClick={() => setMessage(null)}>
            {message.text}
          </div>
        )}

        {/* Filter chips */}
        <div className="ap-filter-bar">
          {statuses.map((s) => (
            <div key={s}
              className={`ap-filter-chip${filterStatus === s ? " active" : ""}`}
              onClick={() => setFilterStatus(s)}
            >
              {s === "all" ? "All" : s.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              {" "}({s === "all" ? applicants.length : applicants.filter((a) => a.status === s).length})
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="ap-table-wrap">
          <table className="ap-table">
            <thead>
              <tr>
                <th className="ap-th">
                  <input type="checkbox" className="ap-checkbox"
                    checked={selected.size > 0 && selected.size === filtered.length}
                    onChange={toggleAll}
                  />
                </th>
                {["Student", "Branch", "CGPA", "Applied", "Status", "Resume", "Actions"].map((h) => (
                  <th key={h} className="ap-th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 8 }).map((__, j) => (
                      <td key={j} className="ap-td">
                        <div style={{ height: 14, background: "rgba(255,255,255,.06)", borderRadius: 6, animation: "pulse 1.4s infinite" }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="ap-empty">No applicants found.</td></tr>
              ) : (
                filtered.map((app) => {
                  const sp = app.student_profiles;
                  const isSelected = selected.has(app.id);
                  const canMoveForward = STATUS_FLOW.indexOf(app.status) < STATUS_FLOW.length - 1 && app.status !== "rejected";

                  return (
                    <tr key={app.id} className={`ap-tr${isSelected ? " selected" : ""}`}>
                      <td className="ap-td">
                        <input type="checkbox" className="ap-checkbox"
                          checked={isSelected} onChange={() => toggleSelect(app.id)} />
                      </td>
                      <td className="ap-td">
                        <div className="ap-name">{sp?.full_name ?? "—"}</div>
                        <div style={{ fontSize: 11, color: "#64748B" }}>{sp?.enrollment_number}</div>
                      </td>
                      <td className="ap-td">{sp?.branch ?? "—"}</td>
                      <td className="ap-td">
                        <span style={{ fontWeight: 700, color: sp && sp.cgpa >= 7.5 ? "#34D399" : "#CBD5E1" }}>
                          {sp?.cgpa?.toFixed(1) ?? "—"}
                        </span>
                      </td>
                      <td className="ap-td" style={{ color: "#64748B" }}>{fmt(app.applied_at)}</td>
                      <td className="ap-td"><StatusChip status={app.status} size="sm" /></td>
                      <td className="ap-td">
                        {sp?.resume_url ? (
                          <a href={sp.resume_url} target="_blank" rel="noreferrer" className="ap-resume">
                            ↓ Resume
                          </a>
                        ) : (
                          <span className="ap-resume none">No resume</span>
                        )}
                      </td>
                      <td className="ap-td">
                        <div className="ap-actions">
                          {canMoveForward && (
                            <button className="ap-act forward" disabled={submitting}
                              onClick={() => moveForward(app)} title="Move to next round">
                              → Next
                            </button>
                          )}
                          {app.status !== "shortlisted" && app.status !== "rejected" && (
                            <button className="ap-act shortlist" disabled={submitting}
                              onClick={() => updateStatus(app.id, "shortlisted")}>
                              Shortlist
                            </button>
                          )}
                          {app.status !== "rejected" && (
                            <button className="ap-act reject" disabled={submitting}
                              onClick={() => setRejectModal({ appId: app.id })}>
                              Reject
                            </button>
                          )}
                          {app.status === "shortlisted" && (
                            <button className="ap-act offer" disabled={submitting}
                              onClick={() => window.location.href = `/employer/jobs/offers/new?applicationId=${app.id}`}>
                              Offer
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Bulk action bar */}
        {selected.size > 0 && (
          <div className="ap-bulk-bar">
            <span className="ap-bulk-count">{selected.size} selected</span>
            <button className="ap-bulk-btn shortlist" disabled={submitting}
              onClick={() => bulkUpdate("shortlisted")}>
              Bulk Shortlist
            </button>
            <button className="ap-bulk-btn reject" disabled={submitting}
              onClick={() => setRejectModal({ appId: "bulk", ids: Array.from(selected) })}>
              Bulk Reject
            </button>
            <button style={{ marginLeft: "auto", background: "none", border: "none", color: "#64748B", cursor: "pointer", fontSize: 13 }}
              onClick={() => setSelected(new Set())}>
              Clear selection
            </button>
          </div>
        )}
      </div>

      {/* Rejection modal */}
      {rejectModal && (
        <div className="ap-modal-bg" onClick={() => setRejectModal(null)}>
          <div className="ap-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Rejection</h3>
            <p>
              {rejectModal.appId === "bulk"
                ? `You are about to reject ${selected.size} applicant(s). Each student will receive an individual notification.`
                : "Please provide a reason for rejection. The student will see this message."}
            </p>
            <textarea
              placeholder="e.g. The candidate's profile did not meet the required technical skills for this role."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="ap-modal-btns">
              <button className="ap-modal-btn cancel" onClick={() => { setRejectModal(null); setRejectReason(""); }}>
                Cancel
              </button>
              <button className="ap-modal-btn confirm" disabled={!rejectReason.trim() || submitting}
                onClick={handleRejectConfirm}>
                {submitting ? "Rejecting…" : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes pulse { 0%,100%{opacity:.6} 50%{opacity:1} }`}</style>
    </>
  );
}
