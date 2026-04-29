import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { MessageType } from '../../../common/enums';

export type MessageDocument = HydratedDocument<Message>;

// --- ReadReceipt Subdocument ---
@Schema({ _id: false })
export class ReadReceipt {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  userId: Types.ObjectId;

  @Prop({ type: Date, default: Date.now })
  readAt: Date;
}

export const ReadReceiptSchema =
  SchemaFactory.createForClass(ReadReceipt);

// --- Attachment Subdocument ---
@Schema({ _id: false })
export class Attachment {
  @Prop({ required: true })
  url: string; // Cloudinary URL

  @Prop({
    type: String,
    enum: ['image', 'file'],
    default: 'image',
  })
  type: string;

  @Prop()
  fileName: string;

  @Prop()
  fileSize: number; // bytes
}

export const AttachmentSchema = SchemaFactory.createForClass(Attachment);

// --- Message Main Document ---
@Schema({ timestamps: true })
export class Message {
  @Prop({
    type: Types.ObjectId,
    ref: 'Conversation',
    required: [true, 'Conversation ID là bắt buộc'],
  })
  conversationId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: [true, 'Sender ID là bắt buộc'],
  })
  senderId: Types.ObjectId;

  @Prop({
    type: String,
    enum: Object.values(MessageType),
    default: MessageType.TEXT,
  })
  messageType: MessageType;

  @Prop({ trim: true, maxlength: 5000 })
  content: string; // Nội dung text

  @Prop({ type: [AttachmentSchema], default: [] })
  attachments: Attachment[]; // Ảnh/file đính kèm

  @Prop({ type: Types.ObjectId, ref: 'Product' })
  productRef: Types.ObjectId; // Khi gửi PRODUCT_CARD

  @Prop({ type: Types.ObjectId, ref: 'Order' })
  orderRef: Types.ObjectId; // Khi gửi ORDER_CARD

  @Prop({ type: [ReadReceiptSchema], default: [] })
  readBy: ReadReceipt[]; // Theo dõi đã đọc

  @Prop({ default: false })
  isDeleted: boolean; // Soft delete (thu hồi tin nhắn)

  @Prop({ type: Date })
  deletedAt: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

// --- Indexes ---
MessageSchema.index({ conversationId: 1, createdAt: 1 }); // Tin nhắn theo thứ tự thời gian
MessageSchema.index({ conversationId: 1, createdAt: -1 }); // Tin nhắn mới nhất
MessageSchema.index({ senderId: 1 });
