import api from "./api";

export interface ValidateCouponResult {
  valid: boolean;
  message?: string;
  coupon?: {
    code: string;
    discountType: "PERCENTAGE" | "FIXED_AMOUNT";
    discountValue: number;
    maxDiscountAmount?: number;
    description?: string;
  };
}

export const validateCoupon = async (
  code: string,
  orderAmount: number,
): Promise<ValidateCouponResult> => {
  try {
    const res = await api.post("/coupons/validate", { code, orderAmount });
    return res.data?.data ?? res.data;
  } catch (err: any) {
    const msg = err?.response?.data?.message || "Mã giảm giá không hợp lệ";
    return { valid: false, message: msg };
  }
};
