import type { ReactNode } from "react";

interface StatsCardProps {
  icon: ReactNode;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
  change?: string;
  changeColor?: string;
}

export default function StatsCard({
  icon,
  iconBg,
  label,
  value,
  change,
  changeColor,
}: StatsCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: iconBg }}>
        {icon}
      </div>
      <div className="stat-info">
        <h3>{label}</h3>
        <div className="value">{value}</div>
        {change && (
          <div className="change" style={{ color: changeColor }}>
            {change}
          </div>
        )}
      </div>
    </div>
  );
}
