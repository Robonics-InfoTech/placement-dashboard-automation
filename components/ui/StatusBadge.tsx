import type { ReactNode } from "react";

type KnownStatus = "success" | "warning" | "error" | "pending" | "info" | "neutral";

interface Props {
  /** A known semantic status or any raw status string (auto-mapped). */
  status: string;
  /** Text label. Falls back to children if not provided. */
  label?: string;
  /** Optional children rendered instead of label. */
  children?: ReactNode;
  size?: "sm" | "md";
}

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  success: { bg: "var(--success-light)", color: "var(--success-text)" },
  warning: { bg: "var(--warning-light)", color: "var(--warning-text)" },
  error: { bg: "var(--error-light)", color: "var(--error-text)" },
  pending: { bg: "var(--pending-light)", color: "var(--pending-text)" },
  info: { bg: "var(--info-light)", color: "var(--info-text)" },
  neutral: { bg: "var(--bg-tertiary)", color: "var(--text-secondary)" },
};

/** Map raw status strings to a known semantic status + display label */
const STATUS_MAP: Record<string, { semantic: KnownStatus; label: string }> = {
  active: { semantic: "success", label: "Active" },
  published: { semantic: "success", label: "Published" },
  approved: { semantic: "success", label: "Approved" },
  placed: { semantic: "success", label: "Placed" },
  accepted: { semantic: "success", label: "Accepted" },
  completed: { semantic: "success", label: "Completed" },
  selected: { semantic: "success", label: "Selected" },
  pending: { semantic: "pending", label: "Pending" },
  pending_approval: { semantic: "pending", label: "Pending Approval" },
  applied: { semantic: "info", label: "Applied" },
  shortlisted: { semantic: "info", label: "Shortlisted" },
  offer_extended: { semantic: "warning", label: "Offer Extended" },
  scheduled: { semantic: "warning", label: "Scheduled" },
  in_progress: { semantic: "warning", label: "In Progress" },
  rejected: { semantic: "error", label: "Rejected" },
  closed: { semantic: "neutral", label: "Closed" },
  withdrawn: { semantic: "neutral", label: "Withdrawn" },
  cancelled: { semantic: "error", label: "Cancelled" },
  declined: { semantic: "error", label: "Declined" },
  draft: { semantic: "neutral", label: "Draft" },
};

function resolveStatus(raw: string): { semantic: KnownStatus; label: string } {
  // If it's already a known semantic status, use directly
  if (STATUS_STYLES[raw]) return { semantic: raw as KnownStatus, label: raw };
  // Check the map
  return STATUS_MAP[raw] ?? { semantic: "neutral", label: raw };
}

export default function StatusBadge({ status, label, children, size = "md" }: Props) {
  const resolved = resolveStatus(status);
  const style = STATUS_STYLES[resolved.semantic] ?? STATUS_STYLES.neutral;
  const displayContent = children ?? label ?? resolved.label;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: size === "sm" ? "2px 8px" : "3px 10px",
        borderRadius: "var(--radius-full)",
        fontSize: size === "sm" ? 10 : 11,
        fontWeight: 600,
        background: style.bg,
        color: style.color,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: style.color,
          opacity: 0.7,
        }}
      />
      {displayContent}
    </span>
  );
}

/** Helper to map common application/job statuses to badge props */
export function getStatusBadgeProps(status: string): { status: KnownStatus; label: string } {
  const resolved = resolveStatus(status);
  return { status: resolved.semantic, label: resolved.label };
}
