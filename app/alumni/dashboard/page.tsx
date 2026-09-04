"use client";

import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import NavigationCard from "@/components/ui/NavigationCard";
import Card from "@/components/ui/Card";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function AlumniDashboardPage() {
  const [name, setName] = useState("Alumni");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setName(
          (data.user.user_metadata?.full_name as string) ??
            data.user.email?.split("@")[0] ??
            "Alumni"
        );
      }
    });
  }, []);

  return (
    <div style={{ padding: "0 0 32px" }}>
      <PageHeader
        title={`Welcome, ${name.split(" ")[0]} 🎓`}
        description="Your alumni portal — explore opportunities and stay connected."
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 14,
          padding: "20px 28px 0",
        }}
      >
        <StatCard label="Alumni Jobs" value={0} color="var(--accent-primary)" />
        <StatCard label="My Applications" value={0} color="var(--info)" />
        <StatCard label="Interviews" value={0} color="var(--warning)" />
        <StatCard label="Offers" value={0} color="var(--success)" />
      </div>

      <div style={{ padding: "20px 28px 0" }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12 }}>
          Quick Actions
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
          <NavigationCard title="Browse Alumni Jobs" description="Find jobs posted for alumni" href="/alumni/jobs" icon="Briefcase" />
          <NavigationCard title="My Profile" description="Update your alumni profile" href="/alumni/profile" icon="User" />
          <NavigationCard title="Resume Review" description="Get your resume reviewed" href="/alumni/resume-review" icon="FileSearch" disabled />
          <NavigationCard title="Notifications" description="Check your alerts" href="/alumni/notifications" icon="Bell" disabled />
        </div>
      </div>

      <div style={{ padding: "20px 28px 0" }}>
        <Card>
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)", fontSize: 14 }}>
            Your alumni dashboard is being set up. Check back soon for personalized content.
          </div>
        </Card>
      </div>
    </div>
  );
}
