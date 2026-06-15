import api from "./api";

export interface ReviewData {
  _id: string;
  userId: any;
  productId: any;
  orderId: string;
  rating: number;
  title?: string;
  comment?: string;
  images: string[];
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  createdAt: string;
}

export const createReview = async (
  userId: string,
  payload: {
    productId: string;
    orderId: string;
    rating: number;
    title?: string;
    comment?: string;
  },
): Promise<ReviewData | null> => {
  try {
    const response = await api.post("/reviews", payload, {
      params: { userId },
    });
    return response.data?.data ?? response.data;
  } catch (error) {
    console.error("Error creating review:", error);
    throw error;
  }
};

export const getProductReviews = async (
  productId: string,
): Promise<ReviewData[]> => {
  try {
    const response = await api.get(`/reviews/product/${productId}`);
    const data = response.data?.data ?? response.data;
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching product reviews:", error);
    return [];
  }
};

export const getUserReviews = async (userId: string): Promise<ReviewData[]> => {
  try {
    const response = await api.get("/reviews/user", { params: { userId } });
    const data = response.data?.data ?? response.data;
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching user reviews:", error);
    return [];
  }
};

export const checkReviewed = async (
  userId: string,
  productId: string,
): Promise<boolean> => {
  try {
    const response = await api.get("/reviews/check", {
      params: { userId, productId },
    });
    return response.data?.data ?? response.data ?? false;
  } catch (error) {
    return false;
  }
};
