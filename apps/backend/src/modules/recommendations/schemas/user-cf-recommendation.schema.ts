import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserCFRecommendationDocument = HydratedDocument<UserCFRecommendation>;

@Schema({ _id: false })
export class CFRecommendedProduct {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ type: Number, required: true })
  score: number; // Dự đoán điểm tương tác/đánh giá từ mô hình Collaborative Filtering
}

const CFRecommendedProductSchema = SchemaFactory.createForClass(CFRecommendedProduct);

@Schema({
  timestamps: true,
  collection: 'user_cf_recommendations',
})
export class UserCFRecommendation {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  @Prop({ type: [CFRecommendedProductSchema], default: [] })
  recommendations: CFRecommendedProduct[]; // Top-N gợi ý từ thuật toán CF (ALS / Item-Item / User-Item)

  @Prop({ type: String, default: 'als_v1' })
  modelVersion: string; // Phiên bản mô hình CF đã tính toán
}

export const UserCFRecommendationSchema = SchemaFactory.createForClass(UserCFRecommendation);
UserCFRecommendationSchema.index({ userId: 1 }, { unique: true });
