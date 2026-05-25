import { config } from "../config";
import { generateECPayCheckMac } from "../utils/crypto";
import type { Order } from "../models/order";

export interface ECPayPaymentRequest {
  order: Order;
  returnUrl: string;
  clientBackUrl: string;
  orderResultUrl: string;
}

export function buildECPayFormParams(req: ECPayPaymentRequest): {
  action: string;
  params: Record<string, string>;
} {
  const now = new Date();
  const dateStr = now
    .toISOString()
    .replace(/[T.-]/g, "")
    .slice(0, 14);

  const params: Record<string, string> = {
    MerchantID: config.ecpay.merchantId,
    MerchantTradeNo: req.order.merchantOrderNo,
    MerchantTradeDate: dateStr,
    PaymentType: "aio",
    TotalAmount: String(req.order.amount),
    TradeDesc: "線上付款",
    ItemName: req.order.itemName,
    ReturnURL: req.returnUrl,
    ClientBackURL: req.clientBackUrl,
    OrderResultURL: req.orderResultUrl,
    ChoosePayment: "ALL",
    EncryptType: "1",
    NeedExtraPaidInfo: "N",
  };

  const checkMac = generateECPayCheckMac(params, config.ecpay.hashKey, config.ecpay.hashIV);
  params["CheckMacValue"] = checkMac;

  return {
    action: config.ecpay.paymentUrl,
    params,
  };
}

export function parseECPayReturn(params: Record<string, string>): {
  success: boolean;
  merchantOrderNo: string;
  tradeNo: string;
  amount: number;
  paymentDate: string;
  rtnMsg: string;
} {
  return {
    success: params["RtnCode"] === "1",
    merchantOrderNo: params["MerchantTradeNo"],
    tradeNo: params["TradeNo"],
    amount: Number(params["TradeAmt"]),
    paymentDate: params["PaymentDate"],
    rtnMsg: params["RtnMsg"] || "",
  };
}

export function verifyECPayNotification(params: Record<string, string>): boolean {
  const { verifyECPayCheckMac } = require("../utils/crypto");
  return verifyECPayCheckMac(params, config.ecpay.hashKey, config.ecpay.hashIV);
}
