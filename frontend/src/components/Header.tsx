import { DollarSign } from "lucide-react";
import { formatNTD } from "../utils/format";

interface HeaderProps {
  title: string;
  todayRevenue?: number;
}

export default function Header({ title, todayRevenue }: HeaderProps) {
  return (
    <header className="top-header">
      <div className="header-left">
        <h2>{title}</h2>
      </div>
      <div className="header-right">
        {todayRevenue !== undefined && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 14,
              color: "var(--gray-600)",
            }}
          >
            <DollarSign size={16} color="var(--success)" />
            <span>
              本日收入: <strong>{formatNTD(todayRevenue)}</strong>
            </span>
          </div>
        )}
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "var(--gray-200)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            fontWeight: 600,
            color: "var(--gray-600)",
          }}
        >
          A
        </div>
      </div>
    </header>
  );
}
