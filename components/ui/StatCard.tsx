import Card from "./Card";

interface Props {
  label: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  color?: string;
}

export default function StatCard({ label, value, trend, trendUp = true, color }: Props) {
  return (
    <Card hover>
      {color && (
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: color,
            marginBottom: 10,
          }}
        />
      )}
      <div
        style={{
          fontSize: 26,
          fontWeight: 800,
          color: "var(--text-primary)",
          lineHeight: 1.2,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 12,
          color: "var(--text-muted)",
          fontWeight: 500,
          marginTop: 4,
        }}
      >
        {label}
      </div>
      {trend && (
        <div
          style={{
            marginTop: 8,
            fontSize: 11,
            fontWeight: 600,
            color: trendUp ? "var(--success)" : "var(--error)",
          }}
        >
          {trend}
        </div>
      )}
    </Card>
  );
}
