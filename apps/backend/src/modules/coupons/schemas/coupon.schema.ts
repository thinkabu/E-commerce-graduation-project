import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { CouponDiscountType } from '../../../common/enums';

export type CouponDocument = HydratedDocument<Coupon>;

@Schema({ timestamps: true })
export class Coupon {
  @Prop({
    required: [true, 'Mã giảm giá là bắt buộc'],
    unique: true,
    uppercase: true,
    trim: true,
  })
  code: string; // 'SUMMER2026'

  @Prop({ trim: true })
  description: string;

  @Prop({
    type: String,
    enum: Object.values(CouponDiscountType),
    required: [true, 'Loại giảm giá là bắt buộc'],
  })
  discountType: CouponDiscountType; // PERCENTAGE hoặc FIXED_AMOUNT

  @Prop({
    required: [true, 'Giá trị giảm giá là bắt buộc'],
    min: [0, 'Giá trị giảm giá không được âm'],
  })
  discountValue: number; // 10 (%) hoặc 50000 (VND)

  @Prop({ default: 0, min: 0 })
  minOrderAmount: number; // Giá trị đơn tối thiểu để áp dụng

  @Prop({ min: 0 })
  maxDiscountAmount: number; // Giảm tối đa (cho PERCENTAGE)

  @Prop({ min: 0 })
  usageLimit: number; // Tổng lượt sử dụng tối đa

  @Prop({ default: 0, min: 0 })
  usedCount: number;

  @Prop({ default: 1, min: 1 })
  usageLimitPerUser: number; // Mỗi user dùng tối đa bao nhiêu lần

  @Prop({
    type: [{ type: Types.ObjectId, ref: 'Category' }],
    default: [],
  })
  applicableCategories: Types.ObjectId[]; // Áp dụng cho danh mục cụ thể

  @Prop({
    type: [{ type: Types.ObjectId, ref: 'Product' }],
    default: [],
  })
  applicableProducts: Types.ObjectId[]; // Áp dụng cho sản phẩm cụ thể

  @Prop({
    type: Date,
    required: [true, 'Ngày bắt đầu là bắt buộc'],
  })
  startDate: Date;

  @Prop({
    type: Date,
    required: [true, 'Ngày kết thúc là bắt buộc'],
  })
  endDate: Date;

  @Prop({ default: true })
  isActive: boolean;
}

export const CouponSchema = SchemaFactory.createForClass(Coupon);

// --- Indexes ---
CouponSchema.index({ code: 1 }, { unique: true });
CouponSchema.index({ startDate: 1, endDate: 1, isActive: 1 }); // Tìm coupon hợp lệ
