"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";

/* ─── Types ──────────────────────────────────────────────────────────────── */
type Job = {
  id: string;
  title: string;
  job_type: string;
  employment_type: string | null;
  location: string | null;
  salary_package: number | null;
  currency: string;
  minimum_cgpa: number | null;
  maximum_backlogs: number;
  application_deadline: string | null;
  status: string;
  employer_profiles: { company_name: string; logo_url: string | null } | null;
};

type StudentProfile = {
  id: string;
  cgpa: number | null;
  branch: string;
  graduation_year: number | null;
  active_backlogs: number;
  placement_status: string;
};

type AppliedSet = Set<string>;

/* ─── Icons ──────────────────────────────────────────────────────────────── */
const IconSearch = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const IconFilter = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>
);
const IconMapPin = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const IconClock = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IconDollar = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);
const IconChevronLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);
const IconChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

/* ─── Apply Modal ──────────────────────────────────────────────────────────── */
function ApplyModal({
  job, primaryResumeName, hasPrimary, onConfirm, onCancel, applying,
}: {
  job: Job; primaryResumeName: string | null; hasPrimary: boolean;
  onConfirm: () => void; onCancel: () => void; applying: boolean;
}) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.65)", backdropFilter: "blur(5px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 16 }}>
      <div style={{ background: "#0E1629", border: "1px solid rgba(99,102,241,.25)", borderRadius: 18, padding: 28, width: 460, maxWidth: "100%" }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: "white", marginBottom: 4 }}>Confirm Application</div>
        <div style={{ fontSize: 12, color: "#64748B", marginBottom: 22 }}>Review your application before submitting</div>

        <div style={{ background: "rgba(99,102,241,.07)", border: "1px solid rgba(99,102,241,.15)", borderRadius: 12, padding: 16, marginBottom: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "white" }}>{job.title}</div>
          <div style={{ fontSize: 13, color: "#818CF8", marginTop: 3 }}>{job.employer_profiles?.company_name}</div>
          <div style={{ display: "flex", gap: 14, marginTop: 10, fontSize: 12, color: "#64748B", flexWrap: "wrap" }}>
            {job.location && <span style={{ display: "flex", gap: 4, alignItems: "center" }}><IconMapPin />{job.location}</span>}
            {job.salary_package && <span style={{ display: "flex", gap: 4, alignItems: "center" }}><IconDollar />₹{job.salary_package} LPA</span>}
            {job.application_deadline && <span style={{ display: "flex", gap: 4, alignItems: "center" }}><IconClock />Deadline: {new Date(job.application_deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>}
          </div>
        </div>

        {!hasPrimary ? (
          <div style={{ padding: "12px 14px", borderRadius: 10, background: "rgba(245,158,11,.08)", border: "1px solid rgba(245,158,11,.2)", fontSize: 13, color: "#FCD34D", marginBottom: 20 }}>
            ⚠️ No primary resume set. Please{" "}
            <a href="/student/documents" style={{ color: "#FCD34D", fontWeight: 700 }}>upload and set a primary resume</a>{" "}
            before applying.
          </div>
        ) : (
          <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(16,185,129,.07)", border: "1px solid rgba(16,185,129,.15)", fontSize: 13, color: "#34D399", marginBottom: 20 }}>
            📄 Your primary resume <strong>"{primaryResumeName}"</strong> will be submitted with this application.
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "1px solid rgba(255,255,255,.1)", background: "transparent", color: "#94A3B8", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!hasPrimary || applying}
            style={{ flex: 2, padding: "10px 0", borderRadius: 10, border: "none", background: hasPrimary ? "linear-gradient(135deg,#6366F1,#8B5CF6)" : "rgba(99,102,241,.3)", color: "white", cursor: hasPrimary ? "pointer" : "not-allowed", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          >
            {applying ? (
              <><div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(255,255,255,.3)", borderTopColor: "white", animation: "spin .8s linear infinite" }} /> Applying…</>
            ) : "Confirm & Apply"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Eligibility badge ─────────────────────────────────────────────────── */
function EligibilityBadge({ job, profile }: { job: Job; profile: StudentProfile | null }) {
  if (!profile) return <span style={{ fontSize: 11, color: "#64748B" }}>—</span>;

  const reasons: string[] = [];
  if (job.minimum_cgpa && profile.cgpa !== null && profile.cgpa < job.minimum_cgpa)
    reasons.push(`CGPA < ${job.minimum_cgpa}`);
  if (profile.active_backlogs > job.maximum_backlogs)
    reasons.push(`${profile.active_backlogs} backlogs > allowed ${job.maximum_backlogs}`);

  const eligible = reasons.length === 0;
  return (
    <span
      title={eligible ? "You meet all criteria" : reasons.join("; ")}
      style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
        background: eligible ? "rgba(16,185,129,.12)" : "rgba(239,68,68,.1)",
        color: eligible ? "#34D399" : "#F87171",
        border: `1px solid ${eligible ? "rgba(16,185,129,.2)" : "rgba(239,68,68,.15)"}`,
        cursor: eligible ? "default" : "help",
      }}
    >
      {eligible ? "✓ Eligible" : "✗ Not Eligible"}
    </span>
  );
}

const PAGE_SIZE = 10;
const JOB_TYPE_OPTS = ["All", "placement", "internship", "project", "hackathon", "alumni"];
const STATUS_OPTS = ["All", "Applied", "Not Applied"];

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [appliedSet, setAppliedSet] = useState<AppliedSet>(new Set());
  const [primaryResume, setPrimaryResume] = useState<{ id: string; name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterMinCTC, setFilterMinCTC] = useState("");
  const [page, setPage] = useState(1);
  const [applyTarget, setApplyTarget] = useState<Job | null>(null);
  const [applying, setApplying] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Student profile
      const { data: sp } = await supabase
        .from("student_profiles")
        .select("id, cgpa, branch, graduation_year, active_backlogs, placement_status")
        .eq("user_id", user.id)
        .single();
      if (sp) setProfile(sp);

      // Applications
      if (sp) {
        const { data: apps } = await supabase
          .from("applications")
          .select("job_id")
          .eq("student_id", sp.id)
          .is("deleted_at", null);
        if (apps) setAppliedSet(new Set(apps.map((a) => a.job_id)));
      }

      // Primary resume from documents
      const { data: docs } = await supabase
        .from("documents")
        .select("id, document_name, file_path")
        .eq("user_id", user.id)
        .eq("document_type", "resume")
        .is("deleted_at", null)
        .limit(5);

      if (docs && sp) {
        // Check which one is set as primary in student_profiles
        const { data: spData } = await supabase
          .from("student_profiles")
          .select("resume_url")
          .eq("user_id", user.id)
          .single();
        if (spData?.resume_url) {
          const primaryDoc = docs.find((d) => d.file_path === spData.resume_url);
          if (primaryDoc) setPrimaryResume({ id: primaryDoc.id, name: primaryDoc.document_name });
        } else if (docs.length > 0) {
          // Default to first resume
          setPrimaryResume({ id: docs[0].id, name: docs[0].document_name });
        }
      }

      // Jobs — only published with visibility approved
      const { data: jobData } = await supabase
        .from("jobs")
        .select(`
          id, title, job_type, employment_type, location, salary_package, currency,
          minimum_cgpa, maximum_backlogs, application_deadline, status,
          employer_profiles!inner(company_name, logo_url)
        `)
        .eq("status", "published")
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (jobData) setJobs(jobData as unknown as Job[]);
      setLoading(false);
    };
    init();
  }, []);

  /* ── Filtered & paginated ── */
  const filtered = jobs.filter((j) => {
    const q = search.toLowerCase();
    if (q && !j.title.toLowerCase().includes(q) && !j.employer_profiles?.company_name.toLowerCase().includes(q)) return false;
    if (filterType !== "All" && j.job_type !== filterType) return false;
    if (filterMinCTC) {
      const min = parseFloat(filterMinCTC);
      if (!isNaN(min) && (j.salary_package ?? 0) < min) return false;
    }
    if (filterStatus === "Applied" && !appliedSet.has(j.id)) return false;
    if (filterStatus === "Not Applied" && appliedSet.has(j.id)) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const resetPage = useCallback(() => setPage(1), []);

  /* ── Apply ── */
  const handleApply = async () => {
    if (!applyTarget || !profile) return;
    setApplying(true);
    try {
      const res = await fetch("/api/student/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_id: applyTarget.id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Application failed");
      setAppliedSet((s) => new Set([...s, applyTarget.id]));
      showToast("Application submitted! Confirmation email sent.");
    } catch (e) {
      showToast((e as Error).message, "err");
    }
    setApplying(false);
    setApplyTarget(null);
  };

  const daysLeft = (d: string | null) => {
    if (!d) return null;
    const diff = new Date(d).getTime() - Date.now();
    return Math.ceil(diff / 86400000);
  };

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
        @keyframes spin { to { transform: rotate(360deg); } }
        .jobs-wrap { padding: 28px 32px; max-width: 1100px; margin: 0 auto; }

        /* ── Filters bar ── */
        .jobs-filters {
          display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px;
          background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.07);
          border-radius: 14px; padding: 14px;
        }
        .jobs-search {
          flex: 1; min-width: 200px; display: flex; align-items: center; gap: 8px;
          padding: 9px 12px; border-radius: 9px;
          background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1);
          color: #E2E8F0;
        }
        .jobs-search input { background: transparent; border: none; outline: none; color: #E2E8F0; font-family: inherit; font-size: 13px; flex: 1; }
        .jobs-search input::placeholder { color: #475569; }
        .jobs-select {
          padding: 9px 12px; border-radius: 9px; font-size: 13px; font-family: inherit;
          background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1);
          color: #E2E8F0; cursor: pointer; outline: none;
        }
        .jobs-select option { background: #0E1629; }
        .jobs-ctc-input {
          padding: 9px 12px; border-radius: 9px; font-size: 13px; font-family: inherit; width: 120px;
          background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1);
          color: #E2E8F0; outline: none;
        }
        .jobs-ctc-input::placeholder { color: #475569; }

        /* ── Stats bar ── */
        .jobs-meta { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
        .jobs-count { font-size: 13px; color: "#64748B"; flex: 1; }
        .jobs-count strong { color: #E2E8F0; }

        /* ── Job card ── */
        .job-card {
          background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.07);
          border-radius: 16px; padding: 20px; margin-bottom: 12px;
          transition: border-color .18s, transform .15s;
          position: relative;
        }
        .job-card:hover { border-color: rgba(99,102,241,.2); transform: translateY(-2px); }
        .job-card.applied { border-color: rgba(16,185,129,.18); }

        .job-card-header { display: flex; align-items: flex-start; gap: 14px; }
        .job-company-logo {
          width: 46px; height: 46px; border-radius: 12px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; font-weight: 800; color: white; overflow: hidden;
          background: linear-gradient(135deg,#6366F1,#8B5CF6);
        }
        .job-company-logo img { width: 100%; height: 100%; object-fit: cover; }
        .job-info { flex: 1; }
        .job-title { font-size: 15px; font-weight: 700; color: white; }
        .job-company { font-size: 13px; color: "#818CF8"; margin-top: 2px; color: #818CF8; }
        .job-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
        .job-tag {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 600;
          background: rgba(255,255,255,.06); color: #94A3B8;
        }
        .job-card-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 14px; flex-wrap: wrap; gap: 10px; }

        /* ── Apply button ── */
        .job-apply-btn {
          padding: 8px 20px; border-radius: 9px; border: none; cursor: pointer;
          font-size: 13px; font-weight: 700; transition: all .18s;
        }
        .job-apply-btn.active { background: linear-gradient(135deg,#6366F1,#8B5CF6); color: white; }
        .job-apply-btn.active:hover { opacity: .88; transform: translateY(-1px); }
        .job-apply-btn.applied { background: rgba(16,185,129,.12); color: #34D399; border: 1px solid rgba(16,185,129,.2); cursor: default; }
        .job-apply-btn.placed { background: rgba(100,116,139,.1); color: #64748B; cursor: not-allowed; }

        /* ── Deadline chip ── */
        .job-deadline-chip {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 600;
        }
        .job-deadline-chip.urgent  { background: rgba(239,68,68,.1); color: #F87171; }
        .job-deadline-chip.soon    { background: rgba(245,158,11,.1); color: #FCD34D; }
        .job-deadline-chip.normal  { background: rgba(100,116,139,.1); color: #94A3B8; }
        .job-deadline-chip.passed  { background: rgba(100,116,139,.06); color: #475569; }

        /* ── Pagination ── */
        .jobs-pagination { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 24px; }
        .page-btn {
          display: flex; align-items: center; justify-content: center;
          width: 36px; height: 36px; border-radius: 9px; border: none; cursor: pointer;
          font-size: 13px; font-weight: 600; transition: all .15s;
          background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.07); color: #94A3B8;
        }
        .page-btn:hover:not(:disabled):not(.active) { background: rgba(255,255,255,.08); color: #E2E8F0; }
        .page-btn.active { background: rgba(99,102,241,.2); color: #A5B4FC; border-color: rgba(99,102,241,.3); }
        .page-btn:disabled { opacity: .4; cursor: not-allowed; }

        /* ── Toast ── */
        .jobs-toast {
          position: fixed; bottom: 28px; right: 28px;
          padding: 12px 20px; border-radius: 12px; font-size: 13px; font-weight: 600;
          z-index: 300; animation: toast-in .25s ease;
          box-shadow: 0 8px 32px rgba(0,0,0,.4);
        }
        .jobs-toast.ok  { background: rgba(16,185,129,.15); border: 1px solid rgba(16,185,129,.25); color: #34D399; }
        .jobs-toast.err { background: rgba(239,68,68,.12); border: 1px solid rgba(239,68,68,.25); color: #F87171; }
        @keyframes toast-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        .job-type-chip {
          padding: 2px 8px; border-radius: 20px; font-size: 10px; font-weight: 700; text-transform: uppercase;
          background: rgba(99,102,241,.12); color: #818CF8;
        }

        @media (max-width: 700px) { .jobs-wrap { padding: 16px; } .job-card-header { flex-wrap: wrap; } }
      `}</style>

      <div className="jobs-wrap">
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "white" }}>Job Listings</h1>
          <p style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>Browse active opportunities. Eligibility is calculated from your profile.</p>
        </div>

        {profile?.placement_status === "placed" && (
          <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(16,185,129,.08)", border: "1px solid rgba(16,185,129,.2)", fontSize: 13, color: "#34D399", marginBottom: 16 }}>
            🎓 You are marked as <strong>Placed</strong>. New applications are disabled as per placement policy.
          </div>
        )}

        {/* Filters */}
        <div className="jobs-filters">
          <div className="jobs-search">
            <IconSearch />
            <input
              placeholder="Search company or role…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); resetPage(); }}
            />
          </div>
          <select className="jobs-select" value={filterType} onChange={(e) => { setFilterType(e.target.value); resetPage(); }}>
            {JOB_TYPE_OPTS.map((o) => <option key={o}>{o}</option>)}
          </select>
          <input
            className="jobs-ctc-input" type="number" min="0" step="0.5"
            placeholder="Min CTC (LPA)"
            value={filterMinCTC}
            onChange={(e) => { setFilterMinCTC(e.target.value); resetPage(); }}
          />
          <select className="jobs-select" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); resetPage(); }}>
            {STATUS_OPTS.map((o) => <option key={o}>{o}</option>)}
          </select>
        </div>

        {/* Meta */}
        <div className="jobs-meta">
          <span className="jobs-count"><strong>{filtered.length}</strong> job{filtered.length !== 1 ? "s" : ""} found</span>
          <span style={{ fontSize: 12, color: "#475569" }}>Page {page} of {totalPages}</span>
        </div>

        {/* Job cards */}
        {paginated.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: "#475569" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#64748B" }}>No jobs match your filters</div>
            <div style={{ fontSize: 13, marginTop: 6 }}>Try adjusting your search or clearing filters</div>
          </div>
        ) : (
          paginated.map((job) => {
            const applied = appliedSet.has(job.id);
            const days = daysLeft(job.application_deadline);
            const placed = profile?.placement_status === "placed";
            return (
              <div key={job.id} className={`job-card${applied ? " applied" : ""}`}>
                <div className="job-card-header">
                  <div className="job-company-logo">
                    {job.employer_profiles?.logo_url ? (
                      <img src={job.employer_profiles.logo_url} alt={job.employer_profiles.company_name} />
                    ) : (
                      (job.employer_profiles?.company_name?.[0] ?? "?").toUpperCase()
                    )}
                  </div>
                  <div className="job-info">
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <div className="job-title">{job.title}</div>
                      <span className="job-type-chip">{job.job_type}</span>
                    </div>
                    <div className="job-company">{job.employer_profiles?.company_name}</div>
                    <div className="job-tags">
                      {job.location && (
                        <span className="job-tag"><IconMapPin />{job.location}</span>
                      )}
                      {job.salary_package && (
                        <span className="job-tag" style={{ background: "rgba(16,185,129,.08)", color: "#34D399" }}>
                          <IconDollar />₹{job.salary_package} LPA
                        </span>
                      )}
                      {job.minimum_cgpa && (
                        <span className="job-tag">Min CGPA: {job.minimum_cgpa}</span>
                      )}
                      {job.maximum_backlogs !== undefined && (
                        <span className="job-tag">Max Backlogs: {job.maximum_backlogs}</span>
                      )}
                      {job.employment_type && (
                        <span className="job-tag">{job.employment_type.replace("_", " ")}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="job-card-footer">
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <EligibilityBadge job={job} profile={profile} />
                    {days !== null && (
                      <span className={`job-deadline-chip ${days < 0 ? "passed" : days <= 2 ? "urgent" : days <= 7 ? "soon" : "normal"}`}>
                        <IconClock />
                        {days < 0 ? "Deadline passed" : days === 0 ? "Closes today!" : `${days}d left`}
                      </span>
                    )}
                  </div>
                  {applied ? (
                    <button className="job-apply-btn applied" disabled>✓ Applied</button>
                  ) : placed ? (
                    <button className="job-apply-btn placed" disabled>Placed — Cannot Apply</button>
                  ) : (
                    <button
                      className="job-apply-btn active"
                      onClick={() => setApplyTarget(job)}
                      disabled={days !== null && days < 0}
                    >
                      {days !== null && days < 0 ? "Deadline Passed" : "Apply Now"}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="jobs-pagination">
            <button className="page-btn" disabled={page === 1} onClick={() => setPage((p) => p - 1)}><IconChevronLeft /></button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
              .reduce<Array<number | "...">>(
                (acc, p, i, arr) => {
                  if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
                  acc.push(p);
                  return acc;
                },
                []
              )
              .map((p, i) =>
                p === "..." ? (
                  <span key={`dots-${i}`} style={{ color: "#475569", fontSize: 13 }}>…</span>
                ) : (
                  <button key={p} className={`page-btn${page === p ? " active" : ""}`} onClick={() => setPage(p as number)}>
                    {p}
                  </button>
                )
              )}
            <button className="page-btn" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}><IconChevronRight /></button>
          </div>
        )}
      </div>

      {applyTarget && (
        <ApplyModal
          job={applyTarget}
          primaryResumeName={primaryResume?.name ?? null}
          hasPrimary={!!primaryResume}
          onConfirm={handleApply}
          onCancel={() => setApplyTarget(null)}
          applying={applying}
        />
      )}

      {toast && <div className={`jobs-toast ${toast.type}`}>{toast.msg}</div>}
    </>
  );
}
