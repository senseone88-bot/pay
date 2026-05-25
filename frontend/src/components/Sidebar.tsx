import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  CreditCard,
  Settings,
  DollarSign,
} from "lucide-react";

const navItems = [
  { path: "/", label: "儀表板", icon: LayoutDashboard },
  { path: "/orders", label: "訂單管理", icon: ShoppingCart },
  { path: "/payments", label: "收款設定", icon: CreditCard },
  { path: "/settings", label: "系統設定", icon: Settings },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1>TW Pay</h1>
        <p>電子支付管理平台</p>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <button
              key={item.path}
              className={`nav-item${active ? " active" : ""}`}
              onClick={() => navigate(item.path)}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div
        style={{
          padding: "16px 24px",
          borderTop: "1px solid var(--gray-700)",
          fontSize: 12,
          color: "var(--gray-500)",
        }}
      >
        v1.0.0
      </div>
    </aside>
  );
}
