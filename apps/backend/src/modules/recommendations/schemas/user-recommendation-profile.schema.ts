import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserRecommendationProfileDocument = HydratedDocument<UserRecommendationProfile>;

@Schema({ _id: false })
export class CategoryPreference {
  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  categoryId: Types.ObjectId;

  @Prop({ type: Number, required: true })
  score: number; // Điểm số ưa thích được tổng hợp
}

const CategoryPreferenceSchema = SchemaFactory.createForClass(CategoryPreference);

@Schema({ _id: false })
export class BrandPreference {
  @Prop({ type: String, required: true })
  brand: string;

  @Prop({ type: Number, required: true })
  score: number; // Điểm số thương hiệu được tổng hợp
}

const BrandPreferenceSchema = SchemaFactory.createForClass(BrandPreference);

@Schema({
  timestamps: true,
  collection: 'user_recommendation_profiles',
})
export class UserRecommendationProfile {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  @Prop({ type: [CategoryPreferenceSchema], default: [] })
  preferredCategories: CategoryPreference[]; // Các danh mục sản phẩm yêu thích nhất

  @Prop({ type: [BrandPreferenceSchema], default: [] })
  preferredBrands: BrandPreference[]; // Các thương hiệu yêu thích nhất

  @Prop({
    type: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
      avg: { type: Number, default: 0 },
    },
    default: { min: 0, max: 0, avg: 0 },
  })
  pricePreference: {
    min: number;
    max: number;
    avg: number; // Khoảng giá và giá trung bình các sản phẩm đã tương tác
  };

  @Prop({
    type: {
      totalViews: { type: Number, default: 0 },
      totalCarts: { type: Number, default: 0 },
      totalPurchases: { type: Number, default: 0 },
      lastActiveTime: { type: Date },
    },
    default: { totalViews: 0, totalCarts: 0, totalPurchases: 0, lastActiveTime: null },
  })
  activityMetrics: {
    totalViews: number;
    totalCarts: number;
    totalPurchases: number;
    lastActiveTime: Date;
  };
}

export const UserRecommendationProfileSchema = SchemaFactory.createForClass(UserRecommendationProfile);
UserRecommendationProfileSchema.index({ userId: 1 }, { unique: true });
