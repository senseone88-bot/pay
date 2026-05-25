import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, RefreshCw, Search } from "lucide-react";
import Header from "../components/Header";
import { api } from "../services/api";
import type { Order } from "../types/payment";
import {
  formatNTD,
  formatDate,
  statusColor,
  statusLabel,
  providerLabel,
} from "../utils/format";

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const limit = 20;

  useEffect(() => {
    loadOrders();
  }, [page]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const result = await api.getOrders({ page, limit });
      setOrders(result.orders);
      setTotal(result.total);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = search
    ? orders.filter(
        (o) =>
          o.merchantOrderNo.includes(search) ||
          o.itemName.includes(search) ||
          o.tradeNo?.includes(search)
      )
    : orders;

  const totalPages = Math.ceil(total / limit);

  return (
    <>
      <Header title="訂單管理" />
      <div className="page-container">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ position: "relative" }}>
              <Search
                size={16}
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--gray-400)",
                }}
              />
              <input
                type="text"
                className="form-control"
                placeholder="搜尋訂單..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: 36, width: 260 }}
              />
            </div>
            <button className="btn btn-secondary" onClick={loadOrders}>
              <RefreshCw size={16} />
              重新整理
            </button>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/payments")}
          >
            <Plus size={16} />
            新增收款
          </button>
        </div>

        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>訂單編號</th>
                  <th>交易序號</th>
                  <th>商品</th>
                  <th>金額</th>
                  <th>金流</th>
                  <th>付款狀態</th>
                  <th>訂單狀態</th>
                  <th>建立時間</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="loading">
                      載入中...
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      style={{
                        textAlign: "center",
                        padding: 48,
                        color: "var(--gray-400)",
                      }}
                    >
                      暫無訂單紀錄
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      style={{ cursor: "pointer" }}
                      onClick={() => navigate(`/orders/${order.id}`)}
                    >
                      <td style={{ fontWeight: 600 }}>
                        {order.merchantOrderNo}
                      </td>
                      <td style={{ color: "var(--gray-500)", fontSize: 13 }}>
                        {order.tradeNo || "-"}
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
                      <td>
                        <span
                          className={`badge ${statusColor(order.status)}`}
                        >
                          {statusLabel(order.status)}
                        </span>
                      </td>
                      <td style={{ fontSize: 13, color: "var(--gray-500)" }}>
                        {formatDate(order.createdAt)}
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/orders/${order.id}`);
                          }}
                        >
                          查看
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 8,
                padding: "16px 0 0",
              }}
            >
              <button
                className="btn btn-sm btn-secondary"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                上一頁
              </button>
              <span
                style={{
                  padding: "4px 12px",
                  fontSize: 14,
                  color: "var(--gray-600)",
                }}
              >
                {page} / {totalPages}
              </span>
              <button
                className="btn btn-sm btn-secondary"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                下一頁
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
