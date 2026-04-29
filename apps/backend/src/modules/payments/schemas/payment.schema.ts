import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { PaymentMethod, PaymentStatus, Currency } from '../../../common/enums';

export type PaymentDocument = HydratedDocument<Payment>;

// --- BankingInfo Subdocument ---
@Schema({ _id: false })
export class BankingInfo {
  @Prop()
  bankName: string;

  @Prop()
  accountNumber: string;

  @Prop()
  transactionId: string;
}

export const BankingInfoSchema = SchemaFactory.createForClass(BankingInfo);

// --- CryptoPaymentInfo Subdocument ---
@Schema({ _id: false })
export class CryptoPaymentInfo {
  @Prop()
  txHash: string; // Transaction hash trên blockchain

  @Prop()
  fromAddress: string; // Ví gửi (user)

  @Prop()
  toAddress: string; // Ví nhận (shop/contract)

  @Prop()
  networkId: number; // Chain ID

  @Prop()
  amountInWei: string; // Số tiền gốc dạng Wei (BigNumber string)

  @Prop()
  amountInEth: number; // Số tiền dạng ETH

  @Prop()
  exchangeRate: number; // Tỷ giá VND/ETH tại thời điểm thanh toán

  @Prop({ type: Date })
  confirmedAt: Date; // Thời gian xác nhận trên blockchain

  @Prop()
  blockNumber: number;
}

export const CryptoPaymentInfoSchema =
  SchemaFactory.createForClass(CryptoPaymentInfo);

// --- Payment Main Document ---
@Schema({ timestamps: true })
export class Payment {
  @Prop({
    type: Types.ObjectId,
    ref: 'Order',
    required: true,
    unique: true, // Mỗi order chỉ có 1 payment
  })
  orderId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  userId: Types.ObjectId;

  @Prop({
    type: String,
    enum: Object.values(PaymentMethod),
    required: [true, 'Phương thức thanh toán là bắt buộc'],
  })
  method: PaymentMethod;

  @Prop({
    type: String,
    enum: Object.values(PaymentStatus),
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Prop({
    required: [true, 'Số tiền là bắt buộc'],
    min: [0, 'Số tiền không được âm'],
  })
  amount: number;

  @Prop({
    type: String,
    enum: Object.values(Currency),
    required: true,
  })
  currency: Currency;

  @Prop({ type: BankingInfoSchema })
  bankingInfo: BankingInfo; // Cho thanh toán banking

  @Prop({ type: CryptoPaymentInfoSchema })
  cryptoInfo: CryptoPaymentInfo; // Cho thanh toán crypto

  @Prop({ type: Date })
  paidAt: Date;

  @Prop()
  failReason: string;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

// --- Indexes ---
PaymentSchema.index({ orderId: 1 }, { unique: true });
PaymentSchema.index({ userId: 1, createdAt: -1 });
PaymentSchema.index(
  { 'cryptoInfo.txHash': 1 },
  { unique: true, sparse: true }, // sparse: chỉ index khi có txHash
);
PaymentSchema.index({ status: 1 });
