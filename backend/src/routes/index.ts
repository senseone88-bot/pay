import { Router } from "express";
import {
  createOrder,
  getOrders,
  getOrder,
  refundOrder,
  getDashboardStats,
} from "../controllers/orderController";
import { getGateways, updateGateway } from "../controllers/paymentController";
import {
  handleECPayReturn,
  handleECPayResult,
  handleNewebPayReturn,
  handleLinePayConfirm,
  handleJKOPayNotify,
} from "../controllers/webhookController";
import {
  showJKOPayCheckout,
  handleJKOPayReturn,
} from "../controllers/jkopayController";

const router = Router();

router.get("/dashboard/stats", getDashboardStats);

router.get("/orders", getOrders);
router.post("/orders", createOrder);
router.get("/orders/:id", getOrder);
router.post("/orders/:id/refund", refundOrder);

router.get("/payments/gateways", getGateways);
router.put("/payments/gateways/:provider", updateGateway);

router.post("/webhooks/ecpay/return", handleECPayReturn);
router.post("/webhooks/ecpay/result", handleECPayResult);
router.post("/webhooks/newebpay/return", handleNewebPayReturn);
router.get("/webhooks/linepay/confirm", handleLinePayConfirm);
router.post("/webhooks/jkopay/notify", handleJKOPayNotify);
router.get("/webhooks/jkopay/return", handleJKOPayReturn);

router.get("/payments/jkopay/checkout/:orderId", showJKOPayCheckout);

export default router;
