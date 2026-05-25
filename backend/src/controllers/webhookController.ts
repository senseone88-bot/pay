import { Request, Response } from "express";
import { orderModel } from "../models/order";
import { verifyECPayNotification, parseECPayReturn } from "../services/ecpayService";

export function handleECPayReturn(req: Request, res: Response) {
  const params = req.body as Record<string, string>;

  const isValid = verifyECPayNotification(params);
  if (!isValid) {
    console.error("[ECPay] Invalid CheckMacValue");
    return res.status(400).send("0|Invalid CheckMac");
  }

  const result = parseECPayReturn(params);

  if (result.success) {
    const order = orderModel.findByMerchantOrderNo(result.merchantOrderNo);
    if (order) {
      orderModel.update(order.id, {
        paymentStatus: "paid",
        status: "completed",
        tradeNo: result.tradeNo,
        paymentDate: result.paymentDate,
      });
      console.log(`[ECPay] Order ${result.merchantOrderNo} paid`);
    }
  }

  res.send("1|OK");
}

export function handleECPayResult(req: Request, res: Response) {
  const params = req.body as Record<string, string>;
  const result = parseECPayReturn(params);

  if (result.success) {
    const order = orderModel.findByMerchantOrderNo(result.merchantOrderNo);
    if (order) {
      orderModel.update(order.id, {
        paymentStatus: "paid",
        status: "completed",
        tradeNo: result.tradeNo,
        paymentDate: result.paymentDate,
      });
    }
  }

  res.redirect(
    result.success
      ? `/?order=${result.merchantOrderNo}&status=success`
      : `/?order=${result.merchantOrderNo}&status=failed`
  );
}

export function handleNewebPayReturn(req: Request, res: Response) {
  const { TradeInfo, TradeSha } = req.body;
  const { parseNewebPayReturn } = require("../services/newebpayService");

  const result = parseNewebPayReturn(TradeInfo, TradeSha);
  if (!result) {
    return res.status(400).json({ success: false, error: "Invalid data" });
  }

  if (result.success) {
    const order = orderModel.findByMerchantOrderNo(result.merchantOrderNo);
    if (order) {
      orderModel.update(order.id, {
        paymentStatus: "paid",
        status: "completed",
        tradeNo: result.tradeNo,
        paymentDate: new Date().toISOString(),
      });
    }
  }

  res.json({ success: result.success });
}

export function handleLinePayConfirm(req: Request, res: Response) {
  const { transactionId, orderId } = req.query as {
    transactionId: string;
    orderId: string;
  };

  const order = orderModel.findByMerchantOrderNo(orderId);
  if (order) {
    orderModel.update(order.id, {
      paymentStatus: "paid",
      status: "completed",
      tradeNo: transactionId,
      paymentDate: new Date().toISOString(),
    });
  }

  res.redirect(`/?order=${orderId}&status=success`);
}

export function handleJKOPayNotify(req: Request, res: Response) {
  const signature = req.headers["x-jkopay-signature"] as string;
  const bodyStr = JSON.stringify(req.body);

  const { verifyJKOPayWebhook, parseJKOPayNotification } = require("../services/jkopayService");

  const isValid = verifyJKOPayWebhook(bodyStr, signature);
  if (!isValid) {
    console.error("[JKOPay] Invalid webhook signature");
    return res.status(400).json({ success: false, error: "Invalid signature" });
  }

  const result = parseJKOPayNotification(req.body);

  if (result.success) {
    const order = orderModel.findByMerchantOrderNo(result.merchantOrderNo);
    if (order) {
      orderModel.update(order.id, {
        paymentStatus: "paid",
        status: "completed",
        tradeNo: result.jkopayOrderId,
        paymentDate: new Date().toISOString(),
      });
      console.log(`[JKOPay] Order ${result.merchantOrderNo} paid`);
    }
  }

  res.json({ success: true });
}
