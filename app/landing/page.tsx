"use client";

import Link from "next/link";
import ThemeToggle from "@/components/layout/ThemeToggle";
import {
  GraduationCap,
  Building2,
  School,
  Users,
  Target,
  BarChart3,
  Calendar,
  Shield,
  ArrowRight,
  Zap,
  Globe,
  Star,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh" }}>
      {/* ── Navigation ── */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 40px",
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "var(--radius-md)",
              background: "var(--accent-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 14,
              fontWeight: 800,
            }}
          >
            P
          </div>
          <span style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>PlacementHub</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <ThemeToggle />
          <Link
            href="/auth/login"
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: "var(--text-secondary)",
              textDecoration: "none",
            }}
          >
            Sign In
          </Link>
          <Link
            href="/auth/signup"
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "white",
              background: "var(--accent-primary)",
              padding: "8px 20px",
              borderRadius: "var(--radius-md)",
              textDecoration: "none",
              transition: "opacity var(--transition-fast)",
            }}
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "80px 40px 60px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 16px",
            borderRadius: "var(--radius-full)",
            background: "var(--accent-light)",
            color: "var(--accent-text)",
            fontSize: 13,
            fontWeight: 600,
            marginBottom: 24,
          }}
        >
          <Zap size={14} />
          Unified Placement Management Platform
        </div>

        <h1
          style={{
            fontSize: "clamp(32px, 5vw, 56px)",
            fontWeight: 800,
            color: "var(--text-primary)",
            lineHeight: 1.15,
            margin: "0 auto",
            maxWidth: 800,
          }}
        >
          Beyond Placements.{" "}
          <span style={{ color: "var(--accent-primary)" }}>Building Industry-Ready Talent.</span>
        </h1>

        <p
          style={{
            fontSize: 18,
            color: "var(--text-secondary)",
            lineHeight: 1.6,
            maxWidth: 600,
            margin: "20px auto 36px",
          }}
        >
          Connect students, alumni, employers, and institutions in a single platform.
          Streamline recruitment, track placements, and build stronger campus-industry partnerships.
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
          <Link
            href="/auth/signup"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 28px",
              borderRadius: "var(--radius-md)",
              background: "var(--accent-primary)",
              color: "white",
              fontSize: 15,
              fontWeight: 600,
              textDecoration: "none",
              transition: "opacity var(--transition-fast)",
            }}
          >
            Start Free <ArrowRight size={16} />
          </Link>
          <Link
            href="/auth/login"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 28px",
              borderRadius: "var(--radius-md)",
              background: "var(--bg-primary)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-primary)",
              fontSize: 15,
              fontWeight: 600,
              textDecoration: "none",
              transition: "all var(--transition-fast)",
            }}
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* ── Ecosystem ── */}
      <section
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "40px 40px 60px",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            fontSize: 28,
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: 12,
          }}
        >
          One Platform, Every Stakeholder
        </h2>
        <p
          style={{
            textAlign: "center",
            fontSize: 15,
            color: "var(--text-secondary)",
            marginBottom: 40,
            maxWidth: 500,
            margin: "0 auto 40px",
          }}
        >
          Role-based dashboards tailored for each participant in the placement ecosystem.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 16,
          }}
        >
          {[
            {
              icon: <GraduationCap size={24} />,
              title: "Students",
              desc: "Browse drives, track applications, manage offers, and build your career profile.",
              color: "#4f46e5",
            },
            {
              icon: <Users size={24} />,
              title: "Alumni",
              desc: "Access alumni-exclusive job boards, mentorship programs, and networking events.",
              color: "#7c3aed",
            },
            {
              icon: <Building2 size={24} />,
              title: "Employers",
              desc: "Post jobs, schedule drives, manage candidates, and extend offers — all in one place.",
              color: "#0ea5e9",
            },
            {
              icon: <School size={24} />,
              title: "Institutions",
              desc: "Oversee placement operations, approve employers, and generate detailed reports.",
              color: "#059669",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="card-hover"
              style={{
                padding: 24,
                background: "var(--bg-card)",
                border: "1px solid var(--border-primary)",
                borderRadius: "var(--radius-xl)",
                boxShadow: "var(--shadow-xs)",
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "var(--radius-lg)",
                  background: `${item.color}15`,
                  color: item.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                {item.icon}
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>
                {item.title}
              </h3>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "40px 40px 60px",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            fontSize: 28,
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: 40,
          }}
        >
          Platform Highlights
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 14,
          }}
        >
          {[
            { icon: <Target size={20} />, title: "Drive Management", desc: "End-to-end placement drive lifecycle" },
            { icon: <BarChart3 size={20} />, title: "Live Analytics", desc: "Real-time placement statistics & reports" },
            { icon: <Calendar size={20} />, title: "Smart Scheduling", desc: "Interview slots with conflict detection" },
            { icon: <Shield size={20} />, title: "Role-Based Access", desc: "6 distinct roles with granular permissions" },
            { icon: <Globe size={20} />, title: "Multi-Tenant", desc: "One instance for multiple institutions" },
            { icon: <Star size={20} />, title: "Career Services", desc: "Resume review, mentorship & mock interviews" },
          ].map((item) => (
            <div
              key={item.title}
              style={{
                padding: 20,
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-secondary)",
                borderRadius: "var(--radius-lg)",
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
              }}
            >
              <div style={{ color: "var(--accent-text)", flexShrink: 0, marginTop: 2 }}>{item.icon}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 2 }}>
                  {item.title}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section
        style={{
          maxWidth: 700,
          margin: "0 auto",
          padding: "40px 40px 80px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            padding: 48,
            background: "var(--accent-primary)",
            borderRadius: "var(--radius-xl)",
            color: "white",
          }}
        >
          <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 12 }}>
            Ready to transform your placement process?
          </h2>
          <p style={{ fontSize: 15, opacity: 0.9, marginBottom: 24, lineHeight: 1.6 }}>
            Join institutions already using PlacementHub to connect talent with opportunity.
          </p>
          <Link
            href="/auth/signup"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 32px",
              borderRadius: "var(--radius-md)",
              background: "white",
              color: "var(--accent-primary)",
              fontSize: 15,
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Get Started Free <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        style={{
          borderTop: "1px solid var(--border-primary)",
          padding: "24px 40px",
          textAlign: "center",
          fontSize: 13,
          color: "var(--text-muted)",
        }}
      >
        © {new Date().getFullYear()} PlacementHub — Built with ❤️ by Robonics InfoTech
      </footer>
    </div>
  );
}
