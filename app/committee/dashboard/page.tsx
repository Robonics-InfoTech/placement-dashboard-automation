"use client";

import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import NavigationCard from "@/components/ui/NavigationCard";
import Card from "@/components/ui/Card";

export default function CommitteeDashboardPage() {
  return (
    <div style={{ padding: "0 0 32px" }}>
      {/* Read-only banner */}
      <div
        style={{
          margin: "16px 28px 0",
          padding: "10px 16px",
          borderRadius: "var(--radius-md)",
          background: "var(--info-light)",
          color: "var(--info-text)",
          fontSize: 13,
          fontWeight: 500,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        🔒 Read-only placement committee view — you can view data but cannot make changes.
      </div>

      <PageHeader
        title="Committee Overview 📋"
        description="Read-only view of placement cell data."
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 14,
          padding: "20px 28px 0",
        }}
      >
        <StatCard label="Students" value="1,284" color="var(--accent-primary)" />
        <StatCard label="Applications" value="856" color="var(--info)" />
        <StatCard label="Placements" value="318" color="var(--success)" />
        <StatCard label="Pending" value="12" color="var(--warning)" />
      </div>

      <div style={{ padding: "20px 28px 0" }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12 }}>
          Available Views
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
          <NavigationCard title="View Students" description="Browse student directory (read-only)" href="/committee/students" icon="Users" disabled />
          <NavigationCard title="View Applications" description="Browse applications (read-only)" href="/committee/applications" icon="FileText" disabled />
          <NavigationCard title="Submit Feedback" description="Send feedback to administrators" href="/committee/feedback" icon="MessageSquare" disabled />
        </div>
      </div>

      <div style={{ padding: "20px 28px 0" }}>
        <Card>
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)", fontSize: 14 }}>
            Committee workspace is being set up. Read-only access to student and application data will be available here.
          </div>
        </Card>
      </div>
    </div>
  );
}
