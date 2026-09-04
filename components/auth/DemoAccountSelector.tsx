"use client";

import { useState } from "react";
import { DEMO_ACCOUNTS, type DemoAccount } from "@/config/navigation";
import { ROLE_LABELS } from "@/types/auth";
import { ChevronDown, ChevronUp, User } from "lucide-react";

interface Props {
  onSelect: (email: string, password: string) => void;
}

export default function DemoAccountSelector({ onSelect }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      style={{
        marginTop: 20,
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--border-primary)",
        overflow: "hidden",
      }}
    >
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          padding: "12px 16px",
          border: "none",
          background: "var(--bg-secondary)",
          cursor: "pointer",
          fontSize: 13,
          fontWeight: 600,
          color: "var(--text-secondary)",
          fontFamily: "var(--font-sans)",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <User size={14} />
          Demo Accounts
        </span>
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {expanded && (
        <div style={{ padding: "8px 12px 12px" }}>
          {DEMO_ACCOUNTS.map((group) => (
            <div key={group.category} style={{ marginBottom: 12 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  padding: "4px 0",
                  marginBottom: 4,
                }}
              >
                {group.category}
              </div>
              {group.accounts.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => onSelect(account.email, account.password)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    padding: "8px 10px",
                    border: "none",
                    borderRadius: "var(--radius-sm)",
                    background: "transparent",
                    cursor: "pointer",
                    fontSize: 13,
                    color: "var(--text-primary)",
                    fontFamily: "var(--font-sans)",
                    transition: "background var(--transition-fast)",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-hover)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                  <span>{account.label}</span>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      padding: "2px 8px",
                      borderRadius: "var(--radius-full)",
                      background: "var(--accent-light)",
                      color: "var(--accent-text)",
                    }}
                  >
                    {ROLE_LABELS[account.role]}
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
