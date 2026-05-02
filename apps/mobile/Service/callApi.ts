export interface Product {
  _id: string;
  productId: string;
  name: string;
  description: string;
  basePrice: number;
  discountPercentage: number;
  category: string;
  manufacturer: string;
  images: string[];
  stockQuantity: number;
  stockStatus: "Instock" | "Preorder" | "Outofstock";
  countryOfOrigin: string;
  importStatus: "Imported" | "Domestic";
  warrantyLength?: string;
  tags: string[];
  specifications: Record<string, any>;
}

export interface Review {
  _id: string;
  user: {
    fullName: string;
    avatar?: string;
  };
  rating: number;
  comment: string;
  images?: string[];
  adminResponse?: {
    comment: string;
  };
  createdAt: string;
}

// Mock API functions
export const getProductById = async (id: string): Promise<Product> => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        _id: id,
        productId: "PROD-123",
        name: "Sản phẩm mẫu cao cấp",
        description: "Đây là mô tả chi tiết cho sản phẩm mẫu. Sản phẩm này có chất lượng tuyệt vời và tính năng hiện đại.",
        basePrice: 1500000,
        discountPercentage: 10,
        category: "Điện tử",
        manufacturer: "Apple",
        images: [
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop"
        ],
        stockQuantity: 50,
        stockStatus: "Instock",
        countryOfOrigin: "USA",
        importStatus: "Imported",
        warrantyLength: "12 tháng",
        tags: ["cao cấp", "mới", "hot"],
        specifications: {
          "Màn hình": "6.7 inch",
          "Chip": "A17 Pro",
          "Pin": "4422 mAh"
        }
      });
    }, 1000);
  });
};

export const getProductReviews = async (id: string): Promise<Review[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          _id: "rev-1",
          user: { fullName: "Nguyễn Văn A" },
          rating: 5,
          comment: "Sản phẩm rất tốt, đóng gói cẩn thận.",
          createdAt: new Date().toISOString()
        },
        {
          _id: "rev-2",
          user: { fullName: "Trần Thị B" },
          rating: 4,
          comment: "Giao hàng hơi chậm nhưng bù lại chất lượng ổn.",
          createdAt: new Date().toISOString()
        }
      ]);
    }, 800);
  });
};

export const createOrder = async (token: string, orderData: any): Promise<any> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        _id: "ORDER-" + Math.random().toString(36).substr(2, 9),
        ...orderData,
        createdAt: new Date().toISOString()
      });
    }, 1500);
  });
};
