// --- User Types ---
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export interface IUser {
  id: string;
  email: string;
  fullName: string;
  avatar?: string;
  role: UserRole;
  createdAt: string;
}

// --- Product Types ---
export interface IProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  stock: number;
  embedding?: number[]; // Dùng cho Vector Search
  averageRating: number;
  reviewCount: number;
  createdAt: string;
}

// --- Recommendation Types ---
export interface IRecommendationResult {
  productId: string;
  score: number; // Điểm ranking từ AI
  reason?: string; // Lý do gợi ý (CF, Content-based, etc.)
}

// --- API Response Types ---
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: any;
}
