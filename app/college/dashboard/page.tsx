"use client";

import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import NavigationCard from "@/components/ui/NavigationCard";
import Card from "@/components/ui/Card";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import {
  getCollegeId,
  getCollegeDashboardStats,
  getRecentStudents,
  getPlacementByBranch,
  type CollegeDashboardStats,
  type RecentStudent,
  type BranchPlacement,
} from "@/lib/college/dashboard";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ width = "100%", height = 20 }: { width?: string | number; height?: number }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: "var(--radius-md)",
        background: "var(--bg-tertiary)",
        animation: "pulse 1.5s ease-in-out infinite",
      }}
    />
  );
}

// ─── Status pill ──────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  placed: { bg: "var(--success-light)", color: "var(--success-text)", label: "Placed" },
  eligible: { bg: "var(--bg-tertiary)", color: "var(--text-muted)", label: "Eligible" },
  not_eligible: { bg: "var(--error-light)", color: "var(--error-text)", label: "Not Eligible" },
  opted_out: { bg: "var(--warning-light)", color: "var(--warning-text)", label: "Opted Out" },
};

function StatusPill({ status }: { status: string }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.eligible;
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 600,
        padding: "3px 10px",
        borderRadius: "var(--radius-full)",
        background: s.bg,
        color: s.color,
        whiteSpace: "nowrap",
      }}
    >
      {s.label}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CollegeDashboardPage() {
  const [name, setName] = useState("Admin");
  const [collegeId, setCollegeId] = useState<string | null>(null);
  const [stats, setStats] = useState<CollegeDashboardStats | null>(null);
  const [recentStudents, setRecentStudents] = useState<RecentStudent[]>([]);
  const [branchStats, setBranchStats] = useState<BranchPlacement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        // Get user name
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setName(
            (user.user_metadata?.full_name as string) ??
            user.email?.split("@")[0] ??
            "Admin"
          );
        }

        // Resolve college_id
        const cid = await getCollegeId();
        setCollegeId(cid);

        if (!cid) {
          setError("Could not resolve your college. Please contact support.");
          return;
        }

        // Fetch all data in parallel
        const [dashStats, students, branches] = await Promise.all([
          getCollegeDashboardStats(cid),
          getRecentStudents(cid, 6),
          getPlacementByBranch(cid),
        ]);

        setStats(dashStats);
        setRecentStudents(students);
        setBranchStats(branches);
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const thisYear = new Date().getFullYear();

  return (
    <div style={{ padding: "0 0 32px" }}>
      <PageHeader
        title={`Welcome, ${name} 🏫`}
        description="Your placement cell at a glance — real-time data from your institution."
      />

      {error && (
        <div
          style={{
            margin: "16px 28px 0",
            padding: "12px 16px",
            borderRadius: "var(--radius-md)",
            background: "var(--error-light)",
            color: "var(--error-text)",
            fontSize: 13,
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 14,
          padding: "20px 28px 0",
        }}
      >
        {loading ? (
          <>
            <Card><Skeleton height={64} /></Card>
            <Card><Skeleton height={64} /></Card>
            <Card><Skeleton height={64} /></Card>
            <Card><Skeleton height={64} /></Card>
          </>
        ) : (
          <>
            <StatCard
              label="Total Students"
              value={stats?.totalStudents ?? 0}
              trend={stats?.totalStudents === 0 ? "No students yet" : `Registered under your college`}
              trendUp={stats?.totalStudents !== 0}
              color="var(--success)"
            />
            <StatCard
              label="Registered Employers"
              value={stats?.registeredEmployers ?? 0}
              trend={stats?.registeredEmployers === 0 ? "No employers yet" : "Via job postings"}
              trendUp={stats?.registeredEmployers !== 0}
              color="var(--warning)"
            />
            <StatCard
              label={`Placements ${thisYear}`}
              value={stats?.placementsThisYear ?? 0}
              trend={stats?.placementsThisYear === 0 ? "No placements yet" : "Accepted offers this year"}
              trendUp={stats?.placementsThisYear !== 0}
              color="var(--accent-primary)"
            />
            <StatCard
              label="Pending Approvals"
              value={stats?.pendingApprovals ?? 0}
              trend={
                stats?.pendingApprovals === 0
                  ? "All clear ✓"
                  : `${stats?.pendingApprovals} employer${stats?.pendingApprovals !== 1 ? "s" : ""} awaiting review`
              }
              trendUp={stats?.pendingApprovals === 0}
              color={stats?.pendingApprovals ? "var(--error)" : "var(--success)"}
            />
          </>
        )}
      </div>

      {/* ── Quick Actions ──────────────────────────────────────────────────── */}
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
          <NavigationCard title="Student Directory" description="Browse and manage students" href="/college/student-directory" icon="Users" disabled />
          <NavigationCard title="Employer Approvals" description={stats?.pendingApprovals ? `${stats.pendingApprovals} pending` : "Review pending employers"} href="/college/employer-approvals" icon="UserCheck" disabled />
          <NavigationCard title="Placement Drives" description="Manage placement drives" href="/college/placement-drives" icon="Target" disabled />
          <NavigationCard title="Analytics" description="View placement statistics" href="/college/analytics" icon="BarChart3" disabled />
          <NavigationCard title="Announcements" description="Send announcements" href="/college/announcements" icon="Megaphone" disabled />
          <NavigationCard title="Export Reports" description="Download placement reports" href="/college/reports" icon="Download" disabled />
        </div>
      </div>

      {/* ── Recent Students + Branch Breakdown ────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 340px",
          gap: 16,
          padding: "20px 28px 0",
        }}
      >
        {/* Recent Students */}
        <Card>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
              Recently Registered Students
            </div>
            {!loading && collegeId && (
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                Latest {recentStudents.length} of {stats?.totalStudents ?? 0}
              </span>
            )}
          </div>

          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} height={40} />
              ))}
            </div>
          ) : recentStudents.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "32px 0",
                color: "var(--text-muted)",
                fontSize: 13,
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }}>🎓</div>
              No students registered yet.
              <br />
              Share your enrollment key so students can sign up.
            </div>
          ) : (
            recentStudents.map((s) => (
              <div
                key={s.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 0",
                  borderBottom: "1px solid var(--border-secondary)",
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    background: "var(--accent-light)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--accent-text)",
                    flexShrink: 0,
                  }}
                >
                  {(s.full_name?.[0] ?? "?").toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {s.full_name}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    {s.branch} · Batch {s.graduation_year}
                    {s.company ? ` · ${s.company}` : ""}
                  </div>
                </div>
                <StatusPill status={s.placement_status} />
              </div>
            ))
          )}
        </Card>

        {/* Placement by Branch */}
        <Card>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>
            Placement by Branch
          </div>

          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} height={36} />
              ))}
            </div>
          ) : branchStats.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "32px 0",
                color: "var(--text-muted)",
                fontSize: 13,
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 8 }}>📊</div>
              No branch data available yet.
            </div>
          ) : (
            branchStats.slice(0, 7).map((b) => {
              const pct = b.total > 0 ? Math.round((b.placed / b.total) * 100) : 0;
              return (
                <div key={b.branch} style={{ marginBottom: 16 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 12,
                      color: "var(--text-secondary)",
                      marginBottom: 6,
                    }}
                  >
                    <span>
                      {b.branch}
                      <span style={{ color: "var(--text-muted)", marginLeft: 6 }}>
                        {b.placed}/{b.total}
                      </span>
                    </span>
                    <span
                      style={{
                        color: pct >= 70 ? "var(--success)" : pct >= 40 ? "var(--warning)" : "var(--text-muted)",
                        fontWeight: 600,
                      }}
                    >
                      {pct}%
                    </span>
                  </div>
                  <div
                    style={{
                      height: 6,
                      background: "var(--bg-tertiary)",
                      borderRadius: "var(--radius-full)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        borderRadius: "var(--radius-full)",
                        background:
                          pct >= 70
                            ? "var(--success)"
                            : pct >= 40
                            ? "var(--warning)"
                            : "var(--accent-primary)",
                        width: `${pct}%`,
                        transition: "width 0.8s ease",
                      }}
                    />
                  </div>
                </div>
              );
            })
          )}

          {/* Summary footer */}
          {!loading && branchStats.length > 0 && (
            <div
              style={{
                marginTop: 8,
                paddingTop: 12,
                borderTop: "1px solid var(--border-secondary)",
                fontSize: 11,
                color: "var(--text-muted)",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>
                Total:{" "}
                <strong style={{ color: "var(--text-secondary)" }}>
                  {branchStats.reduce((a, b) => a + b.total, 0)} students
                </strong>
              </span>
              <span>
                Placed:{" "}
                <strong style={{ color: "var(--success)" }}>
                  {branchStats.reduce((a, b) => a + b.placed, 0)}
                </strong>
              </span>
            </div>
          )}
        </Card>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @media (max-width: 1000px) {
          div[style*="gridTemplateColumns: 1fr 340px"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
