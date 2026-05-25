import { useEffect, useState } from "react";
import {
  ShoppingCart,
  DollarSign,
  CheckCircle,
  XCircle,
  TrendingUp,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import Header from "../components/Header";
import StatsCard from "../components/StatsCard";
import { api } from "../services/api";
import type { DashboardStats } from "../types/payment";
import {
  formatNTD,
  formatDate,
  statusColor,
  statusLabel,
  providerLabel,
} from "../utils/format";

const COLORS = ["#2563eb", "#16a34a", "#ca8a04", "#dc2626", "#8b5cf6"];

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">載入中...</div>;
  }

  if (error) {
    return (
      <div className="page-container">
        <Header title="儀表板" />
        <div className="loading" style={{ flexDirection: "column", gap: 12 }}>
          <p>無法載入資料: {error}</p>
          <button className="btn btn-primary" onClick={loadStats}>
            重新整理
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <>
      <Header title="儀表板" todayRevenue={stats.todayRevenue} />
      <div className="page-container">
        <div className="stats-grid">
          <StatsCard
            icon={<ShoppingCart size={24} color="#2563eb" />}
            iconBg="#dbeafe"
            iconColor="#2563eb"
            label="總訂單數"
            value={String(stats.totalOrders)}
            change={`待處理: ${stats.pendingOrders}`}
            changeColor="var(--warning)"
          />
          <StatsCard
            icon={<DollarSign size={24} color="#16a34a" />}
            iconBg="#dcfce7"
            iconColor="#16a34a"
            label="總收入"
            value={formatNTD(stats.totalRevenue)}
            change={`本日: ${formatNTD(stats.todayRevenue)}`}
            changeColor="var(--success)"
          />
          <StatsCard
            icon={<CheckCircle size={24} color="#16a34a" />}
            iconBg="#dcfce7"
            iconColor="#16a34a"
            label="成功付款"
            value={String(stats.successfulPayments)}
          />
          <StatsCard
            icon={<XCircle size={24} color="#dc2626" />}
            iconBg="#fef2f2"
            iconColor="#dc2626"
            label="付款失敗"
            value={String(stats.failedPayments)}
          />
        </div>

        <div className="grid-2">
          <div className="card">
            <div className="card-header">
              <span className="card-title">近7日收入</span>
              <TrendingUp size={20} color="var(--primary)" />
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.dailyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v) => v.slice(5)}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip
                  formatter={(value: number) => [formatNTD(value), "收入"]}
                />
                <Bar dataKey="amount" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">各金流收入佔比</span>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={stats.revenueByProvider}
                  dataKey="revenue"
                  nameKey="provider"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ provider, percent }) =>
                    `${providerLabel(provider)} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {stats.revenueByProvider.map((_, idx) => (
                    <Cell
                      key={idx}
                      fill={COLORS[idx % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Legend
                  formatter={(value) => providerLabel(value)}
                />
                <Tooltip
                  formatter={(value: number) => [formatNTD(value), "收入"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card" style={{ marginTop: 24 }}>
          <div className="card-header">
            <span className="card-title">近期訂單</span>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>訂單編號</th>
                  <th>商品</th>
                  <th>金額</th>
                  <th>金流</th>
                  <th>狀態</th>
                  <th>時間</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: 32, color: "var(--gray-400)" }}>
                      暫無訂單
                    </td>
                  </tr>
                ) : (
                  stats.recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td style={{ fontWeight: 600 }}>
                        {order.merchantOrderNo}
                      </td>
                      <td>{order.itemName}</td>
                      <td style={{ fontWeight: 600 }}>
                        {formatNTD(order.amount)}
                      </td>
                      <td>{providerLabel(order.paymentProvider)}</td>
                      <td>
                        <span
                          className={`badge ${statusColor(
                            order.paymentStatus
                          )}`}
                        >
                          {statusLabel(order.paymentStatus)}
                        </span>
                      </td>
                      <td>{formatDate(order.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
