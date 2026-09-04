"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { getDashboardStats, getAvailableJobsCount } from "@/lib/student/dashboard";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import NavigationCard from "@/components/ui/NavigationCard";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

import RecentApplications from "@/components/student/RecentApplications";
import UpcomingDeadlines from "@/components/student/UpcomingDeadlines";
import ProfileStrength from "@/components/student/ProfileStrength";

export default function StudentDashboardPage() {
  const [user, setUser] = useState<{ email: string; metadata: Record<string, string> } | null>(null);
  const [dashboardStats, setDashboardStats] = useState<{
    applied: number;
    shortlisted: number;
    selected: number;
    rejected: number;
  } | null>(null);
  const [availableJobs, setAvailableJobs] = useState(0);
  const [profileStrength, setProfileStrength] = useState(0);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({
          email: data.user.email ?? "",
          metadata: (data.user.user_metadata ?? {}) as Record<string, string>,
        });

        supabase
          .from("student_profiles")
          .select("id, full_name, phone, branch, cgpa, graduation_year, resume_url, linkedin_url, github_url, portfolio_url")
          .eq("user_id", data.user.id)
          .single()
          .then(async ({ data: profile }) => {
            if (profile?.id) {
              getDashboardStats(profile.id).then(setDashboardStats).catch(console.error);
            }

            const { data: skills } = await supabase
              .from("student_skills")
              .select("id")
              .eq("student_id", profile?.id);

            const checks = [
              !!profile?.full_name,
              !!profile?.phone,
              !!profile?.branch,
              profile?.cgpa != null,
              profile?.graduation_year != null,
              !!profile?.resume_url,
              !!profile?.linkedin_url,
              !!profile?.github_url,
              !!profile?.portfolio_url,
              (skills?.length ?? 0) > 0,
            ];
            setProfileStrength(checks.filter(Boolean).length * 10);
          });

        getAvailableJobsCount().then(setAvailableJobs).catch(console.error);
      }
    });
  }, []);

  const name = user?.metadata?.full_name ?? user?.email?.split("@")[0] ?? "Student";

  return (
    <div style={{ padding: "0 0 32px" }}>
      <PageHeader
        title={`Welcome back, ${name.split(" ")[0]} 👋`}
        description="Here's what's happening with your placements today."
        actions={<Button href="/student/jobs">Browse Jobs</Button>}
      />

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
          gap: 14,
          padding: "20px 28px 0",
        }}
      >
        <StatCard label="Applications" value={dashboardStats?.applied ?? 0} color="var(--accent-primary)" />
        <StatCard label="Shortlisted" value={dashboardStats?.shortlisted ?? 0} color="var(--info)" />
        <StatCard label="Selected" value={dashboardStats?.selected ?? 0} color="var(--success)" />
        <StatCard label="Available Jobs" value={availableJobs} color="var(--warning)" />
        <StatCard label="Profile Strength" value={`${profileStrength}%`} color="var(--pending)" />
      </div>

      {/* Quick Actions */}
      <div style={{ padding: "20px 28px 0" }}>
        <h3
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            marginBottom: 12,
          }}
        >
          Quick Actions
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 12,
          }}
        >
          <NavigationCard title="Browse Drives" description="Find upcoming placement drives" href="/student/drives" icon="Target" disabled />
          <NavigationCard title="My Applications" description="Track your application status" href="/student/applications" icon="FileText" />
          <NavigationCard title="My Offers" description="View and respond to offers" href="/student/offers" icon="Gift" />
          <NavigationCard title="My Profile" description="Update your profile and resume" href="/student/profile" icon="User" />
          <NavigationCard title="Documents" description="Upload and manage documents" href="/student/documents" icon="FolderOpen" />
          <NavigationCard title="Notifications" description="View alerts and updates" href="/student/notifications" icon="Bell" />
        </div>
      </div>

      {/* Bottom grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 340px",
          gap: 16,
          padding: "20px 28px 0",
        }}
      >
        <Card>
          <RecentApplications />
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card>
            <UpcomingDeadlines />
          </Card>
          <Card>
            <ProfileStrength />
          </Card>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          div[style*="1fr 340px"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}