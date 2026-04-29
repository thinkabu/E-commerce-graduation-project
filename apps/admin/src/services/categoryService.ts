export interface Category {
  _id: string;
  name: string;
  slug: string;
  parentId?: string;
  isActive: boolean;
}

export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const res = await fetch("http://localhost:5001/api/categories");
    const data = await res.json();
    return data.data || data || [];
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
};
