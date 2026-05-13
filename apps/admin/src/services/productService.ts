import type { Product } from "@/types/product";

const API_BASE = "http://localhost:3000/api/products";

// Helper: slug từ tên sản phẩm
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // bỏ dấu tiếng Việt
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// Lấy danh sách sản phẩm
export async function fetchProducts(params?: {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  sortBy?: string;
  sortOrder?: string;
}): Promise<{ items: Product[]; meta: { page: number; limit: number; total: number; totalPages: number } }> {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.search) query.set("search", params.search);
  if (params?.categoryId) query.set("categoryId", params.categoryId);
  if (params?.sortBy) query.set("sortBy", params.sortBy);
  if (params?.sortOrder) query.set("sortOrder", params.sortOrder);

  const url = query.toString() ? `${API_BASE}?${query}` : API_BASE;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Lỗi khi tải danh sách sản phẩm");
  const json = await res.json();
  return json.data || json;
}

// Lấy chi tiết sản phẩm
export async function fetchProductById(id: string): Promise<Product & { variants: any[] }> {
  const res = await fetch(`${API_BASE}/${id}`);
  if (!res.ok) throw new Error("Lỗi khi tải chi tiết sản phẩm");
  const json = await res.json();
  return json.data || json;
}

// Tạo sản phẩm mới
export async function createProduct(data: Record<string, any>): Promise<any> {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || "Lỗi khi tạo sản phẩm");
  }
  const json = await res.json();
  return json.data || json;
}

// Cập nhật sản phẩm
export async function updateProduct(id: string, data: Record<string, any>): Promise<any> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || "Lỗi khi cập nhật sản phẩm");
  }
  const json = await res.json();
  return json.data || json;
}

// Xóa sản phẩm (soft delete)
export async function deleteProductApi(id: string): Promise<any> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || "Lỗi khi xóa sản phẩm");
  }
  const json = await res.json();
  return json.data || json;
}

// Upload hình ảnh lên Cloudinary
export async function uploadImages(files: File[]): Promise<string[]> {
  if (!files || files.length === 0) return [];

  const formData = new FormData();
  files.forEach((file) => {
    formData.append('images', file);
  });

  const uploadUrl = API_BASE.replace('/products', '/upload/images');
  
  const res = await fetch(uploadUrl, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || "Lỗi khi tải ảnh lên");
  }

  const json = await res.json();
  return json.data?.urls || json.urls || [];
}

