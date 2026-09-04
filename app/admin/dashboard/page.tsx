"use client";

import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import NavigationCard from "@/components/ui/NavigationCard";
import Card from "@/components/ui/Card";
import DatabaseManager from "@/components/settings/DatabaseManager";

export default function SuperAdminDashboardPage() {
  return (
    <div style={{ padding: "0 0 32px" }}>
      <PageHeader
        title="Platform Overview ⚡"
        description="Super admin — platform-wide management and analytics."
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 14,
          padding: "20px 28px 0",
        }}
      >
        <StatCard label="Total Colleges" value={3} color="var(--accent-primary)" />
        <StatCard label="Total Employers" value={67} color="var(--info)" />
        <StatCard label="Total Users" value="1,418" color="var(--success)" />
        <StatCard label="Active Jobs" value={42} color="var(--warning)" />
        <StatCard label="Error Logs" value={0} trend="All clear" color="var(--error)" />
      </div>

      <div style={{ padding: "20px 28px 0" }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12 }}>
          Administration
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
          <NavigationCard title="Colleges" description="Manage registered institutions" href="/admin/colleges" icon="Building" disabled />
          <NavigationCard title="Employers" description="Manage all employers" href="/admin/employers" icon="Building2" disabled />
          <NavigationCard title="Users" description="Manage all platform users" href="/admin/users" icon="Users" disabled />
          <NavigationCard title="Marketplace" description="Manage listings" href="/admin/marketplace" icon="Store" disabled />
          <NavigationCard title="Feedback Inbox" description="Review all feedback" href="/admin/feedback" icon="Inbox" disabled />
          <NavigationCard title="Audit Reports" description="Platform audit trail" href="/admin/audit" icon="Shield" disabled />
          <NavigationCard title="Error Logs" description="System error tracking" href="/admin/errors" icon="AlertTriangle" disabled />
          <NavigationCard title="Settings" description="Platform configuration" href="/admin/settings" icon="Settings" disabled />
        </div>
      </div>

      <div style={{ padding: "20px 28px 0" }}>
        <DatabaseManager />
      </div>
    </div>
  );
}