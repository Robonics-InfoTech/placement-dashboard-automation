"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useDataSync } from "@/lib/hooks/useDataSync";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import PageHeader from "@/components/ui/PageHeader";
import { MapPin, Banknote, Calendar, Loader2, CheckCircle2, XCircle } from "lucide-react";

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState("");
  const [employmentFilter, setEmploymentFilter] = useState("");
  const [sortBy, setSortBy] = useState("deadline");

  const { fetchWithFallback, isOffline } = useDataSync();

  useEffect(() => {
    loadJobs();
  }, []);

  async function loadJobs() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Use offline fallback hook for fetching jobs
      const jobsPromise = supabase
        .from("jobs")
        .select("*")
        .eq("status", "published")
        .is("deleted_at", null)
        .order("application_deadline", { ascending: true });

      const [jobsResponse, profileResponse] = await Promise.all([
        fetchWithFallback("jobs", jobsPromise),
        fetchWithFallback("profiles", supabase.from("student_profiles").select("*").eq("user_id", user.id).single())
      ]);

      if (jobsResponse.data) setJobs(jobsResponse.data as any[]);
      if (profileResponse.data) setProfile(profileResponse.data);
      
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function isEligible(job: any) {
    if (!profile) return false;
    const cgpa = Number(profile.cgpa) >= Number(job.minimum_cgpa);
    const backlogs = profile.active_backlogs <= job.maximum_backlogs;
    const branch = job.eligible_branches?.includes(profile.branch);
    const graduation = job.eligible_graduation_years?.includes(profile.graduation_year);
    return cgpa && backlogs && branch && graduation;
  }

  useEffect(() => {
    let filtered = [...jobs];

    if (search) {
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(search.toLowerCase()) ||
          job.company_name?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (locationFilter) {
      filtered = filtered.filter((job) =>
        job.location?.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    if (jobTypeFilter) {
      filtered = filtered.filter((job) => job.job_type === jobTypeFilter);
    }

    if (employmentFilter) {
      filtered = filtered.filter((job) => job.employment_type === employmentFilter);
    }

    if (sortBy === "salary") {
      filtered.sort((a, b) => Number(b.salary_package) - Number(a.salary_package));
    } else if (sortBy === "deadline") {
      filtered.sort((a, b) => new Date(a.application_deadline).getTime() - new Date(b.application_deadline).getTime());
    } else if (sortBy === "latest") {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    setFilteredJobs(filtered);
  }, [jobs, search, locationFilter, jobTypeFilter, employmentFilter, sortBy]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "100px", color: "var(--text-muted)" }}>
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div style={{ padding: "0 0 32px" }}>
      <PageHeader
        title="Job Opportunities"
        description="Browse and apply for the latest placements and internships."
        actions={
          isOffline && (
            <StatusBadge status="warning" label="Offline Mode" />
          )
        }
      />

      <div style={{ padding: "0 28px" }}>
        <Card style={{ marginBottom: 24 }}>
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
            <input
              type="text"
              placeholder="Search by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="focus-ring"
              style={{
                padding: "10px 14px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-primary)",
                background: "var(--bg-primary)",
                color: "var(--text-primary)"
              }}
            />
            <input
              type="text"
              placeholder="Location"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="focus-ring"
              style={{
                padding: "10px 14px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-primary)",
                background: "var(--bg-primary)",
                color: "var(--text-primary)"
              }}
            />
            <select
              value={jobTypeFilter}
              onChange={(e) => setJobTypeFilter(e.target.value)}
              className="focus-ring"
              style={{
                padding: "10px 14px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-primary)",
                background: "var(--bg-primary)",
                color: "var(--text-primary)"
              }}
            >
              <option value="">All Job Types</option>
              <option value="placement">Placement</option>
              <option value="internship">Internship</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="focus-ring"
              style={{
                padding: "10px 14px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-primary)",
                background: "var(--bg-primary)",
                color: "var(--text-primary)"
              }}
            >
              <option value="deadline">Deadline</option>
              <option value="salary">Salary</option>
              <option value="latest">Latest</option>
            </select>
          </div>
        </Card>

        <div style={{ display: "grid", gap: 16 }}>
          {filteredJobs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px", color: "var(--text-muted)", background: "var(--bg-card)", borderRadius: "var(--radius-xl)", border: "1px dashed var(--border-primary)" }}>
              No jobs found matching your criteria.
            </div>
          ) : (
            filteredJobs.map((job) => {
              const eligible = isEligible(job);
              return (
                <Card key={job.id} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
                    <div>
                      <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 4px" }}>
                        {job.title}
                      </h2>
                      <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0, fontWeight: 500 }}>
                        {job.company_name}
                      </p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <StatusBadge status={job.job_type === "placement" ? "approved" : "pending"}>
                        {job.job_type === "placement" ? "Placement" : "Internship"}
                      </StatusBadge>
                      <StatusBadge status={eligible ? "approved" : "rejected"}>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          {eligible ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                          {eligible ? "Eligible" : "Not Eligible"}
                        </div>
                      </StatusBadge>
                    </div>
                  </div>

                  <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {job.description}
                  </p>

                  <div style={{ display: "flex", gap: 24, flexWrap: "wrap", padding: "16px 0", borderTop: "1px solid var(--border-primary)", borderBottom: "1px solid var(--border-primary)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-secondary)", fontSize: 13 }}>
                      <MapPin size={16} color="var(--accent-primary)" />
                      {job.location}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-secondary)", fontSize: 13 }}>
                      <Banknote size={16} color="var(--success)" />
                      ₹{Number(job.salary_package).toLocaleString()}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-secondary)", fontSize: 13 }}>
                      <Calendar size={16} color="var(--info)" />
                      Deadline: {new Date(job.application_deadline).toLocaleDateString()}
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <Link href={`/student/jobs/${job.id}`} style={{ textDecoration: "none" }}>
                      <Button>
                        View Details
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}