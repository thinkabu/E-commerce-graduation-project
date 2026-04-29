import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ConversationType, ConversationStatus } from '../../../common/enums';

export type ConversationDocument = HydratedDocument<Conversation>;

// --- Participant Subdocument ---
@Schema({ _id: false })
export class Participant {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  userId: Types.ObjectId;

  @Prop({
    type: String,
    enum: ['buyer', 'seller', 'admin'],
    required: true,
  })
  role: string;

  @Prop({ type: Date, default: Date.now })
  joinedAt: Date;

  @Prop({ default: true })
  isActive: boolean; // Đã rời cuộc chat hay chưa
}

export const ParticipantSchema =
  SchemaFactory.createForClass(Participant);

// --- LastMessage Subdocument (cache) ---
@Schema({ _id: false })
export class LastMessage {
  @Prop({ trim: true })
  content: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  senderId: Types.ObjectId;

  @Prop({ type: Date })
  sentAt: Date;

  @Prop()
  type: string; // MessageType
}

export const LastMessageSchema =
  SchemaFactory.createForClass(LastMessage);

// --- Conversation Main Document ---
@Schema({ timestamps: true })
export class Conversation {
  @Prop({ type: [ParticipantSchema], required: true })
  participants: Participant[];

  @Prop({
    type: String,
    enum: Object.values(ConversationType),
    required: [true, 'Loại cuộc hội thoại là bắt buộc'],
  })
  type: ConversationType;

  @Prop({ type: Types.ObjectId, ref: 'Order' })
  relatedOrder: Types.ObjectId; // Chat liên quan đến đơn hàng

  @Prop({ type: Types.ObjectId, ref: 'Product' })
  relatedProduct: Types.ObjectId; // Chat liên quan đến sản phẩm

  @Prop({ type: LastMessageSchema })
  lastMessage: LastMessage; // Cache tin nhắn mới nhất (denormalization)

  @Prop({
    type: Map,
    of: Number,
    default: new Map(),
  })
  unreadCount: Map<string, number>; // { "userId1": 3, "userId2": 0 }

  @Prop({
    type: String,
    enum: Object.values(ConversationStatus),
    default: ConversationStatus.ACTIVE,
  })
  status: ConversationStatus;

  @Prop({ type: Date })
  resolvedAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  resolvedBy: Types.ObjectId;
}

export const ConversationSchema =
  SchemaFactory.createForClass(Conversation);

// --- Indexes ---
ConversationSchema.index({ 'participants.userId': 1, updatedAt: -1 }); // Danh sách chat của user, mới nhất trước
ConversationSchema.index({ status: 1 });
ConversationSchema.index({ relatedOrder: 1 }); // Tìm chat theo đơn hàng
ConversationSchema.index({ relatedProduct: 1 }); // Tìm chat theo sản phẩm
