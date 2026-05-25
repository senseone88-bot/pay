import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import Header from "../components/Header";
import { api } from "../services/api";
import type { PaymentGatewayConfig } from "../types/payment";
import { providerLabel } from "../utils/format";

export default function Settings() {
  const [gateways, setGateways] = useState<PaymentGatewayConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadGateways();
  }, []);

  const loadGateways = async () => {
    try {
      setLoading(true);
      const data = await api.getPaymentGateways();
      setGateways(data);
    } catch {
      setGateways([
        { provider: "ecpay", label: "綠界科技 ECPay", enabled: true },
        { provider: "newebpay", label: "藍新科技 NewebPay", enabled: true },
        { provider: "linepay", label: "LINE Pay", enabled: false },
        { provider: "jkopay", label: "街口支付", enabled: false },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleGateway = async (provider: string) => {
    const gw = gateways.find((g) => g.provider === provider);
    if (!gw) return;

    try {
      setSaving(provider);
      const updated = await api.updatePaymentGateway(provider, {
        enabled: !gw.enabled,
      });
      setGateways((prev) =>
        prev.map((g) => (g.provider === provider ? updated : g))
      );
      setMessage(`已更新 ${providerLabel(provider)} 設定`);
    } catch {
      // local toggle
      setGateways((prev) =>
        prev.map((g) =>
          g.provider === provider ? { ...g, enabled: !g.enabled } : g
        )
      );
      setMessage(`已切換 ${providerLabel(provider)} 狀態`);
    } finally {
      setSaving(null);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  if (loading) {
    return (
      <>
        <Header title="系統設定" />
        <div className="loading">載入中...</div>
      </>
    );
  }

  return (
    <>
      <Header title="系統設定" />
      <div className="page-container">
        {message && (
          <div
            style={{
              padding: "12px 16px",
              background: "#f0fdf4",
              color: "#16a34a",
              borderRadius: "var(--radius)",
              marginBottom: 16,
              fontSize: 14,
            }}
          >
            {message}
          </div>
        )}

        <div className="grid-2">
          <div className="card">
            <div className="card-header">
              <span className="card-title">金流服務設定</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {gateways.map((gw) => (
                <div
                  key={gw.provider}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "16px",
                    background: "var(--gray-50)",
                    borderRadius: "var(--radius)",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
                      {gw.label}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--gray-500)" }}>
                      {gw.enabled ? "已啟用 · " : "已停用 · "}
                      ID: {gw.merchantId || "未設定"}
                    </div>
                  </div>
                  <label
                    style={{
                      position: "relative",
                      display: "inline-block",
                      width: 44,
                      height: 24,
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={gw.enabled}
                      onChange={() => toggleGateway(gw.provider)}
                      disabled={saving === gw.provider}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        inset: 0,
                        backgroundColor: gw.enabled
                          ? "var(--primary)"
                          : "var(--gray-300)",
                        borderRadius: 24,
                        transition: "0.3s",
                      }}
                    >
                      <span
                        style={{
                          position: "absolute",
                          content: '""',
                          height: 20,
                          width: 20,
                          left: gw.enabled ? 22 : 2,
                          top: 2,
                          backgroundColor: "white",
                          borderRadius: "50%",
                          transition: "0.3s",
                        }}
                      />
                    </span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-header">
                <span className="card-title">API 金鑰設定</span>
              </div>
              <p
                style={{
                  fontSize: 14,
                  color: "var(--gray-500)",
                  marginBottom: 16,
                }}
              >
                API 金鑰請在後端環境變數中設定，確保資料安全。
              </p>
              <div style={{ fontSize: 13, color: "var(--gray-400)" }}>
                <code style={{ background: "var(--gray-100)", padding: "2px 6px", borderRadius: 4 }}>
                  .env
                </code>{" "}
                檔案範例：
                <pre
                  style={{
                    background: "var(--gray-900)",
                    color: "#e2e8f0",
                    padding: 16,
                    borderRadius: "var(--radius)",
                    marginTop: 8,
                    fontSize: 12,
                    lineHeight: 1.8,
                  }}
                >
{`ECPAY_MERCHANT_ID=2000132
ECPAY_HASH_KEY=your_hash_key
ECPAY_HASH_IV=your_hash_iv

NEWEBPAY_MERCHANT_ID=your_merchant_id
NEWEBPAY_API_KEY=your_api_key
NEWEBPAY_API_SECRET=your_api_secret

LINE_PAY_CHANNEL_ID=your_channel_id
LINE_PAY_CHANNEL_SECRET=your_channel_secret

JKOPAY_API_KEY=your_api_key
JKOPAY_API_SECRET=your_api_secret`}
                </pre>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <span className="card-title">Webhook 設定</span>
              </div>
              <p style={{ fontSize: 14, color: "var(--gray-500)", marginBottom: 12 }}>
                將以下網址設定到金流服務商後台：
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { label: "ECPay 回傳網址", url: "/api/webhooks/ecpay/return" },
                  { label: "NewebPay 回傳網址", url: "/api/webhooks/newebpay/return" },
                  { label: "LINE Pay Callback", url: "/api/webhooks/linepay/confirm" },
                  { label: "JKOPay Webhook", url: "/api/webhooks/jkopay/notify" },
                ].map((wh) => (
                  <div
                    key={wh.label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 12px",
                      background: "var(--gray-50)",
                      borderRadius: "var(--radius)",
                      fontSize: 13,
                    }}
                  >
                    <span style={{ color: "var(--gray-600)", minWidth: 120 }}>
                      {wh.label}
                    </span>
                    <code
                      style={{
                        color: "var(--primary)",
                        fontSize: 12,
                        wordBreak: "break-all",
                      }}
                    >
                      {wh.url}
                    </code>
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
