import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type WishlistDocument = HydratedDocument<Wishlist>;

@Schema({ timestamps: true })
export class Wishlist {
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

  @Prop({ type: Date, default: Date.now })
  addedAt: Date;

  @Prop({ trim: true })
  note: string; // Ghi chú cá nhân: 'Mua khi giảm giá'
}

export const WishlistSchema = SchemaFactory.createForClass(Wishlist);

// --- Indexes ---
WishlistSchema.index({ userId: 1, productId: 1 }, { unique: true }); // Mỗi user chỉ wishlist 1 product 1 lần
WishlistSchema.index({ userId: 1, addedAt: -1 }); // Danh sách wishlist mới nhất
