import { useState } from "react";
import { ExternalLink } from "lucide-react";
import Header from "../components/Header";
import PaymentForm from "../components/PaymentForm";
import { api } from "../services/api";
import type { CreateOrderRequest, PaymentResult } from "../types/payment";

export default function Payments() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PaymentResult | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (req: CreateOrderRequest) => {
    try {
      setLoading(true);
      setError("");
      setResult(null);
      const res = await api.createOrder(req);
      setResult(res);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header title="收款設定" />
      <div className="page-container">
        <div className="grid-2">
          <div className="card">
            <div className="card-header">
              <span className="card-title">建立收款</span>
            </div>
            <PaymentForm onSubmit={handleSubmit} loading={loading} />

            {error && (
              <div
                style={{
                  marginTop: 16,
                  padding: 12,
                  background: "#fef2f2",
                  color: "#dc2626",
                  borderRadius: "var(--radius)",
                  fontSize: 14,
                }}
              >
                {error}
              </div>
            )}
          </div>

          <div>
            {result && (
              <div className="card" style={{ marginBottom: 16 }}>
                <div className="card-header">
                  <span className="card-title" style={{ color: "var(--success)" }}>
                    付款連結已產生
                  </span>
                </div>
                <div
                  style={{
                    padding: 16,
                    background: "#f0fdf4",
                    borderRadius: "var(--radius)",
                    marginBottom: 16,
                  }}
                >
                  <div style={{ fontSize: 13, color: "var(--gray-500)", marginBottom: 8 }}>
                    付款連結
                  </div>
                  <a
                    href={result.paymentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      wordBreak: "break-all",
                      fontSize: 14,
                    }}
                  >
                    {result.paymentUrl}
                    <ExternalLink size={14} />
                  </a>
                </div>
                {result.tradeNo && (
                  <div style={{ fontSize: 13, color: "var(--gray-500)" }}>
                    交易序號: {result.tradeNo}
                  </div>
                )}
              </div>
            )}

            <div className="card">
              <div className="card-header">
                <span className="card-title">支援的金流服務</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  {
                    name: "綠界科技 ECPay",
                    desc: "信用卡、ATM、超商代碼",
                    status: "已啟用",
                  },
                  {
                    name: "藍新科技 NewebPay",
                    desc: "信用卡、ATM、超商條碼",
                    status: "已啟用",
                  },
                  {
                    name: "LINE Pay",
                    desc: "LINE Pay 行動支付 / 點數折抵",
                    status: "已啟用",
                  },
                  {
                    name: "街口支付 JKOPay",
                    desc: "街口支付 App / 條碼付款",
                    status: "已啟用",
                  },
                ].map((g) => (
                  <div
                    key={g.name}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "12px 16px",
                      background: "var(--gray-50)",
                      borderRadius: "var(--radius)",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: 14,
                          marginBottom: 2,
                        }}
                      >
                        {g.name}
                      </div>
                      <div
                        style={{ fontSize: 12, color: "var(--gray-500)" }}
                      >
                        {g.desc}
                      </div>
                    </div>
                    <span
                      className={`badge ${
                        g.status === "已啟用"
                          ? "text-green-600 bg-green-50"
                          : "text-yellow-600 bg-yellow-50"
                      }`}
                    >
                      {g.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
