"use client";

import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import { CheckCircle, Rocket, User, FileText, Briefcase, Bell } from "lucide-react";
import Link from "next/link";

const steps = [
  {
    icon: User,
    title: "Complete Your Profile",
    description: "Fill in your personal info, branch, CGPA and contact details so employers can find you.",
    href: "/student/profile",
    cta: "Go to Profile",
    done: false,
  },
  {
    icon: FileText,
    title: "Upload Your Resume",
    description: "Upload a PDF resume. This is the first thing employers will see.",
    href: "/student/documents",
    cta: "Upload Resume",
    done: false,
  },
  {
    icon: Briefcase,
    title: "Browse Placement Drives",
    description: "Explore drives posted by companies visiting your campus and apply to ones you qualify for.",
    href: "/student/drives",
    cta: "Browse Drives",
    done: false,
  },
  {
    icon: Bell,
    title: "Enable Notifications",
    description: "Stay updated on application status changes, new drives, and important deadlines.",
    href: "/student/notifications",
    cta: "View Notifications",
    done: false,
  },
];

export default function GettingStartedPage() {
  return (
    <div style={{ padding: "0 0 40px" }}>
      <PageHeader
        title="Getting Started 🚀"
        description="Welcome to PlacementHub! Follow these steps to set up your profile and start applying."
      />

      <div style={{ padding: "24px 28px 0" }}>
        {/* Hero banner */}
        <div style={{ borderRadius: "var(--radius-xl)", background: "linear-gradient(135deg, var(--accent-primary), #8B5CF6)", padding: "28px 32px", marginBottom: 24, color: "#fff" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Rocket size={32} />
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Your placement journey starts here</div>
              <p style={{ fontSize: 14, opacity: 0.85 }}>Complete the steps below to maximize your chances of getting placed.</p>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <Card key={i} hover>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: "var(--radius-lg)", background: step.done ? "var(--success-light)" : "var(--accent-light)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {step.done ? <CheckCircle size={22} style={{ color: "var(--success)" }} /> : <Icon size={22} style={{ color: "var(--accent-text)" }} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", minWidth: 20 }}>0{i + 1}</span>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>{step.title}</div>
                    </div>
                    <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 12 }}>{step.description}</p>
                    <Link
                      href={step.href}
                      style={{ display: "inline-block", padding: "7px 16px", borderRadius: "var(--radius-md)", background: "var(--accent-primary)", color: "#fff", fontSize: 13, fontWeight: 600, textDecoration: "none", transition: "opacity var(--transition-fast)" }}
                    >
                      {step.cta} →
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
