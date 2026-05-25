import type { DashboardStats, Order, PaymentGatewayConfig, PaymentResult, CreateOrderRequest } from "../types/payment";

function randomId(): string {
  return Math.random().toString(36).substring(2, 10);
}

function randomDate(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
}

function randomAmount(): number {
  return [299, 499, 999, 1499, 1999, 3999][Math.floor(Math.random() * 6)];
}

const sampleItems = ["VIP 會員", "線上課程", "電子書", "高級方案", "Premium 年費", "顧問服務"];

function generateOrders(count: number): Order[] {
  return Array.from({ length: count }, (_, i) => ({
    id: randomId(),
    merchantOrderNo: `DEMO${String(1000 + i).padStart(6, "0")}`,
    amount: randomAmount(),
    currency: "TWD",
    itemName: sampleItems[i % sampleItems.length],
    status: (["created", "processing", "completed", "completed", "completed"] as const)[i % 5],
    paymentStatus: (["paid", "paid", "paid", "pending", "failed"] as const)[i % 5],
    paymentProvider: (["ecpay", "newebpay", "linepay", "jkopay"] as const)[i % 4],
    tradeNo: i % 3 === 0 ? undefined : `TXN${Date.now()}${i}`,
    paymentDate: i % 3 === 0 ? undefined : randomDate(i),
    buyerInfo: {
      name: `用戶${String.fromCharCode(65 + i)}`,
      email: `user${i}@example.com`,
    },
    createdAt: randomDate(i),
    updatedAt: randomDate(i),
  }));
}

const mockOrders = generateOrders(25);

export const mockData = {
  getDashboardStats(): DashboardStats {
    const paid = mockOrders.filter((o) => o.paymentStatus === "paid");
    const totalRevenue = paid.reduce((s, o) => s + o.amount, 0);
    const today = new Date().toISOString().slice(0, 10);
    const todayPaid = paid.filter((o) => o.paymentDate?.startsWith(today));
    const todayRevenue = todayPaid.reduce((s, o) => s + o.amount, 0);

    const revenueByProvider = ["ecpay", "newebpay", "linepay", "jkopay"].map((p) => ({
      provider: p,
      revenue: paid.filter((o) => o.paymentProvider === p).reduce((s, o) => s + o.amount, 0),
    }));

    const dailyRevenue = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().slice(0, 10);
      return { date: dateStr, amount: paid.filter((o) => o.paymentDate?.startsWith(dateStr)).reduce((s, o) => s + o.amount, 0) };
    });

    return {
      totalOrders: mockOrders.length,
      totalRevenue,
      successfulPayments: paid.length,
      failedPayments: mockOrders.filter((o) => o.paymentStatus === "failed").length,
      pendingOrders: mockOrders.filter((o) => o.paymentStatus === "pending").length,
      todayRevenue,
      recentOrders: mockOrders.slice(0, 10),
      revenueByProvider,
      dailyRevenue,
    };
  },

  getOrders(params?: { page?: number; limit?: number }): { orders: Order[]; total: number; page: number } {
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const start = (page - 1) * limit;
    return { orders: mockOrders.slice(start, start + limit), total: mockOrders.length, page };
  },

  getOrder(id: string): Order | undefined {
    return mockOrders.find((o) => o.id === id);
  },

  createOrder(req: CreateOrderRequest): PaymentResult {
    const orderNo = `DEMO${String(1000 + mockOrders.length).padStart(6, "0")}`;
    const order: Order = {
      id: randomId(),
      merchantOrderNo: orderNo,
      amount: req.amount,
      currency: "TWD",
      itemName: req.itemName,
      description: req.description,
      status: "processing",
      paymentStatus: "pending",
      paymentProvider: req.paymentProvider,
      tradeNo: `TXN${Date.now()}`,
      buyerInfo: req.buyer,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockOrders.unshift(order);

    return {
      success: true,
      message: "示範模式：訂單已建立（無實際金流）",
      paymentUrl: `https://example.com/pay/${orderNo}`,
      tradeNo: order.tradeNo,
      orderId: order.id,
    };
  },

  getGateways(): PaymentGatewayConfig[] {
    return [
      { provider: "ecpay", label: "綠界科技 ECPay", enabled: true, merchantId: "2000132" },
      { provider: "newebpay", label: "藍新科技 NewebPay", enabled: true, merchantId: "MS12345678" },
      { provider: "linepay", label: "LINE Pay", enabled: true, merchantId: "test_channel" },
      { provider: "jkopay", label: "街口支付 JKOPay", enabled: true, merchantId: "test_jkopay" },
    ];
  },

  updateGateway(provider: string, cfg: Partial<PaymentGatewayConfig>): PaymentGatewayConfig {
    const gw = mockData.getGateways().find((g) => g.provider === provider);
    return { ...gw!, ...cfg };
  },

  refundOrder(orderId: string): PaymentResult {
    const order = mockOrders.find((o) => o.id === orderId);
    if (!order) return { success: false, message: "訂單不存在" };
    if (order.paymentStatus !== "paid") return { success: false, message: "僅已付款訂單可退款" };
    order.paymentStatus = "refunded";
    order.status = "refunded";
    return { success: true, message: "示範模式：退款成功" };
  },
};
