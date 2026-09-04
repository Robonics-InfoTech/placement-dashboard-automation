"use client";

import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import NavigationCard from "@/components/ui/NavigationCard";
import Card from "@/components/ui/Card";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function CollegeDashboardPage() {
  const [name, setName] = useState("Admin");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setName(
          (data.user.user_metadata?.full_name as string) ??
            data.user.email?.split("@")[0] ??
            "Admin"
        );
      }
    });
  }, []);

  return (
    <div style={{ padding: "0 0 32px" }}>
      <PageHeader
        title={`Admin Overview 🏫`}
        description="Placement cell management & analytics."
      />

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 14,
          padding: "20px 28px 0",
        }}
      >
        <StatCard label="Total Students" value="1,284" trend="+48 this month" color="var(--success)" />
        <StatCard label="Registered Employers" value="67" trend="+5 this month" color="var(--warning)" />
        <StatCard label="Placements This Year" value="318" trend="↑ 24% vs last yr" color="var(--accent-primary)" />
        <StatCard label="Pending Approvals" value="12" trend="Action required" trendUp={false} color="var(--error)" />
      </div>

      {/* Quick Actions */}
      <div style={{ padding: "20px 28px 0" }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12 }}>
          Quick Actions
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
          <NavigationCard title="Student Directory" description="Browse and manage students" href="/college/student-directory" icon="Users" disabled />
          <NavigationCard title="Employer Approvals" description="Review pending employers" href="/college/employer-approvals" icon="UserCheck" disabled />
          <NavigationCard title="Placement Drives" description="Manage placement drives" href="/college/placement-drives" icon="Target" disabled />
          <NavigationCard title="Analytics" description="View placement statistics" href="/college/analytics" icon="BarChart3" disabled />
          <NavigationCard title="Announcements" description="Send announcements" href="/college/announcements" icon="Megaphone" disabled />
          <NavigationCard title="Export Reports" description="Download placement reports" href="/college/reports" icon="Download" disabled />
        </div>
      </div>

      {/* Recent Students + Placement by Branch */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16, padding: "20px 28px 0" }}>
        <Card>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>
            Recent Students
          </div>
          {[
            { name: "Priya Sharma", branch: "CSE", batch: 2025, status: "Placed", company: "Infosys" },
            { name: "Arjun Mehta", branch: "ECE", batch: 2025, status: "Active", company: "—" },
            { name: "Neha Gupta", branch: "IT", batch: 2024, status: "Placed", company: "TCS" },
            { name: "Rohan Patel", branch: "MECH", batch: 2025, status: "Active", company: "—" },
            { name: "Sneha Rao", branch: "CSE", batch: 2024, status: "Placed", company: "Wipro" },
          ].map((s) => (
            <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--border-secondary)" }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--accent-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "var(--accent-text)" }}>
                {s.name[0]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{s.name}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{s.branch} · Batch {s.batch}{s.company !== "—" ? ` · ${s.company}` : ""}</div>
              </div>
              <span style={{
                fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: "var(--radius-full)",
                background: s.status === "Placed" ? "var(--success-light)" : "var(--bg-tertiary)",
                color: s.status === "Placed" ? "var(--success-text)" : "var(--text-muted)",
              }}>
                {s.status}
              </span>
            </div>
          ))}
        </Card>

        <Card>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>
            Placement by Branch
          </div>
          {[
            { branch: "CSE", placed: 88, total: 110 },
            { branch: "ECE", placed: 62, total: 90 },
            { branch: "IT", placed: 74, total: 95 },
            { branch: "MECH", placed: 45, total: 80 },
            { branch: "CIVIL", placed: 30, total: 60 },
          ].map((b) => {
            const pct = Math.round((b.placed / b.total) * 100);
            return (
              <div key={b.branch} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-secondary)", marginBottom: 5 }}>
                  <span>{b.branch} — {b.placed}/{b.total}</span>
                  <span style={{ color: "var(--success)", fontWeight: 600 }}>{pct}%</span>
                </div>
                <div style={{ height: 6, background: "var(--bg-tertiary)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: "var(--radius-full)", background: "var(--accent-primary)", width: `${pct}%`, transition: "width 0.8s ease" }} />
                </div>
              </div>
            );
          })}
        </Card>
      </div>

      <style>{`
        @media (max-width: 1000px) {
          div[style*="gridTemplateColumns: 1fr 340px"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
