import crypto from "crypto";
import { config } from "../config";
import type { Order } from "../models/order";

interface NewebPayTradeInfo {
  MerchantID: string;
  RespondType: string;
  TimeStamp: string;
  Version: string;
  MerchantOrderNo: string;
  Amt: string;
  ItemDesc: string;
  Email: string;
  ReturnURL: string;
  NotifyURL: string;
  ClientBackURL: string;
}

export function buildNewebPayForm(order: Order, returnUrl: string): {
  action: string;
  merchantId: string;
  tradeInfo: string;
  tradeSha: string;
  version: string;
} {
  const timestamp = String(Math.floor(Date.now() / 1000));

  const tradeInfo: NewebPayTradeInfo = {
    MerchantID: config.newebpay.merchantId,
    RespondType: "JSON",
    TimeStamp: timestamp,
    Version: "2.0",
    MerchantOrderNo: order.merchantOrderNo,
    Amt: String(order.amount),
    ItemDesc: order.itemName,
    Email: order.buyerInfo?.email || "",
    ReturnURL: `${returnUrl}/api/webhooks/newebpay/return`,
    NotifyURL: `${returnUrl}/api/webhooks/newebpay/notify`,
    ClientBackURL: `${returnUrl}/orders`,
  };

  const tradeInfoStr = JSON.stringify(tradeInfo);
  const encryptKey = config.newebpay.apiKey.padEnd(32, "0").slice(0, 32);
  const encryptIV = config.newebpay.apiSecret.padEnd(16, "0").slice(0, 16);

  const cipher = crypto.createCipheriv("aes-256-cbc", encryptKey, encryptIV);
  let encrypted = cipher.update(tradeInfoStr, "utf8", "hex");
  encrypted += cipher.final("hex");

  const shaStr = `HashKey=${encryptKey}&${encrypted}&HashIV=${encryptIV}`;
  const tradeSha = crypto.createHash("sha256").update(shaStr).digest("hex").toUpperCase();

  return {
    action: "https://ccore.newebpay.com/MPG/mpg_gateway",
    merchantId: config.newebpay.merchantId,
    tradeInfo: encrypted,
    tradeSha,
    version: "2.0",
  };
}

export function parseNewebPayReturn(tradeInfo: string, tradeSha: string): {
  success: boolean;
  merchantOrderNo: string;
  tradeNo: string;
  amount: number;
} | null {
  try {
    const encryptKey = config.newebpay.apiKey.padEnd(32, "0").slice(0, 32);
    const encryptIV = config.newebpay.apiSecret.padEnd(16, "0").slice(0, 16);

    const shaStr = `HashKey=${encryptKey}&${tradeInfo}&HashIV=${encryptIV}`;
    const computedSha = crypto.createHash("sha256").update(shaStr).digest("hex").toUpperCase();

    if (computedSha !== tradeSha) return null;

    const decipher = crypto.createDecipheriv("aes-256-cbc", encryptKey, encryptIV);
    let decrypted = decipher.update(tradeInfo, "hex", "utf8");
    decrypted += decipher.final("utf8");

    const result = JSON.parse(decrypted);
    return {
      success: result.Status === "SUCCESS",
      merchantOrderNo: result.Result?.MerchantOrderNo || "",
      tradeNo: result.Result?.TradeNo || "",
      amount: Number(result.Result?.Amt || 0),
    };
  } catch {
    return null;
  }
}
