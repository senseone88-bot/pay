import type {
  Order,
  CreateOrderRequest,
  PaymentResult,
  DashboardStats,
  PaymentGatewayConfig,
} from "../types/payment";
import { mockData } from "./mockData";

const USE_MOCK = !import.meta.env.VITE_API_BASE_URL;

class PaymentApi {
  private useMock = USE_MOCK;

  constructor() {
    if (USE_MOCK) {
      console.log("[API] 使用示範模式 (Mock Data)");
    }
  }

  async getDashboardStats(): Promise<DashboardStats> {
    if (this.useMock) return mockData.getDashboardStats();
    try {
      const { default: axios } = await import("axios");
      const { data } = await axios.get("/api/dashboard/stats");
      return data.data;
    } catch {
      this.useMock = true;
      return mockData.getDashboardStats();
    }
  }

  async getOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
    provider?: string;
  }): Promise<{ orders: Order[]; total: number; page: number }> {
    if (this.useMock) return mockData.getOrders(params);
    try {
      const { default: axios } = await import("axios");
      const { data } = await axios.get("/api/orders", { params });
      return data.data;
    } catch {
      this.useMock = true;
      return mockData.getOrders(params);
    }
  }

  async getOrder(id: string): Promise<Order> {
    if (this.useMock) {
      const order = mockData.getOrder(id);
      if (!order) throw new Error("訂單不存在");
      return order;
    }
    try {
      const { default: axios } = await import("axios");
      const { data } = await axios.get(`/api/orders/${id}`);
      return data.data;
    } catch {
      this.useMock = true;
      const order = mockData.getOrder(id);
      if (!order) throw new Error("訂單不存在");
      return order;
    }
  }

  async createOrder(req: CreateOrderRequest): Promise<PaymentResult> {
    if (this.useMock) return mockData.createOrder(req);
    try {
      const { default: axios } = await import("axios");
      const { data } = await axios.post("/api/orders", req);
      return data.data;
    } catch {
      this.useMock = true;
      return mockData.createOrder(req);
    }
  }

  async getPaymentGateways(): Promise<PaymentGatewayConfig[]> {
    if (this.useMock) return mockData.getGateways();
    try {
      const { default: axios } = await import("axios");
      const { data } = await axios.get("/api/payments/gateways");
      return data.data;
    } catch {
      this.useMock = true;
      return mockData.getGateways();
    }
  }

  async updatePaymentGateway(
    provider: string,
    config: Partial<PaymentGatewayConfig>
  ): Promise<PaymentGatewayConfig> {
    if (this.useMock) return mockData.updateGateway(provider, config);
    try {
      const { default: axios } = await import("axios");
      const { data } = await axios.put(`/api/payments/gateways/${provider}`, config);
      return data.data;
    } catch {
      this.useMock = true;
      return mockData.updateGateway(provider, config);
    }
  }

  async refundOrder(orderId: string): Promise<PaymentResult> {
    if (this.useMock) return mockData.refundOrder(orderId);
    try {
      const { default: axios } = await import("axios");
      const { data } = await axios.post(`/api/orders/${orderId}/refund`);
      return data.data;
    } catch {
      this.useMock = true;
      return mockData.refundOrder(orderId);
    }
  }
}

export const api = new PaymentApi();
