export interface Product {
  _id: string;
  name: string;
  manufacturer: string;
  productId: string;
  categoryId: string | { _id: string; name: string; slug: string };
  slug: string;
  tags: string[];
  images: string[];
  basePrice: number;
  currency: string;
  discountPercentage: number;
  description: string;
  importStatus: string;
  countryOfOrigin: string;
  releaseDate: string;
  warrantyLength: string;
  specifications: Record<string, any>;
  hasVariants: boolean;
  variantAttributes: string[];
  averageRating: number;
  reviewCount: number;
  soldCount: number;
  viewCount: number;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}
