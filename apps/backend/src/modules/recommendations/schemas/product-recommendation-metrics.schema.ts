import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ProductRecommendationMetricsDocument = HydratedDocument<ProductRecommendationMetrics>;

@Schema({
  timestamps: true,
  collection: 'product_recommendation_metrics',
})
export class ProductRecommendationMetrics {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true, unique: true })
  productId: Types.ObjectId;

  @Prop({ type: Number, default: 0 })
  viewCount30d: number;

  @Prop({ type: Number, default: 0 })
  clickCount30d: number;

  @Prop({ type: Number, default: 0 })
  cartCount30d: number;

  @Prop({ type: Number, default: 0 })
  purchaseCount30d: number;

  @Prop({ type: Number, default: 0 })
  ctr: number; // Click-Through Rate = clickCount30d / viewCount30d (nếu viewCount30d > 0)

  @Prop({ type: Number, default: 0 })
  cvr: number; // Conversion Rate = purchaseCount30d / clickCount30d (nếu clickCount30d > 0)

  @Prop({ type: Number, default: 0 })
  popularityScore: number; // Tổng hợp trọng số của hành vi: view + cart * 5 + purchase * 10

  @Prop({ type: Number, default: 0 })
  averageRating: number;

  @Prop({ type: Number, default: 0 })
  reviewCount: number;
}

export const ProductRecommendationMetricsSchema = SchemaFactory.createForClass(ProductRecommendationMetrics);
ProductRecommendationMetricsSchema.index({ productId: 1 }, { unique: true });
ProductRecommendationMetricsSchema.index({ popularityScore: -1 }); // Tối ưu khi cần lấy danh sách sản phẩm phổ biến làm fallback
