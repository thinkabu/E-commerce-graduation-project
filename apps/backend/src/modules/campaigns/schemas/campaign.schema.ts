import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CampaignDocument = HydratedDocument<Campaign>;

export type CampaignTargetType = 'ALL_USERS' | 'SPECIFIC_USERS';
export type CampaignStatus = 'DRAFT' | 'SENT' | 'FAILED' | 'SCHEDULED';

@Schema({ timestamps: true })
export class Campaign {
  @Prop({
    required: [true, 'Tiêu đề campaign là bắt buộc'],
    trim: true,
    maxlength: [200, 'Tiêu đề không quá 200 ký tự'],
  })
  title: string;

  @Prop({
    required: [true, 'Nội dung là bắt buộc'],
    trim: true,
    maxlength: [500, 'Nội dung không quá 500 ký tự'],
  })
  body: string;

  @Prop({
    type: String,
    enum: ['ALL_USERS', 'SPECIFIC_USERS'],
    default: 'ALL_USERS',
  })
  targetType: CampaignTargetType;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  targetUserIds: Types.ObjectId[]; // Chỉ dùng khi targetType = 'SPECIFIC_USERS'

  @Prop({ type: Object, default: {} })
  data: Record<string, any>; // Deep link, productId... đính kèm trong push data

  @Prop({
    type: String,
    enum: ['DRAFT', 'SENT', 'FAILED', 'SCHEDULED'],
    default: 'DRAFT',
  })
  status: CampaignStatus;

  @Prop({ default: 0 })
  sentCount: number; // Số thiết bị (token) đã nhận push

  @Prop({ type: Date })
  sentAt: Date; // Thời điểm đã gửi thực tế

  @Prop({ type: Date })
  scheduledAt?: Date; // Thời điểm đặt lịch gửi

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: [true, 'Admin ID là bắt buộc'],
  })
  createdBy: Types.ObjectId;
}

export const CampaignSchema = SchemaFactory.createForClass(Campaign);

// --- Indexes ---
CampaignSchema.index({ status: 1, createdAt: -1 });
CampaignSchema.index({ createdBy: 1 });
