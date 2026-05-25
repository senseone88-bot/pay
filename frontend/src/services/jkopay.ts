import type { PaymentResult } from "../types/payment";

interface JKOPayConfig {
  apiKey: string;
  apiSecret: string;
}

function getJKOPayConfig(): JKOPayConfig {
  return {
    apiKey: import.meta.env.VITE_JKOPAY_API_KEY || "",
    apiSecret: import.meta.env.VITE_JKOPAY_API_SECRET || "",
  };
}

function generateSignature(
  body: string,
  apiKey: string,
  apiSecret: string
): string {
  const raw = `JKOPAY${apiKey}${body}${apiSecret}JKOPAY`;
  const encoder = new TextEncoder();
  const data = encoder.encode(raw);
  return crypto.subtle
    ? "signature-placeholder"
    : btoa(String.fromCharCode(...new Uint8Array(data)));
}

export async function openJKOPayApp(params: {
  merchantOrderNo: string;
  amount: number;
  itemName: string;
  paymentUrl?: string;
}): Promise<PaymentResult> {
  const config = getJKOPayConfig();

  if (params.paymentUrl) {
    window.open(params.paymentUrl, "_blank");
    return {
      success: true,
      message: "街口支付視窗已開啟",
      tradeNo: params.merchantOrderNo,
    };
  }

  const baseUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin;
  const body = JSON.stringify({
    merchant_order_id: params.merchantOrderNo,
    amount: params.amount,
    product_name: params.itemName,
    return_url: `${baseUrl}/api/webhooks/jkopay/return`,
  });

  const signature = generateSignature(body, config.apiKey, config.apiSecret);

  try {
    const response = await fetch(
      `https://api-stage.jkopay.com/v1/merchant/orders`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-JKOPAY-Api-Key": config.apiKey,
          "X-JKOPAY-Signature": signature,
        },
        body,
      }
    );

    const result = await response.json();

    if (result.payment_url) {
      window.location.href = result.payment_url;
      return {
        success: true,
        message: "正在前往街口支付...",
        paymentUrl: result.payment_url,
        tradeNo: result.jkopay_order_id,
      };
    }

    return {
      success: false,
      message: result.message || "街口支付請求失敗",
    };
  } catch (err) {
    return {
      success: false,
      message: (err as Error).message || "網路錯誤",
    };
  }
}

export function isJKOPayAvailable(): boolean {
  const config = getJKOPayConfig();
  return !!(config.apiKey && config.apiSecret);
}
