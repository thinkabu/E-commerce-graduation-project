import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ImportStatus } from '../../../common/enums';

export type ProductDocument = HydratedDocument<Product>;

// --- CryptoPrice Subdocument ---
export class CryptoPrice {
  eth: number;
  lastUpdated: Date;
}

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Product {
  // ==========================================
  // Giữ nguyên từ mẫu ban đầu
  // ==========================================

  @Prop({
    required: [true, 'Tên sản phẩm là bắt buộc'],
    trim: true,
    maxlength: [255, 'Tên sản phẩm không quá 255 ký tự'],
  })
  name: string;

  @Prop({
    required: [true, 'Tên nhà sản xuất là bắt buộc'],
    trim: true,
    maxlength: 255,
  })
  manufacturer: string;

  @Prop({
    required: [true, 'Mã sản phẩm là bắt buộc'],
    unique: true,
    trim: true,
    uppercase: true, // Chuẩn hóa mã: 'IP15-PRO'
  })
  productId: string; // SKU chính

  @Prop({
    type: Types.ObjectId,
    ref: 'Category',
    required: [true, 'Danh mục là bắt buộc'],
  })
  categoryId: Types.ObjectId;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: [String], default: [] })
  images: string[]; // Cloudinary URLs

  @Prop({
    required: [true, 'Giá cơ bản là bắt buộc'],
    min: [0, 'Giá không được âm'],
  })
  basePrice: number;

  @Prop({
    type: String,
    enum: ['VND', 'USD'],
    default: 'VND',
  })
  currency: string;

  @Prop({
    default: 0,
    min: [0, 'Giảm giá không được âm'],
    max: [100, 'Giảm giá không quá 100%'],
  })
  discountPercentage: number;

  @Prop({ trim: true })
  description: string;

  @Prop({
    type: String,
    enum: Object.values(ImportStatus),
    default: ImportStatus.IMPORTED,
  })
  importStatus: ImportStatus;

  @Prop({
    required: [true, 'Quốc gia xuất xứ là bắt buộc'],
    trim: true,
    maxlength: 100,
  })
  countryOfOrigin: string;

  @Prop({ type: Date })
  releaseDate: Date;

  @Prop({ trim: true, maxlength: 50 })
  warrantyLength: string;

  @Prop({ type: Object, default: {} })
  specifications: Record<string, any>; // { processor: 'A16 Bionic', ram: '6GB', ... }

  // ==========================================
  // Bổ sung mới
  // ==========================================

  @Prop({
    required: [true, 'Slug là bắt buộc'],
    unique: true,
    trim: true,
    lowercase: true,
  })
  slug: string; // SEO-friendly URL: 'iphone-15-pro-max'

  @Prop({ default: false })
  hasVariants: boolean; // true = có biến thể (color, storage, ...)

  @Prop({ type: [String], default: [] })
  variantAttributes: string[]; // ['color', 'storage'] - tên thuộc tính biến thể

  @Prop({ default: 0, min: 0, max: 5 })
  averageRating: number; // Cache rating trung bình từ reviews

  @Prop({ default: 0, min: 0 })
  reviewCount: number; // Cache số lượng đánh giá

  @Prop({ default: 0, min: 0 })
  soldCount: number; // Đã bán (cho trending/ranking)

  @Prop({ default: 0, min: 0 })
  viewCount: number; // Lượt xem (cho AI behavior tracking)

  @Prop({ default: true })
  isActive: boolean; // Soft delete

  @Prop({ default: false })
  isFeatured: boolean; // Sản phẩm nổi bật

  @Prop({
    type: {
      eth: { type: Number },
      lastUpdated: { type: Date },
    },
  })
  cryptoPrice: CryptoPrice; // Giá ETH tính từ basePrice

  @Prop({ type: [Number], default: [] })
  embedding: number[]; // Vector embedding 1536D cho AI search
}

export const ProductSchema = SchemaFactory.createForClass(Product);

// --- Virtual: finalPrice ---
ProductSchema.virtual('finalPrice').get(function () {
  return this.basePrice * (1 - this.discountPercentage / 100);
});

// --- Indexes ---
ProductSchema.index({ productId: 1 }, { unique: true });
ProductSchema.index({ slug: 1 }, { unique: true });
ProductSchema.index({ categoryId: 1 });
ProductSchema.index({ basePrice: 1 });
ProductSchema.index({ tags: 1 });
ProductSchema.index({ averageRating: -1, soldCount: -1 }); // Popular products
ProductSchema.index({ isActive: 1, isFeatured: 1 }); // Featured & active products
ProductSchema.index(
  { name: 'text', description: 'text', tags: 'text' },
  {
    weights: { name: 10, tags: 5, description: 1 },
    name: 'product_text_search',
  },
); // Full-text search với trọng số
