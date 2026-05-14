import api from './api';

export const getCart = async (userId: string) => {
  try {
    const response = await api.get('/cart', { params: { userId } });
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error fetching cart:', error);
    return null;
  }
};

export const addToCart = async (
  userId: string,
  productId: string,
  variantId: string | undefined,
  quantity: number
) => {
  try {
    const response = await api.post(
      '/cart/items',
      { productId, variantId, quantity },
      { params: { userId } }
    );
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
};

export const updateCartItem = async (
  userId: string,
  itemId: string,
  quantity: number
) => {
  try {
    const response = await api.patch(
      `/cart/items/${itemId}`,
      { quantity },
      { params: { userId } }
    );
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error updating cart item:', error);
    throw error;
  }
};

export const removeFromCart = async (userId: string, itemId: string) => {
  try {
    const response = await api.delete(`/cart/items/${itemId}`, {
      params: { userId },
    });
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw error;
  }
};

export const clearCart = async (userId: string) => {
  try {
    const response = await api.delete('/cart/clear', { params: { userId } });
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
};
