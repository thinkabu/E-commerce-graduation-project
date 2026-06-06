import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BannerDocument = HydratedDocument<Banner>;

@Schema({ timestamps: true })
export class Banner {
  @Prop({
    required: [true, 'Tiêu đề banner là bắt buộc'],
    trim: true,
    maxlength: [200, 'Tiêu đề không quá 200 ký tự'],
  })
  title: string;

  @Prop({ trim: true })
  subtitle: string;

  @Prop({
    required: [true, 'Hình ảnh banner là bắt buộc'],
    trim: true,
  })
  image: string; // Cloudinary URL

  @Prop({ trim: true })
  link: string; // Deep link hoặc URL điều hướng

  @Prop({ default: 0, min: 0 })
  position: number; // Thứ tự hiển thị (nhỏ hơn = ưu tiên cao hơn)

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Date })
  startDate: Date;

  @Prop({ type: Date })
  endDate: Date;
}

export const BannerSchema = SchemaFactory.createForClass(Banner);

// --- Indexes ---
BannerSchema.index({ position: 1, isActive: 1 });
BannerSchema.index({ startDate: 1, endDate: 1 });
