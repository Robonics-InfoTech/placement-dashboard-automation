"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useDataSync } from "@/lib/hooks/useDataSync";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import { Loader2 } from "lucide-react";

interface EmployerJobsListProps {
  employerProfileId: string;
  isApproved: boolean;
}

export default function EmployerJobsList({ employerProfileId, isApproved }: EmployerJobsListProps) {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { fetchWithFallback, isOffline } = useDataSync();

  useEffect(() => {
    async function loadJobs() {
      try {
        setLoading(true);
        if (!employerProfileId) return;

        // Fetch jobs for this employer using the offline sync hook
        const jobsPromise = supabase
            .from("job_postings")
            .select("id, title, job_type, status, deadline, openings, created_at")
            .eq("employer_id", employerProfileId)
            .order("created_at", { ascending: false });

        const { data } = await fetchWithFallback("jobs", jobsPromise);
        if (data) setJobs(data);

      } catch (err) {
        console.error("Failed to load jobs:", err);
      } finally {
        setLoading(false);
      }
    }

    loadJobs();
  }, [employerProfileId, fetchWithFallback]);

  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  const JOB_TYPE_LABEL: Record<string, string> = {
    full_time: "Full-time", internship: "Internship", ppo: "PPO",
  };

  return (
    <div style={{ padding: "0 0 32px" }}>
      <PageHeader
        title="Job Postings"
        description="Manage all your job listings here."
        actions={
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            {isOffline && <StatusBadge status="warning" label="Offline Mode" />}
            <Link href="/employer/jobs/new" style={{ textDecoration: "none" }}>
              <Button disabled={!isApproved}>
                + New Job
              </Button>
            </Link>
          </div>
        }
      />

      <div style={{ padding: "0 28px" }}>
        <Card style={{ padding: 0, overflow: "hidden" }}>
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "60px", color: "var(--text-muted)" }}>
              <Loader2 className="animate-spin" size={32} />
            </div>
          ) : !jobs || jobs.length === 0 ? (
            <div style={{ padding: "60px", textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>
              No jobs posted yet.{" "}
              {isApproved ? (
                <Link href="/employer/jobs/new" style={{ color: "var(--accent-primary)", textDecoration: "none", fontWeight: 600 }}>
                  Create your first job posting →
                </Link>
              ) : (
                "Get approved first to post jobs."
              )}
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Role Title", "Type", "Openings", "Deadline", "Status", "Actions"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "16px 24px",
                        textAlign: "left",
                        fontSize: 12,
                        fontWeight: 600,
                        color: "var(--text-secondary)",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        borderBottom: "1px solid var(--border-primary)",
                        background: "var(--bg-secondary)",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr
                    key={job.id}
                    style={{
                      borderBottom: "1px solid var(--border-primary)",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-secondary)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "16px 24px", color: "var(--text-primary)", fontWeight: 600, fontSize: 14 }}>
                      {job.title}
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "4px 10px",
                          borderRadius: "20px",
                          fontSize: 12,
                          fontWeight: 600,
                          background: "var(--accent-light)",
                          color: "var(--accent-text)",
                        }}
                      >
                        {JOB_TYPE_LABEL[job.job_type] ?? job.job_type}
                      </span>
                    </td>
                    <td style={{ padding: "16px 24px", color: "var(--text-secondary)", fontSize: 14 }}>
                      {job.openings}
                    </td>
                    <td style={{ padding: "16px 24px", color: "var(--text-secondary)", fontSize: 14 }}>
                      {fmt(job.deadline)}
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <StatusBadge
                        status={job.status === "active" || job.status === "published" ? "success" : "pending"}
                        label={job.status}
                      />
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <Link href={`/employer/jobs/${job.id}/applicants`} style={{ textDecoration: "none" }}>
                        <Button variant="secondary" size="sm">
                          View Applicants
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </div>
  );
}
