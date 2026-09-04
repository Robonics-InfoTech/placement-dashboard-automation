import type { ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface Props {
  children: ReactNode;
  variant?: Variant;
  size?: "sm" | "md";
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
  href?: string;
  style?: React.CSSProperties;
  id?: string;
}

const VARIANTS: Record<Variant, React.CSSProperties> = {
  primary: {
    background: "var(--accent-primary)",
    color: "white",
    border: "1px solid var(--accent-primary)",
  },
  secondary: {
    background: "var(--bg-primary)",
    color: "var(--text-primary)",
    border: "1px solid var(--border-primary)",
  },
  ghost: {
    background: "transparent",
    color: "var(--text-secondary)",
    border: "1px solid transparent",
  },
  danger: {
    background: "var(--error)",
    color: "white",
    border: "1px solid var(--error)",
  },
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  disabled,
  onClick,
  type = "button",
  href,
  style,
  id,
}: Props) {
  const baseStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: size === "sm" ? "6px 12px" : "9px 18px",
    borderRadius: "var(--radius-md)",
    fontSize: size === "sm" ? 12 : 13,
    fontWeight: 600,
    fontFamily: "var(--font-sans)",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    textDecoration: "none",
    transition: "all var(--transition-fast)",
    ...VARIANTS[variant],
    ...style,
  };

  if (href && !disabled) {
    return (
      <a href={href} style={baseStyle} id={id}>
        {children}
      </a>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} style={baseStyle} className="focus-ring" id={id}>
      {children}
    </button>
  );
}
