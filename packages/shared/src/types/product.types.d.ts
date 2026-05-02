import { StockStatus, ImportStatus, Currency } from '../constants/enums';
export interface ICategory {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    image?: string;
    parentId?: string | null;
    level: number;
    isActive: boolean;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
}
export interface IProduct {
    _id: string;
    name: string;
    manufacturer: string;
    productId: string;
    categoryId: string;
    tags: string[];
    images: string[];
    basePrice: number;
    currency: Currency;
    discountPercentage: number;
    description?: string;
    importStatus: ImportStatus;
    countryOfOrigin: string;
    releaseDate?: string;
    warrantyLength?: string;
    specifications: Record<string, any>;
    slug: string;
    hasVariants: boolean;
    variantAttributes: string[];
    averageRating: number;
    reviewCount: number;
    soldCount: number;
    viewCount: number;
    isActive: boolean;
    isFeatured: boolean;
    cryptoPrice?: ICryptoPrice;
    embedding?: number[];
    finalPrice?: number;
    createdAt: string;
    updatedAt: string;
}
export interface ICryptoPrice {
    eth: number;
    lastUpdated: string;
}
export interface IProductVariant {
    _id: string;
    productId: string;
    sku: string;
    variantName: string;
    attributes: IVariantAttribute[];
    price: number;
    discountPercentage: number;
    images: string[];
    stockQuantity: number;
    stockStatus: StockStatus;
    isActive: boolean;
    sortOrder: number;
    finalPrice?: number;
    createdAt: string;
    updatedAt: string;
}
export interface IVariantAttribute {
    name: string;
    value: string;
}
//# sourceMappingURL=product.types.d.ts.map