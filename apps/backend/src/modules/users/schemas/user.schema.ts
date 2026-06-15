import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { UserRole } from '../../../common/enums';

export type UserDocument = HydratedDocument<User>;

// --- AI Preferences Subdocument ---
export class AiPreferences {
  preferredCategories: Types.ObjectId[];
  priceRange: {
    min: number;
    max: number;
  };
  preferredBrands: string[];
}

@Schema({ timestamps: true })
export class User {
  @Prop({
    required: [true, 'Email là bắt buộc'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ'],
  })
  email: string;

  @Prop({
    required: [true, 'Mật khẩu là bắt buộc'],
    select: false, // Không trả về khi query mặc định
  })
  passwordHash: string;

  @Prop({
    required: [true, 'Họ tên là bắt buộc'],
    trim: true,
    maxlength: [100, 'Họ tên không quá 100 ký tự'],
  })
  fullName: string;

  @Prop({ trim: true })
  phone: string;

  @Prop() // Cloudinary URL
  avatar: string;

  @Prop({
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.USER,
  })
  role: UserRole;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({
    unique: true,
    sparse: true,
    trim: true,
  })
  walletAddress: string; // Địa chỉ ví MetaMask

  @Prop({ type: [String], default: [] })
  expoPushTokens: string[]; // Expo Push Tokens (hỗ trợ nhiều thiết bị)

  @Prop({ type: Types.ObjectId, ref: 'Address' })
  defaultAddressId: Types.ObjectId;

  @Prop({
    type: {
      preferredCategories: [{ type: Types.ObjectId, ref: 'Category' }],
      priceRange: {
        min: { type: Number, default: 0 },
        max: { type: Number, default: 0 },
      },
      preferredBrands: [String],
    },
    default: {
      preferredCategories: [],
      priceRange: { min: 0, max: 0 },
      preferredBrands: [],
    },
  })
  aiPreferences: AiPreferences;

  @Prop({ select: false })
  refreshToken: string;

  @Prop({
    type: {
      manageProducts: { type: Boolean, default: false },
      manageOrders: { type: Boolean, default: false },
      manageUsers: { type: Boolean, default: false },
      viewReports: { type: Boolean, default: false },
      manageCoupons: { type: Boolean, default: false },
    },
    default: {
      manageProducts: false,
      manageOrders: false,
      manageUsers: false,
      viewReports: false,
      manageCoupons: false,
    },
  })
  permissions: {
    manageProducts: boolean;
    manageOrders: boolean;
    manageUsers: boolean;
    viewReports: boolean;
    manageCoupons: boolean;
  };
}

export const UserSchema = SchemaFactory.createForClass(User);

// --- Indexes ---
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ walletAddress: 1 }, { unique: true, sparse: true });
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });
