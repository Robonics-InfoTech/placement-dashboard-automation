"use client";

import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import NavigationCard from "@/components/ui/NavigationCard";
import Card from "@/components/ui/Card";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Briefcase, Building2, Calendar, MapPin } from "lucide-react";

interface AlumniStats {
  totalAlumniJobs: number;
  myApplications: number;
  interviews: number;
  offers: number;
}

interface RecentJob {
  id: string;
  title: string;
  location?: string;
  job_type: string;
  deadline?: string;
  employer_profiles?: { company_name: string; industry?: string } | null;
}

function Skeleton({ h = 60 }: { h?: number }) {
  return (
    <div style={{ height: h, borderRadius: "var(--radius-md)", background: "var(--bg-tertiary)", animation: "pulse 1.5s ease-in-out infinite" }} />
  );
}

export default function AlumniDashboardPage() {
  const [name, setName] = useState("Alumni");
  const [userId, setUserId] = useState<string | null>(null);
  const [stats, setStats] = useState<AlumniStats | null>(null);
  const [recentJobs, setRecentJobs] = useState<RecentJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setUserId(user.id);
        setName(
          (user.user_metadata?.full_name as string) ??
          user.email?.split("@")[0] ??
          "Alumni"
        );

        // Parallel fetches
        const [alumniJobsRes, recentJobsRes] = await Promise.all([
          supabase.from("alumni_jobs").select("id", { count: "exact", head: true }),
          supabase
            .from("alumni_jobs")
            .select("id, title, location, job_type, deadline, employer_profiles(company_name, industry)")
            .eq("status", "active")
            .order("created_at", { ascending: false })
            .limit(5),
        ]);

        // Alumni job applications — via regular applications table for this user's student/alumni profile
        // since alumni_jobs don't have a dedicated applications table yet, we approximate
        const { count: appsCount } = await supabase
          .from("applications")
          .select("*", { count: "exact", head: true })
          .eq("student_id", user.id); // alumni may apply with their user id directly

        const { count: interviewCount } = await supabase
          .from("applications")
          .select("*", { count: "exact", head: true })
          .eq("student_id", user.id)
          .in("application_status", ["shortlisted", "selected"]);

        const { count: offerCount } = await supabase
          .from("offers")
          .select("*", { count: "exact", head: true })
          .eq("student_id", user.id);

        setStats({
          totalAlumniJobs: alumniJobsRes.count ?? 0,
          myApplications: appsCount ?? 0,
          interviews: interviewCount ?? 0,
          offers: offerCount ?? 0,
        });

        setRecentJobs(
          (recentJobsRes.data ?? []).map((j: any) => ({
            ...j,
            employer_profiles: Array.isArray(j.employer_profiles) ? j.employer_profiles[0] ?? null : j.employer_profiles,
          })) as RecentJob[]
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const JOB_TYPE_LABELS: Record<string, string> = {
    full_time: "Full-Time",
    part_time: "Part-Time",
    contract: "Contract",
    internship: "Internship",
  };

  return (
    <div style={{ padding: "0 0 32px" }}>
      <PageHeader
        title={`Welcome back, ${name.split(" ")[0]} 🎓`}
        description="Your alumni portal — explore job opportunities and stay connected."
      />

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, padding: "20px 28px 0" }}>
        {loading ? (
          [1, 2, 3, 4].map(i => <Card key={i}><Skeleton h={64} /></Card>)
        ) : (
          <>
            <StatCard label="Alumni Jobs Available" value={stats?.totalAlumniJobs ?? 0} trend="Active openings" color="var(--accent-primary)" />
            <StatCard label="My Applications" value={stats?.myApplications ?? 0} trend="Total submitted" color="var(--info)" />
            <StatCard label="Interviews" value={stats?.interviews ?? 0} trend="Shortlisted / Selected" color="var(--warning)" />
            <StatCard label="Offers Received" value={stats?.offers ?? 0} trend="Total offers" color="var(--success)" />
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div style={{ padding: "20px 28px 0" }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12 }}>
          Quick Actions
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
          <NavigationCard title="Browse Alumni Jobs" description="Find jobs posted for alumni network" href="/alumni/jobs" icon="Briefcase" />
          <NavigationCard title="My Profile" description="Update your alumni profile and experience" href="/alumni/profile" icon="User" />
          <NavigationCard title="Notifications" description="Stay updated on new opportunities" href="/alumni/notifications" icon="Bell" />
          <NavigationCard title="Feedback" description="Share suggestions with the platform" href="/alumni/feedback" icon="MessageSquare" />
        </div>
      </div>

      {/* Recent Alumni Jobs */}
      <div style={{ padding: "20px 28px 0" }}>
        <Card>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>Recent Alumni Job Openings</div>
            <a href="/alumni/jobs" style={{ fontSize: 12, color: "var(--accent-text)", textDecoration: "none", fontWeight: 600 }}>View all →</a>
          </div>

          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[1, 2, 3].map(i => <Skeleton key={i} h={44} />)}
            </div>
          ) : recentJobs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <Briefcase size={36} style={{ color: "var(--text-muted)", margin: "0 auto 12px", display: "block" }} />
              <div style={{ fontSize: 14, color: "var(--text-muted)" }}>No alumni jobs posted yet. Check back soon.</div>
            </div>
          ) : (
            recentJobs.map(job => (
              <div key={job.id} style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, padding: "11px 0", borderBottom: "1px solid var(--border-secondary)" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 3 }}>{job.title}</div>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    {job.employer_profiles?.company_name && (
                      <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--text-muted)" }}>
                        <Building2 size={11} />{job.employer_profiles.company_name}
                      </span>
                    )}
                    {job.location && (
                      <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--text-muted)" }}>
                        <MapPin size={11} />{job.location}
                      </span>
                    )}
                    {job.deadline && (
                      <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--text-muted)" }}>
                        <Calendar size={11} />Deadline: {new Date(job.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </span>
                    )}
                  </div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: "var(--radius-full)", background: "var(--accent-light)", color: "var(--accent-text)", whiteSpace: "nowrap", flexShrink: 0 }}>
                  {JOB_TYPE_LABELS[job.job_type] ?? job.job_type}
                </span>
              </div>
            ))
          )}
        </Card>
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
    </div>
  );
}
