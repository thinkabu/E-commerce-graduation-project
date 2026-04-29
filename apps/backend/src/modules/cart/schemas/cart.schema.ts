import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CartDocument = HydratedDocument<Cart>;

// --- CartItem Subdocument ---
@Schema({ _id: true, timestamps: false })
export class CartItem {
  @Prop({
    type: Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product ID là bắt buộc'],
  })
  productId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'ProductVariant' })
  variantId: Types.ObjectId; // Variant đã chọn

  @Prop({
    required: [true, 'Số lượng là bắt buộc'],
    min: [1, 'Số lượng tối thiểu là 1'],
  })
  quantity: number;

  @Prop({ type: Date, default: Date.now })
  addedAt: Date;
}

export const CartItemSchema = SchemaFactory.createForClass(CartItem);

// --- Cart Main Document ---
@Schema({ timestamps: true })
export class Cart {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true, // Mỗi user chỉ có 1 cart
  })
  userId: Types.ObjectId;

  @Prop({ type: [CartItemSchema], default: [] })
  items: CartItem[];
}

export const CartSchema = SchemaFactory.createForClass(Cart);

// --- Indexes ---
CartSchema.index({ userId: 1 }, { unique: true });
