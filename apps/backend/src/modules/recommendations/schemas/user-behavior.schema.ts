import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { BehaviorAction } from '../../../common/enums';

export type UserBehaviorDocument = HydratedDocument<UserBehavior>;

// --- Behavior Metadata Subdocument ---
@Schema({ _id: false })
export class BehaviorMetadata {
  @Prop()
  searchQuery: string; // Query tìm kiếm (cho SEARCH action)

  @Prop()
  duration: number; // Thời gian xem sản phẩm, tính bằng giây (cho VIEW action)

  @Prop()
  source: string; // Nguồn hành vi: 'home' | 'category' | 'search' | 'recommendation'

  @Prop()
  sessionId: string; // Session ID cho grouping phân tích
}

export const BehaviorMetadataSchema =
  SchemaFactory.createForClass(BehaviorMetadata);

// --- UserBehavior Main Document ---
@Schema({
  timestamps: false, // Dùng field timestamp riêng thay vì createdAt/updatedAt
  collection: 'user_behaviors', // Tên collection rõ ràng
})
export class UserBehavior {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID là bắt buộc'],
  })
  userId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product ID là bắt buộc'],
  })
  productId: Types.ObjectId;

  @Prop({
    type: String,
    enum: Object.values(BehaviorAction),
    required: [true, 'Loại hành vi là bắt buộc'],
  })
  actionType: BehaviorAction;

  @Prop({ type: BehaviorMetadataSchema, default: {} })
  metadata: BehaviorMetadata;

  @Prop({ default: 1.0 })
  weight: number; // Trọng số cho Collaborative Filtering

  @Prop({
    type: Date,
    default: Date.now,
    index: true,
  })
  timestamp: Date;
}

export const UserBehaviorSchema =
  SchemaFactory.createForClass(UserBehavior);

// --- Indexes ---
UserBehaviorSchema.index({ userId: 1, timestamp: -1 }); // Lịch sử hành vi user
UserBehaviorSchema.index({ productId: 1, actionType: 1 }); // Thống kê theo sản phẩm
UserBehaviorSchema.index({ userId: 1, productId: 1, actionType: 1 }); // Tra cứu hành vi cụ thể
UserBehaviorSchema.index({ actionType: 1, timestamp: -1 }); // Analytics

// TTL Index: Tự động xóa sau 180 ngày (15552000 giây)
UserBehaviorSchema.index(
  { timestamp: 1 },
  { expireAfterSeconds: 15552000 },
);
