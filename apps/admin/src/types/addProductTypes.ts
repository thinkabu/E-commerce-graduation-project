export interface ProductVariant {
  _id?: string;
  variantName: string;
  sku: string;
  price: number;
  stockQuantity: number;
  discountPercentage?: number;
  attributes: { name: string; value: string }[];
}

export interface ProductSpec {
  key: string;
  value: string;
}

export interface ProductFormData {
  id?: string;
  name: string;
  description: string;
  categoryId: string;
  category?: string;
  manufacturer?: string;
  origin?: string;
  tags: string[];
  price: number;
  basePrice: number;
  currency: string;
  discount: number;
  stock: number;
  stockQuantity: number;
  stockStatus: string;
  importStatus: string;
  releaseDate: string;
  warrantyLength: string;
  isActive?: boolean;
  images: any[]; // File[] for new uploads, string[] for existing URLs
  specs: ProductSpec[];
  variants: ProductVariant[];
}

export const defaultFormData: ProductFormData = {
  name: "",
  description: "",
  categoryId: "",
  category: "",
  manufacturer: "",
  origin: "vietnam",
  tags: [],
  price: 0,
  basePrice: 0,
  currency: "VND",
  discount: 0,
  stock: 0,
  stockQuantity: 0,
  stockStatus: "Instock",
  importStatus: "Imported",
  releaseDate: "",
  warrantyLength: "",
  isActive: true,
  images: [],
  specs: [],
  variants: [],
};
