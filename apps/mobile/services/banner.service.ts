import api from "./api";

export interface Banner {
  _id: string;
  title: string;
  subtitle?: string;
  image: string; // Cloudinary or static image URL
  link?: string;
  position: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
}

export const getBanners = async (isActive = true): Promise<Banner[]> => {
  try {
    const response = await api.get(`/banners?isActive=${isActive}`);
    const resData = response.data.data || response.data;
    // Banners service returns { items: Banner[], total: number }
    return resData.items || [];
  } catch (error) {
    console.error("Error fetching banners:", error);
    return [];
  }
};
