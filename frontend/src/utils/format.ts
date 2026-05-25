export function formatNTD(amount: number): string {
  return new Intl.NumberFormat("zh-TW", {
    style: "currency",
    currency: "TWD",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("zh-TW", {
    month: "2-digit",
    day: "2-digit",
  });
}

export function statusColor(status: string): string {
  const map: Record<string, string> = {
    paid: "text-green-600 bg-green-50",
    pending: "text-yellow-600 bg-yellow-50",
    failed: "text-red-600 bg-red-50",
    refunded: "text-purple-600 bg-purple-50",
    expired: "text-gray-600 bg-gray-50",
    completed: "text-blue-600 bg-blue-50",
    created: "text-gray-600 bg-gray-50",
    processing: "text-indigo-600 bg-indigo-50",
    cancelled: "text-red-600 bg-red-50",
  };
  return map[status] || "text-gray-600 bg-gray-50";
}

export function statusLabel(status: string): string {
  const map: Record<string, string> = {
    paid: "已付款",
    pending: "待付款",
    failed: "付款失敗",
    refunded: "已退款",
    expired: "已過期",
    completed: "已完成",
    created: "已建立",
    processing: "處理中",
    cancelled: "已取消",
  };
  return map[status] || status;
}

export function providerLabel(provider: string): string {
  const map: Record<string, string> = {
    ecpay: "綠界科技 ECPay",
    newebpay: "藍新科技 NewebPay",
    linepay: "LINE Pay",
    jkopay: "街口支付",
  };
  return map[provider] || provider;
}
