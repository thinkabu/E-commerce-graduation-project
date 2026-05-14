import api from './api';

export const getWishlist = async (userId: string, page = 1, limit = 10) => {
  try {
    const response = await api.get('/wishlist', {
      params: { userId, page, limit },
    });
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return null;
  }
};

export const toggleWishlist = async (userId: string, productId: string) => {
  try {
    const response = await api.post(
      `/wishlist/toggle/${productId}`,
      {},
      { params: { userId } }
    );
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error toggling wishlist:', error);
    throw error;
  }
};

export const checkWishlist = async (userId: string, productId: string) => {
  try {
    const response = await api.get(`/wishlist/check/${productId}`, {
      params: { userId },
    });
    // The endpoint returns { isWished: boolean }
    const data = response.data.data || response.data;
    return data.isWished;
  } catch (error) {
    console.error('Error checking wishlist:', error);
    return false;
  }
};
