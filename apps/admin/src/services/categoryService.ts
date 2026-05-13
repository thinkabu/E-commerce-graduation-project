const API_BASE = "http://localhost:3000/api/categories";

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  level: number;
  isActive: boolean;
  sortOrder: number;
  children?: Category[];
}

export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const res = await fetch(API_BASE);
    const data = await res.json();
    return data.data || data || [];
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
};

export const fetchCategoryTree = async (): Promise<Category[]> => {
  try {
    const res = await fetch(`${API_BASE}/tree`);
    const data = await res.json();
    return data.data || data || [];
  } catch (error) {
    console.error("Error fetching category tree:", error);
    return [];
  }
};

export const getCategoryById = async (id: string): Promise<Category | null> => {
  try {
    const res = await fetch(`${API_BASE}/${id}`);
    if (!res.ok) throw new Error("Failed to fetch category");
    const data = await res.json();
    return data.data || data;
  } catch (error) {
    console.error("Error fetching category by id:", error);
    return null;
  }
};

export const createCategory = async (payload: Record<string, any>): Promise<any> => {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || "Lỗi khi tạo danh mục");
  }
  return res.json();
};

export const updateCategory = async (id: string, payload: Record<string, any>): Promise<any> => {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || "Lỗi khi cập nhật danh mục");
  }
  return res.json();
};

export const deleteCategory = async (id: string): Promise<any> => {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || "Lỗi khi xóa danh mục");
  }
  return res.json();
};

