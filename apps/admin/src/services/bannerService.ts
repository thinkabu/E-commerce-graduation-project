export interface Banner {
  _id: string;
  title: string;
  subtitle?: string;
  image: string;
  link?: string;
  position: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

const BASE_URL = import.meta.env.VITE_API_URL;

export const fetchBanners = async (): Promise<Banner[]> => {
  try {
    const res = await fetch(`${BASE_URL}/banners`);
    const json = await res.json();
    const data = json.data || json;
    if (data && Array.isArray(data.items)) {
      return data.items;
    }
    if (Array.isArray(data)) {
      return data;
    }
    return [];
  } catch (error) {
    console.error("Error fetching banners:", error);
    return [];
  }
};

export const fetchBannerById = async (id: string): Promise<Banner | null> => {
  try {
    const res = await fetch(`${BASE_URL}/banners/${id}`);
    const json = await res.json();
    return json.data || json;
  } catch (error) {
    console.error("Error fetching banner:", error);
    return null;
  }
};

export const createBanner = async (
  data: Partial<Banner>,
): Promise<{ success: boolean; message: string }> => {
  try {
    const res = await fetch(`${BASE_URL}/banners`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) return { success: true, message: "Tạo banner thành công!" };
    const json = await res.json();
    return { success: false, message: json.message || "Lỗi tạo banner." };
  } catch (error) {
    return { success: false, message: "Không thể kết nối đến server." };
  }
};

export const updateBanner = async (
  id: string,
  data: Partial<Banner>,
): Promise<{ success: boolean; message: string }> => {
  try {
    const res = await fetch(`${BASE_URL}/banners/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok)
      return { success: true, message: "Cập nhật banner thành công!" };
    const json = await res.json();
    return { success: false, message: json.message || "Lỗi cập nhật banner." };
  } catch (error) {
    return { success: false, message: "Không thể kết nối đến server." };
  }
};

export const deleteBanner = async (id: string): Promise<boolean> => {
  try {
    const res = await fetch(`${BASE_URL}/banners/${id}`, { method: "DELETE" });
    return res.ok;
  } catch (error) {
    console.error("Error deleting banner:", error);
    return false;
  }
};
