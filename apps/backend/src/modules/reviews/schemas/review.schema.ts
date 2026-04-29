import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ReviewDocument = HydratedDocument<Review>;

// --- AdminReply Subdocument ---
@Schema({ _id: false })
export class AdminReply {
  @Prop({ required: true, trim: true })
  content: string;

  @Prop({ type: Date, default: Date.now })
  repliedAt: Date;
}

export const AdminReplySchema = SchemaFactory.createForClass(AdminReply);

// --- Review Main Document ---
@Schema({ timestamps: true })
export class Review {
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
    type: Types.ObjectId,
    ref: 'Order',
    required: [true, 'Order ID là bắt buộc'], // Chỉ review khi đã mua hàng
  })
  orderId: Types.ObjectId;

  @Prop({
    required: [true, 'Đánh giá là bắt buộc'],
    min: [1, 'Đánh giá tối thiểu 1 sao'],
    max: [5, 'Đánh giá tối đa 5 sao'],
  })
  rating: number;

  @Prop({ trim: true, maxlength: 200 })
  title: string;

  @Prop({ trim: true, maxlength: 2000 })
  comment: string;

  @Prop({ type: [String], default: [] })
  images: string[]; // Ảnh đánh giá (Cloudinary URLs)

  @Prop({ default: true })
  isVerifiedPurchase: boolean;

  @Prop({ default: 0, min: 0 })
  helpfulCount: number; // Số lượt "thấy hữu ích"

  @Prop({ type: AdminReplySchema })
  adminReply: AdminReply; // Phản hồi từ shop/admin
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

// --- Indexes ---
ReviewSchema.index({ productId: 1, createdAt: -1 }); // Reviews theo sản phẩm, mới nhất trước
ReviewSchema.index({ userId: 1, productId: 1 }, { unique: true }); // Mỗi user chỉ review 1 lần/product
ReviewSchema.index({ rating: 1 });
ReviewSchema.index({ userId: 1, createdAt: -1 }); // Reviews của user
