"use client";

import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Briefcase, MapPin, Calendar, Building2, Search } from "lucide-react";

const JOB_TYPE_LABELS: Record<string, string> = {
  full_time: "Full-Time",
  part_time: "Part-Time",
  contract: "Contract",
  internship: "Internship",
};

export default function AlumniJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("alumni_jobs")
        .select("id, title, description, location, job_type, salary_min, salary_max, deadline, created_at, employer_profiles(company_name, industry)")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(50);
      setJobs(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = jobs.filter(j =>
    !search ||
    j.title?.toLowerCase().includes(search.toLowerCase()) ||
    j.employer_profiles?.company_name?.toLowerCase().includes(search.toLowerCase()) ||
    j.location?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: "0 0 32px" }}>
      <PageHeader title="Browse Alumni Jobs" description="Job openings available to PlacementHub alumni network members." />

      <div style={{ padding: "20px 28px 0" }}>
        <div style={{ position: "relative", maxWidth: 400 }}>
          <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title, company or location…"
            style={{ width: "100%", padding: "9px 12px 9px 36px", border: "1px solid var(--border-primary)", borderRadius: "var(--radius-md)", background: "var(--bg-card)", color: "var(--text-primary)", fontSize: 13, outline: "none", fontFamily: "var(--font-sans)" }}
          />
        </div>
      </div>

      <div style={{ padding: "16px 28px 0", display: "flex", flexDirection: "column", gap: 12 }}>
        {loading ? (
          [1,2,3].map(i => <Card key={i}><div style={{ height: 80, background: "var(--bg-tertiary)", borderRadius: "var(--radius-md)", animation: "pulse 1.5s ease-in-out infinite" }} /></Card>)
        ) : filtered.length === 0 ? (
          <Card>
            <div style={{ textAlign: "center", padding: "48px 0" }}>
              <Briefcase size={40} style={{ color: "var(--text-muted)", margin: "0 auto 14px", display: "block" }} />
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginBottom: 6 }}>
                {search ? "No jobs match your search" : "No alumni jobs posted yet"}
              </div>
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                {search ? "Try different search terms." : "Check back later — employers post new openings regularly."}
              </p>
            </div>
          </Card>
        ) : (
          filtered.map(job => (
            <Card key={job.id} hover>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>{job.title}</div>
                  <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 8 }}>
                    {job.employer_profiles?.company_name && (
                      <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--text-secondary)" }}>
                        <Building2 size={12} />{job.employer_profiles.company_name}
                      </span>
                    )}
                    {job.location && (
                      <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--text-muted)" }}>
                        <MapPin size={12} />{job.location}
                      </span>
                    )}
                    {job.deadline && (
                      <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--text-muted)" }}>
                        <Calendar size={12} />Deadline: {new Date(job.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    )}
                  </div>
                  {(job.salary_min || job.salary_max) && (
                    <div style={{ fontSize: 13, color: "var(--success)", fontWeight: 600 }}>
                      ₹{job.salary_min ? `${(job.salary_min / 100000).toFixed(1)}L` : ""}{job.salary_max ? ` – ${(job.salary_max / 100000).toFixed(1)}L` : ""} per annum
                    </div>
                  )}
                  {job.description && (
                    <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8, lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                      {job.description}
                    </p>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: "var(--radius-full)", background: "var(--accent-light)", color: "var(--accent-text)" }}>
                    {JOB_TYPE_LABELS[job.job_type] ?? job.job_type}
                  </span>
                  <button style={{ padding: "7px 16px", borderRadius: "var(--radius-md)", background: "var(--accent-primary)", color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                    Apply Now
                  </button>
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
