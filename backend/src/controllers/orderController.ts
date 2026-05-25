import { Request, Response } from "express";
import { orderModel } from "../models/order";
import { buildECPayFormParams } from "../services/ecpayService";
import { buildNewebPayForm } from "../services/newebpayService";
import { requestLinePayPayment } from "../services/linepayService";
import { requestJKOPayPayment } from "../services/jkopayService";
import type { CreateOrderInput } from "../models/order";

export async function createOrder(req: Request, res: Response) {
  try {
    const input: CreateOrderInput = req.body;

    if (!input.amount || !input.itemName || !input.buyer?.name || !input.buyer?.email) {
      return res.status(400).json({
        success: false,
        error: "請填寫必要欄位: amount, itemName, buyer.name, buyer.email",
      });
    }

    const order = orderModel.create(input);
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    let paymentUrl = "";
    let tradeNo = "";

    switch (input.paymentProvider) {
      case "ecpay": {
        const ecpay = buildECPayFormParams({
          order,
          returnUrl: `${baseUrl}/api/webhooks/ecpay/return`,
          clientBackUrl: input.redirectUrls?.clientBackUrl || `${baseUrl}/orders`,
          orderResultUrl: `${baseUrl}/api/webhooks/ecpay/result`,
        });

        const queryStr = Object.entries(ecpay.params)
          .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
          .join("&");
        paymentUrl = `${ecpay.action}?${queryStr}`;
        tradeNo = `EC${Date.now()}`;
        break;
      }

      case "newebpay": {
        const newebpay = buildNewebPayForm(order, baseUrl);
        const queryStr = new URLSearchParams({
          MerchantID: newebpay.merchantId,
          TradeInfo: newebpay.tradeInfo,
          TradeSha: newebpay.tradeSha,
          Version: newebpay.version,
        }).toString();
        paymentUrl = `${newebpay.action}?${queryStr}`;
        tradeNo = `NW${Date.now()}`;
        break;
      }

      case "linepay": {
        const linepay = await requestLinePayPayment(order, baseUrl);
        if (linepay) {
          paymentUrl = linepay.paymentUrl;
          tradeNo = linepay.transactionId;
        }
        break;
      }

      case "jkopay": {
        const jkopayResult = await requestJKOPayPayment(order, baseUrl);
        if (jkopayResult) {
          paymentUrl = jkopayResult.paymentUrl;
          tradeNo = jkopayResult.jkopayOrderId;
        } else {
          paymentUrl = `${baseUrl}/api/payments/jkopay/checkout/${order.id}`;
          tradeNo = `JK${Date.now()}`;
        }
        break;
      }
    }

    orderModel.update(order.id, {
      paymentUrl,
      tradeNo,
      status: "processing",
    });

    const updated = orderModel.findById(order.id);

    res.json({
      success: true,
      data: {
        success: true,
        message: "訂單已建立",
        paymentUrl,
        tradeNo,
        orderId: order.id,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: (err as Error).message || "建立訂單失敗",
    });
  }
}

export function getOrders(req: Request, res: Response) {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const status = req.query.status as string | undefined;
  const provider = req.query.provider as string | undefined;

  const result = orderModel.findAll({ page, limit, status, provider });

  res.json({
    success: true,
    data: { ...result, page },
  });
}

export function getOrder(req: Request, res: Response) {
  const order = orderModel.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, error: "訂單不存在" });
  }
  res.json({ success: true, data: order });
}

export async function refundOrder(req: Request, res: Response) {
  const order = orderModel.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, error: "訂單不存在" });
  }

  if (order.paymentStatus !== "paid") {
    return res.status(400).json({
      success: false,
      error: "僅已付款訂單可以退款",
    });
  }

  orderModel.update(order.id, {
    paymentStatus: "refunded",
    status: "refunded",
  });

  res.json({
    success: true,
    data: {
      success: true,
      message: "退款成功",
      orderId: order.id,
    },
  });
}

export function getDashboardStats(_req: Request, res: Response) {
  const stats = orderModel.getStats();
  res.json({ success: true, data: stats });
}
