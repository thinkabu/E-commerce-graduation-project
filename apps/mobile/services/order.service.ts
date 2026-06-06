import api from './api';

export interface OrderItemPayload {
  productId: string;
  variantId?: string;
  quantity: number;
}

export interface CreateOrderPayload {
  items: OrderItemPayload[];
  shippingAddressId: string;
  paymentMethod: string;
  couponId?: string;
  note?: string;
}

export interface Order {
  _id: string;
  orderId: string;
  userId: string;
  items: any[];
  shippingAddressSnapshot: any;
  subtotal: number;
  shippingFee: number;
  discount: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  statusHistory?: any[];
  createdAt: string;
}

export const createOrder = async (userId: string, payload: CreateOrderPayload): Promise<Order | null> => {
  try {
    const response = await api.post('/orders', payload, { params: { userId } });
    return response.data?.data ?? response.data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const getUserOrders = async (userId: string): Promise<Order[]> => {
  try {
    const response = await api.get('/orders/user', { params: { userId } });
    const data = response.data?.data ?? response.data;
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return [];
  }
};

export const getOrderById = async (id: string, userId: string): Promise<Order | null> => {
  try {
    const response = await api.get(`/orders/${id}`, { params: { userId } });
    return response.data?.data ?? response.data;
  } catch (error) {
    console.error('Error fetching order by id:', error);
    return null;
  }
};
