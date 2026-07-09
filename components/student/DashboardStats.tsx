"use client";

type DashboardStatsProps = {
  stats?: {
    applied: number;
    shortlisted: number;
    selected: number;
    rejected: number;
  } | null;

  availableJobs?: number;
  profileStrength?: number;
};

export default function DashboardStats({
  stats,
  availableJobs = 0,
  profileStrength = 0,
}: DashboardStatsProps) {
  const cards = [
    {
      label: "Applications",
      value: stats?.applied ?? 0,
      color: "#6366F1",
    },
    {
      label: "Shortlisted",
      value: stats?.shortlisted ?? 0,
      color: "#8B5CF6",
    },
    {
      label: "Available Jobs",
      value: availableJobs,
      color: "#06B6D4",
    },
    {
      label: "Profile Strength",
      value: `${profileStrength}%`,
      color: "#10B981",
    },
  ];

  return (
    <div className="sd-stats">
      {cards.map((card) => (
        <div
          key={card.label}
          className="sd-stat-card"
        >
          <div
            className="sd-stat-dot"
            style={{
              background: card.color,
            }}
          />

          <div className="sd-stat-value">
            {card.value}
          </div>

          <div className="sd-stat-label">
            {card.label}
          </div>
        </div>
      ))}
    </div>
  );
}