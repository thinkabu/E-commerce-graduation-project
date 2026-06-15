export interface Coupon {
  _id: string;
  code: string;
  description?: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usedCount: number;
  usageLimitPerUser: number;
  applicableCategories: string[];
  applicableProducts: string[];
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const BASE_URL = import.meta.env.VITE_API_URL;

export const fetchCoupons = async (): Promise<Coupon[]> => {
  try {
    const res = await fetch(`${BASE_URL}/coupons`);
    const json = await res.json();
    const data = json.data || json;
    if (data && Array.isArray(data.items)) {
      return data.items;
    }
    if (Array.isArray(data)) {
      return data;
    }
    return [];
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return [];
  }
};

export const fetchCouponById = async (id: string): Promise<Coupon | null> => {
  try {
    const res = await fetch(`${BASE_URL}/coupons/${id}`);
    const json = await res.json();
    return json.data || json;
  } catch (error) {
    console.error("Error fetching coupon:", error);
    return null;
  }
};

export const createCoupon = async (
  data: Partial<Coupon>,
): Promise<{ success: boolean; message: string }> => {
  try {
    const res = await fetch(`${BASE_URL}/coupons`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok)
      return { success: true, message: "Tạo mã giảm giá thành công!" };
    const json = await res.json();
    return { success: false, message: json.message || "Lỗi tạo mã giảm giá." };
  } catch (error) {
    return { success: false, message: "Không thể kết nối đến server." };
  }
};

export const updateCoupon = async (
  id: string,
  data: Partial<Coupon>,
): Promise<{ success: boolean; message: string }> => {
  try {
    const res = await fetch(`${BASE_URL}/coupons/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok)
      return { success: true, message: "Cập nhật mã giảm giá thành công!" };
    const json = await res.json();
    return {
      success: false,
      message: json.message || "Lỗi cập nhật mã giảm giá.",
    };
  } catch (error) {
    return { success: false, message: "Không thể kết nối đến server." };
  }
};

export const deleteCoupon = async (id: string): Promise<boolean> => {
  try {
    const res = await fetch(`${BASE_URL}/coupons/${id}`, { method: "DELETE" });
    return res.ok;
  } catch (error) {
    console.error("Error deleting coupon:", error);
    return false;
  }
};
