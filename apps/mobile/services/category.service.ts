import api from './api';

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string | null;
  level: number;
  isActive: boolean;
  sortOrder: number;
}

export const getCategories = async (): Promise<Category[]> => {
  try {
    const response = await api.get('/categories');
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};
