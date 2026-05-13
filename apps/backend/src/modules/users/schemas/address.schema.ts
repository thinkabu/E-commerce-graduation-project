import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { AddressType } from '../../../common/enums';

export type AddressDocument = HydratedDocument<Address>;

// --- Location Info Subdocument ---
export class LocationInfo {
  code: number;
  name: string;
}

@Schema({ timestamps: true })
export class Address {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({
    required: [true, 'Tên người nhận là bắt buộc'],
    trim: true,
    maxlength: [100, 'Tên không quá 100 ký tự'],
  })
  fullName: string;

  @Prop({
    required: [true, 'Số điện thoại là bắt buộc'],
    trim: true,
  })
  phone: string;

  @Prop({
    type: { code: Number, name: String },
    required: [true, 'Tỉnh/Thành phố là bắt buộc'],
  })
  province: LocationInfo;

  @Prop({
    type: { code: Number, name: String },
    required: [true, 'Phường/Xã là bắt buộc'],
  })
  ward: LocationInfo;

  @Prop({
    required: [true, 'Địa chỉ cụ thể là bắt buộc'],
    trim: true,
  })
  street: string; // Số nhà, tên đường

  @Prop({
    type: String,
    enum: Object.values(AddressType),
    default: AddressType.HOME,
  })
  addressType: AddressType;

  @Prop({ default: false })
  isDefault: boolean;

  @Prop({ trim: true })
  note: string; // Ghi chú: "gần ngã tư...", "cổng sau"

  @Prop({ default: true })
  isActive: boolean; // Soft delete
}

export const AddressSchema = SchemaFactory.createForClass(Address);

// --- Indexes ---
AddressSchema.index({ userId: 1, isDefault: 1 });
AddressSchema.index({ userId: 1, isActive: 1 });
