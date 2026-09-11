"use client";

import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { getStudentProfile } from "@/lib/student/jobs";
import { Briefcase, Calendar, Building2 } from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  applied:     { label: "Applied",     bg: "var(--info-light)",    color: "var(--info-text)" },
  shortlisted: { label: "Shortlisted", bg: "var(--warning-light)", color: "var(--warning-text)" },
  selected:    { label: "Completed",   bg: "var(--success-light)", color: "var(--success-text)" },
  rejected:    { label: "Not Selected",bg: "var(--error-light)",   color: "var(--error-text)" },
};

export default function MyInternshipsPage() {
  const [internships, setInternships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const student = await getStudentProfile(user.id);
        // Fetch internship applications (job_type = 'internship')
        const { data } = await supabase
          .from("applications")
          .select(`*, jobs(title, company_name, location, job_type, ctc_min, ctc_max, deadline)`)
          .eq("student_id", student.id)
          .is("deleted_at", null)
          .order("applied_at", { ascending: false });
        setInternships((data ?? []).filter((a: any) => a.jobs?.job_type === "internship"));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  return (
    <div style={{ padding: "0 0 32px" }}>
      <PageHeader title="My Internships" description="Track your internship applications and their status." />

      <div style={{ padding: "20px 28px 0", display: "flex", flexDirection: "column", gap: 12 }}>
        {loading ? (
          [1,2].map(i => <Card key={i}><div style={{ height: 80, background: "var(--bg-tertiary)", borderRadius: "var(--radius-md)", animation: "pulse 1.5s ease-in-out infinite" }} /></Card>)
        ) : internships.length === 0 ? (
          <Card>
            <div style={{ textAlign: "center", padding: "48px 0" }}>
              <Briefcase size={40} style={{ color: "var(--text-muted)", margin: "0 auto 14px", display: "block" }} />
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginBottom: 6 }}>No internship applications yet</div>
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Browse available internships and apply to get started.</p>
            </div>
          </Card>
        ) : (
          internships.map(app => {
            const cfg = STATUS_CONFIG[app.application_status] ?? STATUS_CONFIG.applied;
            return (
              <Card key={app.id} hover>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>{app.jobs?.title}</div>
                    <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 10 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--text-muted)" }}><Building2 size={12} />{app.jobs?.company_name}</span>
                      {app.applied_at && <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--text-muted)" }}><Calendar size={12} />Applied {new Date(app.applied_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>}
                    </div>
                    {app.remarks && <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>{app.remarks}</p>}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: "var(--radius-full)", background: cfg.bg, color: cfg.color, whiteSpace: "nowrap", flexShrink: 0 }}>
                    {cfg.label}
                  </span>
                </div>
              </Card>
            );
          })
        )}
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
    </div>
  );
}
