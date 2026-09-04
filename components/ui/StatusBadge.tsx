interface Props {
  status: "success" | "warning" | "error" | "pending" | "info" | "neutral";
  label: string;
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

export default function StatusBadge({ status, label, size = "md" }: Props) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.neutral;

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
      {label}
    </span>
  );
}

/** Helper to map common application/job statuses to badge props */
export function getStatusBadgeProps(status: string): { status: Props["status"]; label: string } {
  const map: Record<string, { status: Props["status"]; label: string }> = {
    active: { status: "success", label: "Active" },
    published: { status: "success", label: "Published" },
    approved: { status: "success", label: "Approved" },
    placed: { status: "success", label: "Placed" },
    accepted: { status: "success", label: "Accepted" },
    completed: { status: "success", label: "Completed" },
    pending: { status: "pending", label: "Pending" },
    pending_approval: { status: "pending", label: "Pending Approval" },
    applied: { status: "info", label: "Applied" },
    shortlisted: { status: "info", label: "Shortlisted" },
    offer_extended: { status: "warning", label: "Offer Extended" },
    scheduled: { status: "warning", label: "Scheduled" },
    in_progress: { status: "warning", label: "In Progress" },
    rejected: { status: "error", label: "Rejected" },
    closed: { status: "neutral", label: "Closed" },
    withdrawn: { status: "neutral", label: "Withdrawn" },
    cancelled: { status: "error", label: "Cancelled" },
    declined: { status: "error", label: "Declined" },
    draft: { status: "neutral", label: "Draft" },
  };
  return map[status] ?? { status: "neutral", label: status };
}
