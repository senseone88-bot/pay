export type PaymentProvider = "ecpay" | "newebpay" | "linepay" | "jkopay";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded" | "expired";
export type OrderStatus = "created" | "processing" | "completed" | "cancelled" | "refunded";

export interface BuyerInfo {
  name: string;
  email: string;
  phone?: string;
}

export interface Order {
  id: string;
  merchantOrderNo: string;
  amount: number;
  currency: string;
  itemName: string;
  description?: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentProvider: PaymentProvider;
  paymentUrl?: string;
  tradeNo?: string;
  paymentDate?: string;
  buyerInfo?: BuyerInfo;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderInput {
  amount: number;
  itemName: string;
  description?: string;
  buyer: BuyerInfo;
  paymentProvider: PaymentProvider;
  redirectUrls?: {
    frontendRedirect?: string;
    clientBackUrl?: string;
  };
}

const orders: Map<string, Order> = new Map();

export const orderModel = {
  create(input: CreateOrderInput): Order {
    const { v4: uuid } = require("uuid");
    const { generateOrderNo } = require("../utils/crypto");
    const id = uuid();
    const order: Order = {
      id,
      merchantOrderNo: generateOrderNo(),
      amount: input.amount,
      currency: "TWD",
      itemName: input.itemName,
      description: input.description,
      status: "created",
      paymentStatus: "pending",
      paymentProvider: input.paymentProvider,
      buyerInfo: input.buyer,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    orders.set(id, order);
    return order;
  },

  findById(id: string): Order | undefined {
    return orders.get(id);
  },

  findByMerchantOrderNo(no: string): Order | undefined {
    for (const order of orders.values()) {
      if (order.merchantOrderNo === no) return order;
    }
    return undefined;
  },

  update(id: string, updates: Partial<Order>): Order | undefined {
    const order = orders.get(id);
    if (!order) return undefined;
    const updated = { ...order, ...updates, updatedAt: new Date().toISOString() };
    orders.set(id, updated);
    return updated;
  },

  findAll(params?: {
    page?: number;
    limit?: number;
    status?: string;
    provider?: string;
  }): { orders: Order[]; total: number } {
    let list = Array.from(orders.values());

    if (params?.status) {
      list = list.filter((o) => o.paymentStatus === params.status);
    }
    if (params?.provider) {
      list = list.filter((o) => o.paymentProvider === params.provider);
    }

    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = list.length;
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const start = (page - 1) * limit;
    const paged = list.slice(start, start + limit);

    return { orders: paged, total };
  },

  getStats() {
    const list = Array.from(orders.values());
    const totalOrders = list.length;
    const successfulPayments = list.filter((o) => o.paymentStatus === "paid").length;
    const failedPayments = list.filter((o) => o.paymentStatus === "failed").length;
    const pendingOrders = list.filter((o) => o.paymentStatus === "pending").length;
    const totalRevenue = list
      .filter((o) => o.paymentStatus === "paid")
      .reduce((sum, o) => sum + o.amount, 0);

    const today = new Date().toISOString().slice(0, 10);
    const todayRevenue = list
      .filter((o) => o.paymentStatus === "paid" && o.paymentDate?.startsWith(today))
      .reduce((sum, o) => sum + o.amount, 0);

    const recentOrders = list.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ).slice(0, 10);

    const revenueByProvider = [
      { provider: "ecpay", revenue: 0 },
      { provider: "newebpay", revenue: 0 },
      { provider: "linepay", revenue: 0 },
      { provider: "jkopay", revenue: 0 },
    ];
    list
      .filter((o) => o.paymentStatus === "paid")
      .forEach((o) => {
        const entry = revenueByProvider.find((r) => r.provider === o.paymentProvider);
        if (entry) entry.revenue += o.amount;
      });

    const dailyRevenue: { date: string; amount: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const amount = list
        .filter(
          (o) => o.paymentStatus === "paid" && o.paymentDate?.startsWith(dateStr)
        )
        .reduce((sum, o) => sum + o.amount, 0);
      dailyRevenue.push({ date: dateStr, amount });
    }

    return {
      totalOrders,
      totalRevenue,
      successfulPayments,
      failedPayments,
      pendingOrders,
      todayRevenue,
      recentOrders,
      revenueByProvider,
      dailyRevenue,
    };
  },
};
