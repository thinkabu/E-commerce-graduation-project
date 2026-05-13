export interface ProductVariant {
  _id?: string;
  variantName: string;
  sku: string;
  price: number;
  stockQuantity: number;
  discountPercentage: number;
  attributes: { name: string; value: string }[];
  images?: string[];
  stockStatus?: string;
  sortOrder?: number;
}

export interface ProductSpec {
  key: string;
  value: string;
}

export interface ProductFormData {
  _id?: string;
  productId: string;
  name: string;
  manufacturer: string;
  description: string;
  categoryId: string;
  countryOfOrigin: string;
  tags: string[];
  basePrice: number;
  currency: string;
  discountPercentage: number;
  stockQuantity: number;
  stockStatus: string;
  importStatus: string;
  releaseDate: string;
  warrantyLength: string;
  isActive: boolean;
  isFeatured: boolean;
  images: any[]; // File[] for new uploads, string[] for existing URLs
  specs: ProductSpec[];
  variants: ProductVariant[];
}

export const defaultFormData: ProductFormData = {
  productId: "",
  name: "",
  manufacturer: "",
  description: "",
  categoryId: "",
  countryOfOrigin: "Việt Nam",
  tags: [],
  basePrice: 0,
  currency: "VND",
  discountPercentage: 0,
  stockQuantity: 0,
  stockStatus: "Instock",
  importStatus: "Imported",
  releaseDate: "",
  warrantyLength: "",
  isActive: true,
  isFeatured: false,
  images: [],
  specs: [],
  variants: [],
};
