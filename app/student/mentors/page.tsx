"use client";

import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import { Users } from "lucide-react";

const mentors = [
  { name: "Priya Nair", role: "Software Engineer", company: "Google", expertise: ["DSA", "System Design", "Interviews"], batch: "CSE 2021", availability: "Weekends", avatar: "P" },
  { name: "Rahul Mehta", role: "Product Manager", company: "Flipkart", expertise: ["Product Strategy", "Case Studies", "MBA Prep"], batch: "IT 2020", availability: "Weekday evenings", avatar: "R" },
  { name: "Sneha Agarwal", role: "Data Scientist", company: "Amazon", expertise: ["ML/AI", "Python", "Statistics"], batch: "CSE 2022", availability: "Flexible", avatar: "S" },
  { name: "Karthik Subramanian", role: "DevOps Engineer", company: "Microsoft", expertise: ["Cloud (AWS/Azure)", "CI/CD", "Linux"], batch: "ECE 2021", availability: "Weekends", avatar: "K" },
];

const COLORS = ["var(--accent-primary)", "#8B5CF6", "var(--success)", "var(--warning)"];

export default function MentorConnectPage() {
  return (
    <div style={{ padding: "0 0 32px" }}>
      <PageHeader
        title="Mentor Connect"
        description="Connect with alumni mentors for career guidance, mock interviews and resume feedback."
      />

      {/* Info banner */}
      <div style={{ margin: "20px 28px 0", padding: "16px 20px", borderRadius: "var(--radius-lg)", background: "var(--accent-lighter)", border: "1px solid var(--accent-primary)", display: "flex", alignItems: "center", gap: 14 }}>
        <Users size={20} style={{ color: "var(--accent-text)", flexShrink: 0 }} />
        <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
          <strong style={{ color: "var(--accent-text)" }}>Mentor Connect</strong> is fully launching soon. In the meantime, you can browse available mentors and express interest — your TPO will coordinate scheduling.
        </div>
      </div>

      <div style={{ padding: "16px 28px 0", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
        {mentors.map((m, i) => (
          <Card key={m.name} hover>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: COLORS[i % COLORS.length], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                {m.avatar}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{m.name}</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{m.role} @ {m.company}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Batch: {m.batch}</div>
              </div>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
              {m.expertise.map(tag => (
                <span key={tag} style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: "var(--radius-full)", background: "var(--bg-tertiary)", color: "var(--text-secondary)" }}>{tag}</span>
              ))}
            </div>

            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 14 }}>
              🕐 Available: {m.availability}
            </div>

            <button
              style={{ width: "100%", padding: "8px", borderRadius: "var(--radius-md)", background: "var(--accent-primary)", color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
              onClick={() => alert(`Request sent to ${m.name}! Your TPO will coordinate scheduling.`)}
            >
              Request Session
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}
