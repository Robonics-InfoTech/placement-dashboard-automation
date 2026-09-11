"use client";

import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { getMyApplications } from "@/lib/student/applications";
import { getStudentProfile } from "@/lib/student/jobs";
import Link from "next/link";

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  applied:     { label: "Applied",     bg: "var(--info-light)",    color: "var(--info-text)" },
  shortlisted: { label: "Shortlisted", bg: "var(--warning-light)", color: "var(--warning-text)" },
  selected:    { label: "Selected",    bg: "var(--success-light)", color: "var(--success-text)" },
  rejected:    { label: "Rejected",    bg: "var(--error-light)",   color: "var(--error-text)" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.applied;
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: "var(--radius-full)", background: cfg.bg, color: cfg.color }}>
      {cfg.label}
    </span>
  );
}

function Skeleton() {
  return (
    <Card>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ height: 18, width: "60%", borderRadius: "var(--radius-md)", background: "var(--bg-tertiary)", animation: "pulse 1.5s ease-in-out infinite" }} />
        <div style={{ height: 14, width: "40%", borderRadius: "var(--radius-md)", background: "var(--bg-tertiary)", animation: "pulse 1.5s ease-in-out infinite" }} />
      </div>
    </Card>
  );
}

export default function StudentApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const student = await getStudentProfile(user.id);
      const data = await getMyApplications(student.id);
      setApplications(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  const statuses = ["all", "applied", "shortlisted", "selected", "rejected"];
  const filtered = filter === "all" ? applications : applications.filter(a => a.application_status === filter);

  const counts = statuses.reduce((acc, s) => {
    acc[s] = s === "all" ? applications.length : applications.filter(a => a.application_status === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div style={{ padding: "0 0 32px" }}>
      <PageHeader title="My Drives" description="Track every placement drive application you've submitted." />

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, padding: "20px 28px 0", flexWrap: "wrap" }}>
        {statuses.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              padding: "6px 14px", borderRadius: "var(--radius-full)", fontSize: 13, fontWeight: 600, cursor: "pointer", border: "1px solid",
              background: filter === s ? "var(--accent-primary)" : "var(--bg-card)",
              borderColor: filter === s ? "var(--accent-primary)" : "var(--border-primary)",
              color: filter === s ? "#fff" : "var(--text-secondary)",
              transition: "all var(--transition-fast)",
            }}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)} {counts[s] > 0 && `(${counts[s]})`}
          </button>
        ))}
      </div>

      <div style={{ padding: "16px 28px 0", display: "flex", flexDirection: "column", gap: 12 }}>
        {loading ? (
          <>{[1,2,3].map(i => <Skeleton key={i} />)}</>
        ) : filtered.length === 0 ? (
          <Card>
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", marginBottom: 8 }}>
                {filter === "all" ? "No applications yet" : `No ${filter} applications`}
              </div>
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>
                {filter === "all" ? "Browse and apply to placement drives to see them here." : "Try selecting a different filter."}
              </p>
              {filter === "all" && (
                <Link href="/student/drives" style={{ display: "inline-block", padding: "8px 20px", background: "var(--accent-primary)", color: "#fff", borderRadius: "var(--radius-md)", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
                  Browse Drives
                </Link>
              )}
            </div>
          </Card>
        ) : (
          filtered.map(app => (
            <Card key={app.id} hover>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
                    {app.jobs?.title ?? "Placement Drive"}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 12 }}>
                    {app.jobs?.company_name ?? "—"} {app.jobs?.location ? `· ${app.jobs.location}` : ""}
                  </div>
                  <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                    <div>
                      <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Applied On</span>
                      <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>
                        {app.applied_at ? new Date(app.applied_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                      </div>
                    </div>
                    {app.remarks && (
                      <div>
                        <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Remarks</span>
                        <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>{app.remarks}</div>
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10, flexShrink: 0 }}>
                  <StatusBadge status={app.application_status} />
                  {app.job_id && (
                    <Link href={`/student/jobs/${app.job_id}`} style={{ fontSize: 12, color: "var(--accent-text)", textDecoration: "none", fontWeight: 600 }}>
                      View Drive →
                    </Link>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
    </div>
  );
}