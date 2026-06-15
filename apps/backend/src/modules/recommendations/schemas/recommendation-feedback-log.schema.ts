import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type RecommendationFeedbackLogDocument = HydratedDocument<RecommendationFeedbackLog>;

@Schema({ _id: false })
export class RecommendedItemLog {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ type: Number, required: true })
  position: number; // Vị trí hiển thị bắt đầu từ 0

  @Prop({ type: Number })
  score: number; // Điểm xếp hạng AI
}

const RecommendedItemLogSchema = SchemaFactory.createForClass(RecommendedItemLog);

@Schema({
  timestamps: { createdAt: true, updatedAt: false }, // Chỉ cần thời điểm ghi nhận
  collection: 'recommendation_feedback_logs',
})
export class RecommendationFeedbackLog {
  @Prop({ type: Types.ObjectId, ref: 'User', index: true, required: false })
  userId?: Types.ObjectId;

  @Prop({ type: String, required: true, index: true })
  sessionId: string;

  @Prop({ type: String, required: true })
  recommendationType: string; // 'home_feed' | 'similar_products' | 'cart_upsell'

  @Prop({ type: String, required: true })
  algorithmVersion: string; // Phiên bản mô hình (ví dụ: 'hybrid_v1', 'cf_only', 'vector_only') để làm A/B Test

  @Prop({ type: [RecommendedItemLogSchema], required: true })
  recommendedProducts: RecommendedItemLog[]; // Danh sách sản phẩm được đề xuất hiển thị

  @Prop({
    type: [
      {
        productId: { type: Types.ObjectId, ref: 'Product' },
        clickedAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  })
  clickedProducts: {
    productId: Types.ObjectId;
    clickedAt: Date;
  }[];

  @Prop({
    type: [
      {
        productId: { type: Types.ObjectId, ref: 'Product' },
        purchasedAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  })
  purchasedProducts: {
    productId: Types.ObjectId;
    purchasedAt: Date;
  }[];
}

export const RecommendationFeedbackLogSchema = SchemaFactory.createForClass(RecommendationFeedbackLog);

RecommendationFeedbackLogSchema.index({ sessionId: 1 });
RecommendationFeedbackLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // Tự động xóa sau 90 ngày (7776000 giây)
