import { Request, Response } from "express";

interface GatewayConfig {
  provider: string;
  label: string;
  enabled: boolean;
  merchantId?: string;
}

const gateways: GatewayConfig[] = [
  { provider: "ecpay", label: "綠界科技 ECPay", enabled: true, merchantId: process.env.ECPAY_MERCHANT_ID || "" },
  { provider: "newebpay", label: "藍新科技 NewebPay", enabled: true, merchantId: process.env.NEWEBPAY_MERCHANT_ID || "" },
  { provider: "linepay", label: "LINE Pay", enabled: true, merchantId: process.env.LINE_PAY_CHANNEL_ID || "" },
  { provider: "jkopay", label: "街口支付 JKOPay", enabled: true, merchantId: process.env.JKOPAY_API_KEY || "" },
];

export function getGateways(_req: Request, res: Response) {
  res.json({ success: true, data: gateways });
}

export function updateGateway(req: Request, res: Response) {
  const { provider } = req.params;
  const { enabled } = req.body;

  const idx = gateways.findIndex((g) => g.provider === provider);
  if (idx === -1) {
    return res.status(404).json({ success: false, error: "金流服務不存在" });
  }

  if (typeof enabled === "boolean") {
    gateways[idx].enabled = enabled;
  }

  res.json({ success: true, data: gateways[idx] });
}
