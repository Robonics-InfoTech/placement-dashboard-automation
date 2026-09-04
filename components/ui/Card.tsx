import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  padding?: boolean;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
  style?: React.CSSProperties;
}

export default function Card({ children, padding = true, onClick, hover = false, style }: Props) {
  return (
    <div
      onClick={onClick}
      className={hover ? "card-hover" : ""}
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-primary)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-xs)",
        padding: padding ? 20 : 0,
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
