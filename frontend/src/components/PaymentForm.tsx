import { useState } from "react";
import type { PaymentProvider, CreateOrderRequest } from "../types/payment";
import { providerLabel } from "../utils/format";

interface PaymentFormProps {
  onSubmit: (req: CreateOrderRequest) => Promise<void>;
  loading?: boolean;
}

const providers: PaymentProvider[] = ["ecpay", "newebpay", "linepay", "jkopay"];

export default function PaymentForm({ onSubmit, loading }: PaymentFormProps) {
  const [amount, setAmount] = useState("");
  const [itemName, setItemName] = useState("");
  const [description, setDescription] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [provider, setProvider] = useState<PaymentProvider>("ecpay");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !itemName || !buyerName || !buyerEmail) return;

    await onSubmit({
      amount: Math.round(Number(amount)),
      itemName,
      description,
      buyer: {
        name: buyerName,
        email: buyerEmail,
        phone: buyerPhone || undefined,
      },
      paymentProvider: provider,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid-2">
        <div>
          <div className="form-group">
            <label>收款金額 (NTD)</label>
            <input
              type="number"
              className="form-control"
              placeholder="例如: 1000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="1"
            />
          </div>
          <div className="form-group">
            <label>商品名稱</label>
            <input
              type="text"
              className="form-control"
              placeholder="例如: VIP 會員"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>商品描述 (選填)</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="商品描述..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        <div>
          <div className="form-group">
            <label>付款方式</label>
            <select
              className="form-control"
              value={provider}
              onChange={(e) => setProvider(e.target.value as PaymentProvider)}
            >
              {providers.map((p) => (
                <option key={p} value={p}>
                  {providerLabel(p)}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>購買人姓名</label>
            <input
              type="text"
              className="form-control"
              placeholder="王小明"
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>購買人 Email</label>
            <input
              type="email"
              className="form-control"
              placeholder="test@example.com"
              value={buyerEmail}
              onChange={(e) => setBuyerEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>購買人電話 (選填)</label>
            <input
              type="tel"
              className="form-control"
              placeholder="0912345678"
              value={buyerPhone}
              onChange={(e) => setBuyerPhone(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div style={{ marginTop: 16 }}>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
          style={{ width: "100%", justifyContent: "center", padding: "12px" }}
        >
          {loading ? "處理中..." : "產生付款連結"}
        </button>
      </div>
    </form>
  );
}
