import { Request, Response } from "express";
import { orderModel } from "../models/order";

export function showJKOPayCheckout(req: Request, res: Response) {
  const orderId = req.params.orderId;
  const order = orderModel.findById(orderId);

  if (!order) {
    return res.status(404).send("訂單不存在");
  }

  const html = `<!DOCTYPE html>
<html lang="zh-Hant">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>街口支付 - 結帳頁面</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Noto Sans TC", "Microsoft JhengHei", sans-serif;
      background: #f5f5f5;
      display: flex; justify-content: center; align-items: center;
      min-height: 100vh; padding: 20px;
    }
    .container {
      background: white; border-radius: 16px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.1);
      padding: 40px; max-width: 420px; width: 100%;
      text-align: center;
    }
    .logo {
      width: 80px; height: 80px; border-radius: 20px;
      background: linear-gradient(135deg, #861f41, #c41230);
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 20px; font-size: 28px; color: white; font-weight: bold;
    }
    h1 { font-size: 20px; margin-bottom: 8px; }
    .amount {
      font-size: 36px; font-weight: 700; color: #c41230;
      margin: 20px 0;
    }
    .info { color: #666; font-size: 14px; margin-bottom: 24px; }
    .info-item { padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
    .btn {
      display: block; width: 100%; padding: 14px;
      border: none; border-radius: 12px;
      font-size: 16px; font-weight: 600; cursor: pointer;
      transition: all 0.2s;
    }
    .btn-primary {
      background: #c41230; color: white; margin-top: 16px;
    }
    .btn-primary:hover { background: #a00e26; }
    .btn-secondary {
      background: #f5f5f5; color: #333; margin-top: 8px;
    }
    .btn-secondary:hover { background: #e8e8e8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">JK</div>
    <h1>街口支付</h1>
    <div class="amount">NT$ ${order.amount.toLocaleString()}</div>
    <div class="info">
      <div class="info-item"><strong>訂單編號：</strong>${order.merchantOrderNo}</div>
      <div class="info-item"><strong>商品名稱：</strong>${order.itemName}</div>
    </div>
    <button class="btn btn-primary" onclick="payWithJKOPay()">
      使用街口支付
    </button>
    <button class="btn btn-secondary" onclick="window.close()">
      返回商家
    </button>
  </div>
  <script>
    function payWithJKOPay() {
      var paymentUrl = ${JSON.stringify(order.paymentUrl || "")};
      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        alert("付款連結尚未產生，請重新建立訂單");
      }
    }
  </script>
</body>
</html>`;

  res.send(html);
}

export function handleJKOPayReturn(req: Request, res: Response) {
  const { merchant_order_id, jkopay_order_id, status } = req.query as Record<
    string,
    string
  >;

  if (status === "paid" || status === "completed") {
    const order = orderModel.findByMerchantOrderNo(merchant_order_id);
    if (order) {
      orderModel.update(order.id, {
        paymentStatus: "paid",
        status: "completed",
        tradeNo: jkopay_order_id,
        paymentDate: new Date().toISOString(),
      });
    }
  }

  const isSuccess = status === "paid" || status === "completed";
  res.redirect(`/?order=${merchant_order_id}&status=${isSuccess ? "success" : "failed"}`);
}
