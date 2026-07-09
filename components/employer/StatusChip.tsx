import React from "react";

type StatusVariant =
  | "pending_approval" | "active" | "closed" | "rejected"
  | "scheduled" | "in_progress" | "completed" | "cancelled"
  | "applied" | "shortlisted" | "offer_extended" | "withdrawn"
  | "round_1" | "round_2" | "round_3" | "round_4"
  | "pending" | "accepted" | "declined"
  | "approved";

const CONFIG: Record<StatusVariant, { label: string; bg: string; color: string }> = {
  // Job statuses
  pending_approval: { label: "Pending Approval", bg: "rgba(245,158,11,.15)",  color: "#FCD34D" },
  active:           { label: "Active",           bg: "rgba(16,185,129,.15)",  color: "#34D399" },
  closed:           { label: "Closed",           bg: "rgba(100,116,139,.15)", color: "#94A3B8" },
  rejected:         { label: "Rejected",         bg: "rgba(239,68,68,.15)",   color: "#FCA5A5" },
  // Drive statuses
  scheduled:        { label: "Scheduled",        bg: "rgba(14,165,233,.15)",  color: "#38BDF8" },
  in_progress:      { label: "In Progress",      bg: "rgba(99,102,241,.15)",  color: "#818CF8" },
  completed:        { label: "Completed",        bg: "rgba(16,185,129,.15)",  color: "#34D399" },
  cancelled:        { label: "Cancelled",        bg: "rgba(100,116,139,.15)", color: "#94A3B8" },
  // Application statuses
  applied:          { label: "Applied",          bg: "rgba(100,116,139,.15)", color: "#94A3B8" },
  shortlisted:      { label: "Shortlisted",      bg: "rgba(14,165,233,.15)",  color: "#38BDF8" },
  offer_extended:   { label: "Offer Extended",   bg: "rgba(16,185,129,.15)",  color: "#34D399" },
  withdrawn:        { label: "Withdrawn",        bg: "rgba(100,116,139,.15)", color: "#64748B" },
  round_1:          { label: "Round 1",          bg: "rgba(139,92,246,.15)",  color: "#A78BFA" },
  round_2:          { label: "Round 2",          bg: "rgba(139,92,246,.15)",  color: "#A78BFA" },
  round_3:          { label: "Round 3",          bg: "rgba(139,92,246,.15)",  color: "#A78BFA" },
  round_4:          { label: "Round 4",          bg: "rgba(139,92,246,.15)",  color: "#A78BFA" },
  // Offer statuses
  pending:          { label: "Pending",          bg: "rgba(245,158,11,.15)",  color: "#FCD34D" },
  accepted:         { label: "Accepted",         bg: "rgba(16,185,129,.15)",  color: "#34D399" },
  declined:         { label: "Declined",         bg: "rgba(239,68,68,.15)",   color: "#FCA5A5" },
  // Approval
  approved:         { label: "Approved",         bg: "rgba(16,185,129,.15)",  color: "#34D399" },
};

interface Props {
  status: string;
  size?: "sm" | "md";
}

export default function StatusChip({ status, size = "md" }: Props) {
  const cfg = CONFIG[status as StatusVariant] ?? {
    label: status,
    bg: "rgba(100,116,139,.15)",
    color: "#94A3B8",
  };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        background: cfg.bg,
        color: cfg.color,
        borderRadius: "20px",
        fontWeight: 600,
        fontSize: size === "sm" ? "11px" : "12px",
        padding: size === "sm" ? "3px 9px" : "4px 12px",
        whiteSpace: "nowrap",
      }}
    >
      {cfg.label}
    </span>
  );
}
