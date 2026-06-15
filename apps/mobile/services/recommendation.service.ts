import api from "./api";

export interface RecommendationItem {
  productId: string;
  score: number;
  reason?: string;
  product?: any; // Đầy đủ thông tin sản phẩm từ Backend
}

export interface RecommendationResponse {
  sessionId: string;
  recommendations: RecommendationItem[];
}

/**
   Lấy gợi ý cá nhân hóa cho User ở màn hình chính (Trang chủ)
 * @param userId ID người dùng hoặc 'guest' nếu chưa đăng nhập
 */
export const getUserRecommendations = async (
  userId: string = "guest"
): Promise<RecommendationResponse> => {
  try {
    const response = await api.get(`/recommendations/user/${userId}`);
    return response.data?.data || response.data;
  } catch (error) {
    console.error("Error fetching user recommendations:", error);
    return { sessionId: "", recommendations: [] };
  }
};

/**
   Lấy gợi ý sản phẩm tương tự ở màn hình chi tiết sản phẩm
 * @param productId ID của sản phẩm đang xem
 */
export const getSimilarProducts = async (
  productId: string
): Promise<RecommendationItem[]> => {
  try {
    const response = await api.get(`/recommendations/similar/${productId}`);
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error(`Error fetching similar products for ${productId}:`, error);
    return [];
  }
};

/**
   Ghi nhận lượt click của người dùng vào sản phẩm từ danh sách gợi ý
 */
export const logRecommendationClick = async (
  sessionId: string,
  productId: string
): Promise<boolean> => {
  if (!sessionId) return false;
  try {
    const response = await api.post("/recommendations/click", {
      sessionId,
      productId,
    });
    return !!response.data?.data?.success || !!response.data?.success;
  } catch (error) {
    console.error("Error logging recommendation click:", error);
    return false;
  }
};

/**
   Ghi nhận lượt mua của người dùng từ danh sách gợi ý
 */
export const logRecommendationPurchase = async (
  sessionId: string,
  productId: string
): Promise<boolean> => {
  if (!sessionId) return false;
  try {
    const response = await api.post("/recommendations/purchase", {
      sessionId,
      productId,
    });
    return !!response.data?.data?.success || !!response.data?.success;
  } catch (error) {
    console.error("Error logging recommendation purchase:", error);
    return false;
  }
};
