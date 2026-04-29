import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { NotificationType } from '../../../common/enums';

export type NotificationDocument = HydratedDocument<Notification>;

// --- NotificationData Subdocument ---
@Schema({ _id: false })
export class NotificationData {
  @Prop({ type: Types.ObjectId, ref: 'Order' })
  orderId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Product' })
  productId: Types.ObjectId;

  @Prop()
  txHash: string; // Cho blockchain notifications

  @Prop({ type: Types.ObjectId, ref: 'Conversation' })
  conversationId: Types.ObjectId; // Cho chat notifications

  @Prop()
  deepLink: string; // Deep link vào mobile app
}

export const NotificationDataSchema =
  SchemaFactory.createForClass(NotificationData);

// --- Notification Main Document ---
@Schema({ timestamps: true })
export class Notification {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID là bắt buộc'],
  })
  userId: Types.ObjectId;

  @Prop({
    required: [true, 'Tiêu đề là bắt buộc'],
    trim: true,
    maxlength: 200,
  })
  title: string;

  @Prop({
    required: [true, 'Nội dung là bắt buộc'],
    trim: true,
    maxlength: 500,
  })
  body: string;

  @Prop({
    type: String,
    enum: Object.values(NotificationType),
    required: [true, 'Loại thông báo là bắt buộc'],
  })
  type: NotificationType;

  @Prop({ type: NotificationDataSchema, default: {} })
  data: NotificationData;

  @Prop({ default: false })
  isRead: boolean;

  @Prop({ type: Date })
  readAt: Date;
}

export const NotificationSchema =
  SchemaFactory.createForClass(Notification);

// --- Indexes ---
NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 }); // Thông báo chưa đọc, mới nhất trước
NotificationSchema.index({ userId: 1, createdAt: -1 }); // Tất cả thông báo của user

// TTL Index: Tự động xóa sau 90 ngày (7776000 giây)
NotificationSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 7776000 },
);
