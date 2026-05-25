export type PaymentProvider = "ecpay" | "newebpay" | "linepay" | "jkopay";

export type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded"
  | "expired";

export type OrderStatus =
  | "created"
  | "processing"
  | "completed"
  | "cancelled"
  | "refunded";

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

export interface BuyerInfo {
  name: string;
  email: string;
  phone?: string;
}

export interface CreateOrderRequest {
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

export interface PaymentResult {
  success: boolean;
  message: string;
  paymentUrl?: string;
  tradeNo?: string;
  orderId?: string;
}

export interface PaymentGatewayConfig {
  provider: PaymentProvider;
  label: string;
  enabled: boolean;
  merchantId?: string;
  apiKey?: string;
  apiSecret?: string;
}

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  successfulPayments: number;
  failedPayments: number;
  pendingOrders: number;
  todayRevenue: number;
  recentOrders: Order[];
  revenueByProvider: { provider: string; revenue: number }[];
  dailyRevenue: { date: string; amount: number }[];
}

export interface WebhookEvent {
  id: string;
  provider: PaymentProvider;
  type: string;
  rawData: Record<string, unknown>;
  processed: boolean;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
