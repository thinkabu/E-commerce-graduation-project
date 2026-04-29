import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Currency,
} from '../../../common/enums';

export type OrderDocument = HydratedDocument<Order>;

// --- ProductSnapshot Subdocument ---
@Schema({ _id: false })
export class ProductSnapshot {
  @Prop({ required: true })
  name: string;

  @Prop()
  image: string;

  @Prop({ required: true })
  productId: string; // SKU

  @Prop()
  variantName: string;

  @Prop()
  variantSku: string;

  @Prop({
    type: [{ name: String, value: String }],
    default: [],
    _id: false,
  })
  attributes: Array<{ name: string; value: string }>;
}

export const ProductSnapshotSchema =
  SchemaFactory.createForClass(ProductSnapshot);

// --- OrderItem Subdocument ---
@Schema({ _id: true })
export class OrderItem {
  @Prop({
    type: Types.ObjectId,
    ref: 'Product',
    required: true,
  })
  productId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'ProductVariant' })
  variantId: Types.ObjectId;

  @Prop({ type: ProductSnapshotSchema, required: true })
  productSnapshot: ProductSnapshot; // Snapshot tại thời điểm mua

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ required: true, min: 0 })
  unitPrice: number;

  @Prop({ required: true, min: 0 })
  totalPrice: number; // unitPrice * quantity
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

// --- StatusHistory Subdocument ---
@Schema({ _id: false })
export class StatusHistory {
  @Prop({ required: true })
  status: string;

  @Prop({ type: Date, default: Date.now })
  changedAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  changedBy: Types.ObjectId;

  @Prop()
  note: string;
}

export const StatusHistorySchema =
  SchemaFactory.createForClass(StatusHistory);

// --- ShippingAddressSnapshot Subdocument ---
@Schema({ _id: false })
export class ShippingAddressSnapshot {
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  province: string;

  @Prop({ required: true })
  district: string;

  @Prop({ required: true })
  ward: string;

  @Prop({ required: true })
  street: string;

  @Prop()
  note: string;
}

export const ShippingAddressSnapshotSchema = SchemaFactory.createForClass(
  ShippingAddressSnapshot,
);

// --- Order Main Document ---
@Schema({ timestamps: true })
export class Order {
  @Prop({
    required: [true, 'Mã đơn hàng là bắt buộc'],
    unique: true,
  })
  orderId: string; // 'ORD-A1B2C3'

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID là bắt buộc'],
  })
  userId: Types.ObjectId;

  @Prop({ type: [OrderItemSchema], required: true })
  items: OrderItem[];

  @Prop({ type: Types.ObjectId, ref: 'Address' })
  shippingAddressId: Types.ObjectId;

  @Prop({ type: ShippingAddressSnapshotSchema, required: true })
  shippingAddressSnapshot: ShippingAddressSnapshot;

  @Prop({ required: true, min: 0 })
  subtotal: number; // Tổng tiền hàng

  @Prop({ default: 0, min: 0 })
  shippingFee: number;

  @Prop({ default: 0, min: 0 })
  discount: number; // Giảm giá từ coupon

  @Prop({ required: true, min: 0 })
  totalAmount: number; // subtotal + shippingFee - discount

  @Prop({
    type: String,
    enum: Object.values(Currency),
    default: Currency.VND,
  })
  currency: Currency;

  @Prop({ type: Types.ObjectId, ref: 'Coupon' })
  couponId: Types.ObjectId;

  @Prop({
    type: String,
    enum: Object.values(PaymentMethod),
    required: [true, 'Phương thức thanh toán là bắt buộc'],
  })
  paymentMethod: PaymentMethod;

  @Prop({
    type: String,
    enum: Object.values(PaymentStatus),
    default: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;

  @Prop({
    type: String,
    enum: Object.values(OrderStatus),
    default: OrderStatus.PENDING,
  })
  orderStatus: OrderStatus;

  @Prop({ type: [StatusHistorySchema], default: [] })
  statusHistory: StatusHistory[];

  @Prop({ trim: true })
  note: string; // Ghi chú đơn hàng
}

export const OrderSchema = SchemaFactory.createForClass(Order);

// --- Indexes ---
OrderSchema.index({ orderId: 1 }, { unique: true });
OrderSchema.index({ userId: 1, createdAt: -1 }); // Lịch sử đơn hàng user
OrderSchema.index({ orderStatus: 1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ createdAt: -1 });
