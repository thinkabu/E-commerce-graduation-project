import api from './api';

export interface Product {
  _id: string;
  name: string;
  productId: string;
  slug: string;
  basePrice: number;
  discountPercentage: number;
  images: string[];
  averageRating?: number;
  soldCount?: number;
  isFeatured?: boolean;
}

export const getProducts = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  isFeatured?: boolean;
}): Promise<{ items: Product[]; meta: any }> => {
  try {
    const response = await api.get('/products', { params });
    const data = response.data.data || response.data;
    
    // Check if the response is paginated or direct array
    if (Array.isArray(data)) {
      return { items: data, meta: {} };
    }
    return { items: data.items || [], meta: data.meta || {} };
  } catch (error) {
    console.error('Error fetching products:', error);
    return { items: [], meta: {} };
  }
};

export const getProductById = async (id: string): Promise<any> => {
  try {
    const response = await api.get(`/products/${id}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    return null;
  }
};
