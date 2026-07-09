"use client";

import Link from "next/link";

const actions = [
  {
    title: "Update Profile",
    description: "Complete your personal and academic details",
    href: "/student/profile",
  },
  {
    title: "Manage Documents",
    description: "Upload resume and certificates",
    href: "/student/documents",
  },
  {
    title: "Browse Jobs",
    description: "Find eligible placement opportunities",
    href: "/student/jobs",
  },
  {
    title: "Track Applications",
    description: "Check your application status",
    href: "/student/applications",
  },
];

export default function QuickActions() {
  return (
    <div>
      <h3 style={{ marginBottom: "16px" }}>
        Quick Actions
      </h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: "16px",
        }}
      >
        {actions.map((action) => (
          <Link
            key={action.title}
            href={action.href}
            className="sd-card"
            style={{
              textDecoration: "none",
            }}
          >
            <h4 style={{ color: "white" }}>
              {action.title}
            </h4>

            <p
              style={{
                color: "#94A3B8",
                fontSize: "13px",
                marginTop: "8px",
              }}
            >
              {action.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}