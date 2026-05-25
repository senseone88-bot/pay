import axios, { AxiosInstance, AxiosError } from "axios";
import type {
  ApiResponse,
  Order,
  CreateOrderRequest,
  PaymentResult,
  DashboardStats,
  PaymentGatewayConfig,
} from "../types/payment";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

class PaymentApi {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE,
      timeout: 30000,
      headers: { "Content-Type": "application/json" },
    });

    this.client.interceptors.response.use(
      (res) => res,
      (err: AxiosError<ApiResponse<never>>) => {
        const msg =
          err.response?.data?.error || err.message || "請求失敗";
        return Promise.reject(new Error(msg));
      }
    );
  }

  setToken(token: string) {
    this.client.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const { data } = await this.client.get<ApiResponse<DashboardStats>>(
      "/dashboard/stats"
    );
    return data.data!;
  }

  async getOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
    provider?: string;
  }): Promise<{ orders: Order[]; total: number; page: number }> {
    const { data } = await this.client.get<ApiResponse<{
      orders: Order[];
      total: number;
      page: number;
    }>>("/orders", { params });
    return data.data!;
  }

  async getOrder(id: string): Promise<Order> {
    const { data } = await this.client.get<ApiResponse<Order>>(
      `/orders/${id}`
    );
    return data.data!;
  }

  async createOrder(req: CreateOrderRequest): Promise<PaymentResult> {
    const { data } = await this.client.post<ApiResponse<PaymentResult>>(
      "/orders",
      req
    );
    return data.data!;
  }

  async getPaymentGateways(): Promise<PaymentGatewayConfig[]> {
    const { data } = await this.client.get<
      ApiResponse<PaymentGatewayConfig[]>
    >("/payments/gateways");
    return data.data!;
  }

  async updatePaymentGateway(
    provider: string,
    config: Partial<PaymentGatewayConfig>
  ): Promise<PaymentGatewayConfig> {
    const { data } = await this.client.put<
      ApiResponse<PaymentGatewayConfig>
    >(`/payments/gateways/${provider}`, config);
    return data.data!;
  }

  async refundOrder(orderId: string): Promise<PaymentResult> {
    const { data } = await this.client.post<ApiResponse<PaymentResult>>(
      `/orders/${orderId}/refund`
    );
    return data.data!;
  }
}

export const api = new PaymentApi();
