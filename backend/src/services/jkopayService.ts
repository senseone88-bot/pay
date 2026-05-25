import crypto from "crypto";
import { config } from "../config";
import type { Order } from "../models/order";

interface JKOPayOrderRequest {
  merchant_order_id: string;
  amount: number;
  currency: string;
  product_name: string;
  unit_price: number;
  quantity: number;
  user_coins: number;
  return_url: string;
  notify_url: string;
  callback_url: string;
  merchant_user_id: string;
  merchant_user_email: string;
}

interface JKOPayOrderResponse {
  payment_url: string;
  jkopay_order_id: string;
  merchant_order_id: string;
  amount: number;
  status: string;
}

interface JKOPayRefundRequest {
  merchant_order_id: string;
  refund_amount: number;
  refund_reason?: string;
}

export function generateJKOPaySignature(
  body: string,
  apiKey: string,
  apiSecret: string
): string {
  const raw = `JKOPAY${apiKey}${body}${apiSecret}JKOPAY`;
  return crypto.createHash("sha256").update(raw).digest("hex");
}

function getJKOPayBaseUrl(): string {
  return config.jkopay.baseUrl;
}

export async function requestJKOPayPayment(
  order: Order,
  baseUrl: string
): Promise<{ paymentUrl: string; jkopayOrderId: string } | null> {
  if (!config.jkopay.apiKey || !config.jkopay.apiSecret) {
    return null;
  }

  const requestBody: JKOPayOrderRequest = {
    merchant_order_id: order.merchantOrderNo,
    amount: order.amount,
    currency: "TWD",
    product_name: order.itemName,
    unit_price: order.amount,
    quantity: 1,
    user_coins: 0,
    return_url: `${baseUrl}/api/webhooks/jkopay/return`,
    notify_url: `${baseUrl}/api/webhooks/jkopay/notify`,
    callback_url: `${baseUrl}/orders`,
    merchant_user_id: order.buyerInfo?.email || `user_${order.id.slice(0, 8)}`,
    merchant_user_email: order.buyerInfo?.email || "",
  };

  const bodyStr = JSON.stringify(requestBody);
  const signature = generateJKOPaySignature(
    bodyStr,
    config.jkopay.apiKey,
    config.jkopay.apiSecret
  );

  try {
    const response = await fetch(
      `${getJKOPayBaseUrl()}/merchant/orders`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-JKOPAY-Api-Key": config.jkopay.apiKey,
          "X-JKOPAY-Signature": signature,
        },
        body: bodyStr,
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[JKOPay] API error: ${response.status} ${errText}`);
      return null;
    }

    const result: JKOPayOrderResponse = await response.json();

    if (result.payment_url) {
      return {
        paymentUrl: result.payment_url,
        jkopayOrderId: result.jkopay_order_id,
      };
    }

    return null;
  } catch (err) {
    console.error("[JKOPay] Request failed:", (err as Error).message);
    return null;
  }
}

export async function refundJKOPayPayment(
  merchantOrderNo: string,
  amount: number,
  reason?: string
): Promise<boolean> {
  if (!config.jkopay.apiKey || !config.jkopay.apiSecret) {
    return false;
  }

  const refundReq: JKOPayRefundRequest = {
    merchant_order_id: merchantOrderNo,
    refund_amount: amount,
    refund_reason: reason || "消費者申請退款",
  };

  const bodyStr = JSON.stringify(refundReq);
  const signature = generateJKOPaySignature(
    bodyStr,
    config.jkopay.apiKey,
    config.jkopay.apiSecret
  );

  try {
    const response = await fetch(
      `${getJKOPayBaseUrl()}/merchant/orders/${merchantOrderNo}/refund`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-JKOPAY-Api-Key": config.jkopay.apiKey,
          "X-JKOPAY-Signature": signature,
        },
        body: bodyStr,
      }
    );

    return response.ok;
  } catch {
    return false;
  }
}

export function verifyJKOPayWebhook(
  body: string,
  signature: string
): boolean {
  if (!config.jkopay.apiKey || !config.jkopay.apiSecret) return false;
  const expected = generateJKOPaySignature(
    body,
    config.jkopay.apiKey,
    config.jkopay.apiSecret
  );
  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(signature)
  );
}

export function parseJKOPayNotification(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any
): {
  success: boolean;
  merchantOrderNo: string;
  jkopayOrderId: string;
  amount: number;
} {
  return {
    success: data?.status === "paid" || data?.status === "completed",
    merchantOrderNo: data?.merchant_order_id || "",
    jkopayOrderId: data?.jkopay_order_id || "",
    amount: Number(data?.amount || 0),
  };
}
