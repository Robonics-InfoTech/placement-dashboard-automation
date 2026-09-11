"use client";

import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { getStudentProfile } from "@/lib/student/jobs";
import { Video, Calendar, Building2, Clock } from "lucide-react";

const ROUND_LABELS: Record<string, string> = {
  aptitude: "Aptitude Test",
  gd: "Group Discussion",
  technical: "Technical Interview",
  hr: "HR Interview",
  coding: "Coding Round",
  panel: "Panel Interview",
};

const STATUS_CFG: Record<string, { bg: string; color: string }> = {
  scheduled:  { bg: "var(--info-light)",    color: "var(--info-text)" },
  completed:  { bg: "var(--success-light)", color: "var(--success-text)" },
  cancelled:  { bg: "var(--error-light)",   color: "var(--error-text)" },
  shortlisted:{ bg: "var(--warning-light)", color: "var(--warning-text)" },
};

export default function MyInterviewsPage() {
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const student = await getStudentProfile(user.id);
        // Get shortlisted/selected applications — those have interviews
        const { data } = await supabase
          .from("applications")
          .select(`id, application_status, applied_at, jobs(title, company_name, location, selection_rounds)`)
          .eq("student_id", student.id)
          .in("application_status", ["shortlisted", "selected"])
          .is("deleted_at", null)
          .order("applied_at", { ascending: false });
        setInterviews(data ?? []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  return (
    <div style={{ padding: "0 0 32px" }}>
      <PageHeader title="My Interviews" description="Interviews and selection rounds for your shortlisted applications." />

      <div style={{ padding: "20px 28px 0", display: "flex", flexDirection: "column", gap: 14 }}>
        {loading ? (
          [1,2].map(i => <Card key={i}><div style={{ height: 100, background: "var(--bg-tertiary)", borderRadius: "var(--radius-md)", animation: "pulse 1.5s ease-in-out infinite" }} /></Card>)
        ) : interviews.length === 0 ? (
          <Card>
            <div style={{ textAlign: "center", padding: "48px 0" }}>
              <Video size={40} style={{ color: "var(--text-muted)", margin: "0 auto 14px", display: "block" }} />
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginBottom: 6 }}>No interviews yet</div>
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Once you're shortlisted for a drive, interview rounds will appear here.</p>
            </div>
          </Card>
        ) : (
          interviews.map(app => {
            const rounds: any[] = Array.isArray(app.jobs?.selection_rounds) ? app.jobs.selection_rounds : [];
            const cfg = STATUS_CFG[app.application_status] ?? STATUS_CFG.scheduled;
            return (
              <Card key={app.id} hover>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: rounds.length > 0 ? 16 : 0 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>{app.jobs?.title}</div>
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--text-muted)" }}><Building2 size={12} />{app.jobs?.company_name}</span>
                    </div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: "var(--radius-full)", background: cfg.bg, color: cfg.color, whiteSpace: "nowrap", flexShrink: 0 }}>
                    {app.application_status === "shortlisted" ? "Shortlisted" : "Selected"}
                  </span>
                </div>

                {rounds.length > 0 && (
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10 }}>Selection Rounds</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {rounds.map((round: any, i: number) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: "var(--radius-md)", background: "var(--bg-secondary)", border: "1px solid var(--border-secondary)" }}>
                          <div style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--accent-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "var(--accent-text)" }}>{i + 1}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{ROUND_LABELS[round.type] ?? round.type ?? `Round ${i + 1}`}</div>
                            {round.duration && <div style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}><Clock size={11} />{round.duration}</div>}
                          </div>
                          {round.date && (
                            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--text-muted)" }}>
                              <Calendar size={12} />{new Date(round.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
    </div>
  );
}
