"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, X, Check, Settings2 } from "lucide-react";

const COOKIE_KEY = "placementhub_cookie_consent";

type ConsentState = "accepted_all" | "accepted_necessary" | null;

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Show banner if no consent recorded
    const stored = localStorage.getItem(COOKIE_KEY) as ConsentState;
    if (!stored) {
      // Small delay so it doesn't flash on hydration
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  function accept(type: "all" | "necessary") {
    const value: ConsentState = type === "all" ? "accepted_all" : "accepted_necessary";
    localStorage.setItem(COOKIE_KEY, value);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      style={{
        position: "fixed",
        bottom: 20,
        left: "50%",
        transform: "translateX(-50%)",
        width: "min(680px, calc(100vw - 32px))",
        zIndex: 9999,
        background: "var(--bg-card)",
        border: "1px solid var(--border-primary)",
        borderRadius: "var(--radius-xl)",
        boxShadow: "0 8px 40px rgba(0,0,0,0.25)",
        padding: "20px 24px",
        animation: "slideUp 0.4s cubic-bezier(0.16,1,0.3,1) both",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        {/* Icon */}
        <div style={{ width: 40, height: 40, borderRadius: "var(--radius-lg)", background: "var(--accent-light)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
          <Cookie size={20} style={{ color: "var(--accent-text)" }} />
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
            We use cookies 🍪
          </div>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 12 }}>
            PlacementHub uses <strong>necessary cookies</strong> for authentication and session management. With your consent, we also use <strong>analytics cookies</strong> to improve the platform experience. Your data is never sold.{" "}
            <Link href="/legal/privacy" style={{ color: "var(--accent-text)", textDecoration: "none", fontWeight: 600 }}>
              Privacy Policy
            </Link>{" · "}
            <Link href="/legal/terms" style={{ color: "var(--accent-text)", textDecoration: "none", fontWeight: 600 }}>
              Terms
            </Link>
          </p>

          {showDetails && (
            <div style={{ background: "var(--bg-secondary)", borderRadius: "var(--radius-md)", padding: "12px 14px", marginBottom: 12, fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.7 }}>
              <div style={{ marginBottom: 6 }}>
                <strong style={{ color: "var(--success)" }}>✓ Necessary cookies</strong> — Always active. Required for login sessions and theme preferences. Cannot be disabled.
              </div>
              <div>
                <strong style={{ color: "var(--text-primary)" }}>◯ Analytics cookies</strong> — Anonymous usage data to help us understand how the platform is used. Enabled only with "Accept All".
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <button
              onClick={() => accept("all")}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 18px", borderRadius: "var(--radius-md)", background: "var(--accent-primary)", color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
            >
              <Check size={14} /> Accept All
            </button>
            <button
              onClick={() => accept("necessary")}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 18px", borderRadius: "var(--radius-md)", background: "var(--bg-secondary)", color: "var(--text-secondary)", border: "1px solid var(--border-primary)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
            >
              Accept Necessary Only
            </button>
            <button
              onClick={() => setShowDetails(d => !d)}
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 12px", borderRadius: "var(--radius-md)", background: "transparent", color: "var(--text-muted)", border: "1px solid var(--border-secondary)", fontSize: 12, cursor: "pointer" }}
            >
              <Settings2 size={13} /> {showDetails ? "Hide" : "Details"}
            </button>
          </div>
        </div>

        <button
          onClick={() => accept("necessary")}
          aria-label="Dismiss and accept necessary cookies"
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4, flexShrink: 0 }}
        >
          <X size={18} />
        </button>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
}
