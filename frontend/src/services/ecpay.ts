import type { PaymentResult } from "../types/payment";

interface ECPayCheckoutParams {
  merchantId: string;
  merchantOrderNo: string;
  amount: number;
  itemName: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone?: string;
  returnUrl: string;
  clientBackUrl: string;
  orderResultUrl: string;
  hashKey: string;
  hashIV: string;
}

function generateCheckMacCode(params: Record<string, string>, hashKey: string, hashIV: string): string {
  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  const raw = `HashKey=${hashKey}&${sorted}&HashIV=${hashIV}`;
  const encoded = encodeURIComponent(raw).toLowerCase();
  let step = encoded;
  for (const c of ["%2d", "%5f", "%2e", "%21", "%2a", "%28", "%29"]) {
    step = step.split(c).join("");
  }
  step = step.split("%7e").join("~");
  return step;
}

export async function createECPayPayment(params: {
  merchantOrderNo: string;
  amount: number;
  itemName: string;
  buyerName: string;
  buyerEmail: string;
  returnUrl?: string;
  clientBackUrl?: string;
}): Promise<PaymentResult> {
  const merchantId = import.meta.env.VITE_ECPAY_MERCHANT_ID || "2000132";
  const hashKey = import.meta.env.VITE_ECPAY_HASH_KEY || "5294y06JbISpM5x9";
  const hashIV = import.meta.env.VITE_ECPAY_HASH_IV || "v77hoKGq4kWxNNIS";
  const baseUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin;

  const formParams: Record<string, string> = {
    MerchantID: merchantId,
    MerchantTradeNo: params.merchantOrderNo,
    MerchantTradeDate: new Date()
      .toISOString()
      .replace(/[T.-]/g, "")
      .slice(0, 14),
    PaymentType: "aio",
    TotalAmount: String(Math.round(params.amount)),
    TradeDesc: "線上付款",
    ItemName: params.itemName,
    ReturnURL: params.returnUrl || `${baseUrl}/api/webhooks/ecpay/return`,
    ClientBackURL: params.clientBackUrl || `${window.location.origin}/orders`,
    OrderResultURL: `${baseUrl}/api/webhooks/ecpay/result`,
    ChoosePayment: "ALL",
    EncryptType: "1",
    NeedExtraPaidInfo: "N",
  };

  const checkMac = generateCheckMacCode(formParams, hashKey, hashIV);

  return {
    success: true,
    message: "ECPay 付款頁面已產生",
    paymentUrl: `https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5?MerchantID=${merchantId}&CheckMacValue=${checkMac}&${Object.entries(formParams)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join("&")}`,
    tradeNo: `EC${Date.now()}`,
  };
}

export function parseECPayReturn(params: Record<string, string>): {
  success: boolean;
  merchantOrderNo: string;
  tradeNo: string;
  amount: number;
  paymentDate: string;
} {
  return {
    success: params["RtnCode"] === "1",
    merchantOrderNo: params["MerchantTradeNo"],
    tradeNo: params["TradeNo"],
    amount: Number(params["TradeAmt"]),
    paymentDate: params["PaymentDate"],
  };
}

export const ECPAY_CHECKOUT_URL = "https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5";
export const ECPAY_CHECKOUT_URL_LIVE = "https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5";
