import type { PaymentResult } from "../types/payment";

interface LinePayConfig {
  channelId: string;
  channelSecret: string;
}

function getConfig(): LinePayConfig {
  return {
    channelId: import.meta.env.VITE_LINE_PAY_CHANNEL_ID || "",
    channelSecret: import.meta.env.VITE_LINE_PAY_CHANNEL_SECRET || "",
  };
}

export function openLinePay(paymentUrl: string): void {
  const isMobile =
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  if (isMobile) {
    window.location.href = paymentUrl;
  } else {
    window.open(paymentUrl, "_blank", "width=600,height=700");
  }
}

export async function requestLinePayDirect(params: {
  merchantOrderNo: string;
  amount: number;
  itemName: string;
  buyerEmail: string;
}): Promise<PaymentResult> {
  const config = getConfig();

  if (!config.channelId || !config.channelSecret) {
    return {
      success: false,
      message: "LINE Pay 未設定，請先設定 Channel ID 與 Secret",
    };
  }

  const baseUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin;
  const nonce = crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`;

  const body = {
    amount: params.amount,
    currency: "TWD",
    orderId: params.merchantOrderNo,
    packages: [
      {
        id: params.merchantOrderNo,
        name: params.itemName,
        amount: params.amount,
        products: [
          {
            name: params.itemName,
            quantity: 1,
            price: params.amount,
          },
        ],
      },
    ],
    redirectUrls: {
      confirmUrl: `${baseUrl}/api/webhooks/linepay/confirm`,
      cancelUrl: `${window.location.origin}/orders`,
    },
  };

  const bodyStr = JSON.stringify(body);
  const uri = "/v3/payments/request";
  const encoder = new TextEncoder();
  const keyData = encoder.encode(config.channelSecret);
  const msgData = encoder.encode(
    `${config.channelSecret}${uri}${bodyStr}${nonce}`
  );

  let signature = "";
  try {
    const key = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const sig = await crypto.subtle.sign("HMAC", key, msgData);
    signature = btoa(String.fromCharCode(...new Uint8Array(sig)));
  } catch {
    signature = btoa(
      Array.from(new Uint8Array(msgData))
        .map((b) => String.fromCharCode(b))
        .join("")
    );
  }

  try {
    const response = await fetch(
      `https://sandbox-api-pay.line.me${uri}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-LINE-ChannelId": config.channelId,
          "X-LINE-Authorization-Nonce": nonce,
          "X-LINE-Authorization": signature,
        },
        body: bodyStr,
      }
    );

    const result = await response.json();

    if (result.returnCode === "0000") {
      openLinePay(result.info.paymentUrl.web);
      return {
        success: true,
        message: "LINE Pay 付款視窗已開啟",
        paymentUrl: result.info.paymentUrl.web,
        tradeNo: result.info.transactionId,
      };
    }

    return {
      success: false,
      message: result.returnMessage || "LINE Pay 請求失敗",
    };
  } catch (err) {
    return {
      success: false,
      message: (err as Error).message || "網路錯誤",
    };
  }
}

export function isLinePayAvailable(): boolean {
  const config = getConfig();
  return !!(config.channelId && config.channelSecret);
}
