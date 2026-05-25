import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ExternalLink, RotateCcw } from "lucide-react";
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

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [refunding, setRefunding] = useState(false);

  useEffect(() => {
    if (id) loadOrder(id);
  }, [id]);

  const loadOrder = async (orderId: string) => {
    try {
      setLoading(true);
      const data = await api.getOrder(orderId);
      setOrder(data);
    } catch {
      navigate("/orders");
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async () => {
    if (!order || !window.confirm("確定要退款此訂單？")) return;
    try {
      setRefunding(true);
      await api.refundOrder(order.id);
      loadOrder(order.id);
    } catch (err) {
      alert("退款失敗: " + (err as Error).message);
    } finally {
      setRefunding(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header title="訂單詳情" />
        <div className="loading">載入中...</div>
      </>
    );
  }

  if (!order) return null;

  const InfoRow = ({
    label,
    value,
  }: {
    label: string;
    value: string | React.ReactNode;
  }) => (
    <div
      style={{
        display: "flex",
        padding: "12px 0",
        borderBottom: "1px solid var(--gray-100)",
      }}
    >
      <span
        style={{
          width: 140,
          fontSize: 14,
          color: "var(--gray-500)",
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      <span style={{ fontSize: 14, fontWeight: 500 }}>{value}</span>
    </div>
  );

  return (
    <>
      <Header title="訂單詳情" />
      <div className="page-container">
        <div style={{ marginBottom: 20 }}>
          <button
            className="btn btn-secondary"
            onClick={() => navigate("/orders")}
          >
            <ArrowLeft size={16} />
            返回訂單列表
          </button>
        </div>

        <div className="grid-2">
          <div className="card">
            <div className="card-header">
              <span className="card-title">訂單資訊</span>
              <span
                className={`badge ${statusColor(order.paymentStatus)}`}
                style={{ fontSize: 14, padding: "4px 14px" }}
              >
                {statusLabel(order.paymentStatus)}
              </span>
            </div>
            <InfoRow label="訂單編號" value={order.merchantOrderNo} />
            <InfoRow label="商品名稱" value={order.itemName} />
            {order.description && (
              <InfoRow label="商品描述" value={order.description} />
            )}
            <InfoRow
              label="訂單金額"
              value={
                <span style={{ fontSize: 18, color: "var(--primary)" }}>
                  {formatNTD(order.amount)}
                </span>
              }
            />
            <InfoRow label="金流服務" value={providerLabel(order.paymentProvider)} />
            <InfoRow label="訂單狀態" value={statusLabel(order.status)} />
            <InfoRow label="建立時間" value={formatDate(order.createdAt)} />
            {order.paymentDate && (
              <InfoRow label="付款時間" value={formatDate(order.paymentDate)} />
            )}
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">付款資訊</span>
            </div>
            <InfoRow
              label="交易序號"
              value={order.tradeNo || "尚未產生"}
            />
            <InfoRow
              label="付款狀態"
              value={
                <span
                  className={`badge ${statusColor(order.paymentStatus)}`}
                >
                  {statusLabel(order.paymentStatus)}
                </span>
              }
            />

            {order.paymentUrl && (
              <InfoRow
                label="付款連結"
                value={
                  <a
                    href={order.paymentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    前往付款 <ExternalLink size={14} />
                  </a>
                }
              />
            )}

            {order.buyerInfo && (
              <>
                <div
                  style={{
                    marginTop: 16,
                    paddingTop: 16,
                    borderTop: "1px solid var(--gray-200)",
                  }}
                >
                  <span className="card-title">購買人資訊</span>
                </div>
                <InfoRow label="姓名" value={order.buyerInfo.name} />
                <InfoRow label="Email" value={order.buyerInfo.email} />
                {order.buyerInfo.phone && (
                  <InfoRow label="電話" value={order.buyerInfo.phone} />
                )}
              </>
            )}

            <div style={{ marginTop: 20 }}>
              {order.paymentStatus === "paid" && order.status !== "refunded" && (
                <button
                  className="btn btn-primary"
                  onClick={handleRefund}
                  disabled={refunding}
                  style={{
                    background: "var(--danger)",
                    width: "100%",
                    justifyContent: "center",
                  }}
                >
                  <RotateCcw size={16} />
                  {refunding ? "退款處理中..." : "退款此訂單"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
