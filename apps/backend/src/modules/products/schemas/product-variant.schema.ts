import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { StockStatus } from '../../../common/enums';

export type ProductVariantDocument = HydratedDocument<ProductVariant>;

// --- Variant Attribute Subdocument ---
export class VariantAttribute {
  name: string; // 'color', 'storage'
  value: string; // 'Đen', '128GB'
}

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class ProductVariant {
  @Prop({
    type: Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product ID là bắt buộc'],
  })
  productId: Types.ObjectId;

  @Prop({
    required: [true, 'SKU biến thể là bắt buộc'],
    unique: true,
    trim: true,
    uppercase: true, // 'IP15-BLK-128'
  })
  sku: string;

  @Prop({
    required: [true, 'Tên biến thể là bắt buộc'],
    trim: true,
  })
  variantName: string; // 'Đen - 128GB'

  @Prop({
    type: [{ name: { type: String, required: true }, value: { type: String, required: true } }],
    required: [true, 'Thuộc tính biến thể là bắt buộc'],
    _id: false,
  })
  attributes: VariantAttribute[];

  @Prop({
    required: [true, 'Giá biến thể là bắt buộc'],
    min: [0, 'Giá không được âm'],
  })
  price: number;

  @Prop({
    default: 0,
    min: [0, 'Giảm giá không được âm'],
    max: [100, 'Giảm giá không quá 100%'],
  })
  discountPercentage: number;

  @Prop({ type: [String], default: [] })
  images: string[]; // Ảnh riêng cho variant (ví dụ: ảnh màu đen)

  @Prop({
    default: 0,
    min: [0, 'Số lượng không được âm'],
  })
  stockQuantity: number;

  @Prop({
    type: String,
    enum: Object.values(StockStatus),
    default: StockStatus.INSTOCK,
  })
  stockStatus: StockStatus;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  sortOrder: number; // Thứ tự hiển thị variant
}

export const ProductVariantSchema =
  SchemaFactory.createForClass(ProductVariant);

// --- Virtual: finalPrice ---
ProductVariantSchema.virtual('finalPrice').get(function () {
  return this.price * (1 - this.discountPercentage / 100);
});

// --- Indexes ---
ProductVariantSchema.index({ sku: 1 }, { unique: true });
ProductVariantSchema.index({ productId: 1, isActive: 1 });
ProductVariantSchema.index({ productId: 1, stockStatus: 1 });
