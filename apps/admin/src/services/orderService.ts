import { getAdminUser } from "./authService";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export interface OrderQuery {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Backend wraps all responses via ResponseInterceptor:
 * { success: true, data: <actual payload>, message: "..." }
 * So we always need to unwrap json.data to get the real payload.
 */

export const getAdminOrders = async (query: OrderQuery = {}) => {
  try {
    const params = new URLSearchParams();
    if (query.page) params.append("page", query.page.toString());
    if (query.limit) params.append("limit", query.limit.toString());
    if (query.status && query.status !== "all")
      params.append("status", query.status);
    if (query.search) params.append("search", query.search);
    if (query.startDate) params.append("startDate", query.startDate);
    if (query.endDate) params.append("endDate", query.endDate);

    const res = await fetch(`${BASE_URL}/orders/admin?${params.toString()}`);
    if (!res.ok) {
      throw new Error("Failed to fetch orders");
    }
    const json = await res.json();
    // Unwrap ResponseInterceptor envelope: json = { success, data: { data, total, page, limit }, message }
    const payload = json.data || json;
    return payload;
  } catch (error) {
    console.error("Error fetching admin orders:", error);
    return { data: [], total: 0 };
  }
};

export const getAdminOrderSummary = async (
  startDate?: string,
  endDate?: string,
) => {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const res = await fetch(
      `${BASE_URL}/orders/admin/summary?${params.toString()}`,
    );
    if (!res.ok) {
      throw new Error("Failed to fetch order summary");
    }
    const json = await res.json();
    // Unwrap: json = { success, data: { totalOrders, totalRevenue, pendingOrders }, message }
    const payload = json.data || json;
    return payload;
  } catch (error) {
    console.error("Error fetching order summary:", error);
    return { totalOrders: 0, totalRevenue: 0, pendingOrders: 0 };
  }
};

export const updateOrderStatus = async (
  orderId: string,
  status: string,
  note?: string,
) => {
  try {
    const admin = getAdminUser();
    const res = await fetch(`${BASE_URL}/orders/admin/${orderId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status, adminId: admin?._id, note }),
    });

    if (!res.ok) {
      throw new Error("Failed to update status");
    }

    const json = await res.json();
    return json.data || json;
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
};
