import crypto from "crypto";
import { config } from "../config";
import type { Order } from "../models/order";

interface LinePayRequest {
  amount: number;
  currency: string;
  orderId: string;
  packages: {
    id: string;
    name: string;
    amount: number;
    products: { name: string; quantity: number; price: number }[];
  }[];
  redirectUrls: {
    confirmUrl: string;
    cancelUrl: string;
  };
}

export async function requestLinePayPayment(
  order: Order,
  baseUrl: string
): Promise<{ paymentUrl: string; transactionId: string } | null> {
  if (!config.linepay.channelId || !config.linepay.channelSecret) {
    return null;
  }

  const nonce = crypto.randomUUID();
  const uri = "/v3/payments/request";
  const body: LinePayRequest = {
    amount: order.amount,
    currency: "TWD",
    orderId: order.merchantOrderNo,
    packages: [
      {
        id: order.id,
        name: order.itemName,
        amount: order.amount,
        products: [
          {
            name: order.itemName,
            quantity: 1,
            price: order.amount,
          },
        ],
      },
    ],
    redirectUrls: {
      confirmUrl: `${baseUrl}/api/webhooks/linepay/confirm`,
      cancelUrl: `${baseUrl}/orders`,
    },
  };

  const bodyStr = JSON.stringify(body);
  const signature = crypto
    .createHmac("sha256", config.linepay.channelSecret)
    .update(`${config.linepay.channelSecret}${uri}${bodyStr}${nonce}`)
    .digest("base64");

  try {
    const response = await fetch(
      `https://sandbox-api-pay.line.me${uri}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-LINE-ChannelId": config.linepay.channelId,
          "X-LINE-Authorization-Nonce": nonce,
          "X-LINE-Authorization": signature,
        },
        body: bodyStr,
      }
    );

    const result = await response.json();
    if (result.returnCode === "0000") {
      return {
        paymentUrl: result.info.paymentUrl.web,
        transactionId: result.info.transactionId,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function confirmLinePayPayment(
  transactionId: string,
  amount: number
): Promise<boolean> {
  if (!config.linepay.channelId || !config.linepay.channelSecret) {
    return false;
  }

  const nonce = crypto.randomUUID();
  const uri = `/v3/payments/${transactionId}/confirm`;
  const body = { amount, currency: "TWD" };
  const bodyStr = JSON.stringify(body);

  const signature = crypto
    .createHmac("sha256", config.linepay.channelSecret)
    .update(`${config.linepay.channelSecret}${uri}${bodyStr}${nonce}`)
    .digest("base64");

  try {
    const response = await fetch(
      `https://sandbox-api-pay.line.me${uri}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-LINE-ChannelId": config.linepay.channelId,
          "X-LINE-Authorization-Nonce": nonce,
          "X-LINE-Authorization": signature,
        },
        body: bodyStr,
      }
    );

    const result = await response.json();
    return result.returnCode === "0000";
  } catch {
    return false;
  }
}
