"use client";

interface Props {
  approvalStatus: "pending" | "approved" | "rejected";
  collegeName?: string;
  onReapply?: () => Promise<void>;
}

export default function ApprovalBanner({ approvalStatus, collegeName, onReapply }: Props) {
  if (approvalStatus === "approved") return null;

  const isPending  = approvalStatus === "pending";
  const isRejected = approvalStatus === "rejected";

  return (
    <div
      style={{
        margin: "0 0 24px",
        padding: "14px 20px",
        borderRadius: "12px",
        display: "flex",
        alignItems: "center",
        gap: "14px",
        background: isPending
          ? "rgba(245,158,11,.1)"
          : "rgba(239,68,68,.1)",
        border: `1px solid ${isPending ? "rgba(245,158,11,.25)" : "rgba(239,68,68,.25)"}`,
      }}
    >
      {/* Icon */}
      <span style={{ fontSize: "20px", flexShrink: 0 }}>
        {isPending ? "⏳" : "⚠️"}
      </span>

      {/* Text */}
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: "14px",
            fontWeight: 700,
            color: isPending ? "#FCD34D" : "#FCA5A5",
            marginBottom: "3px",
          }}
        >
          {isPending ? "Account Pending Approval" : "Account Application Rejected"}
        </div>
        <div style={{ fontSize: "13px", color: isPending ? "#FDE68A" : "#FCA5A5", opacity: 0.85 }}>
          {isPending
            ? `Your account is pending approval${collegeName ? ` by ${collegeName}` : " by the college admin"}. You can complete your profile but cannot post jobs until approved.`
            : "Your employer account was rejected. Please review your profile, make corrections, and re-submit for approval."}
        </div>
      </div>

      {/* Re-apply button (rejection only) */}
      {isRejected && onReapply && (
        <button
          onClick={onReapply}
          style={{
            flexShrink: 0,
            padding: "8px 18px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            background: "rgba(239,68,68,.2)",
            color: "#FCA5A5",
            fontSize: "13px",
            fontWeight: 600,
            transition: "background .2s",
          }}
          onMouseOver={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,.35)";
          }}
          onMouseOut={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,.2)";
          }}
        >
          Re-apply for Approval
        </button>
      )}
    </div>
  );
}
