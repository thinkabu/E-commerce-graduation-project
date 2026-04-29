import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { CryptoTxStatus } from '../../../common/enums';

export type CryptoTransactionDocument = HydratedDocument<CryptoTransaction>;

@Schema({ timestamps: true })
export class CryptoTransaction {
  @Prop({
    required: [true, 'Transaction hash là bắt buộc'],
    unique: true,
  })
  txHash: string; // '0x1234abcd...'

  @Prop({ type: Types.ObjectId, ref: 'Order' })
  orderId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: [true, 'Địa chỉ gửi là bắt buộc'] })
  fromAddress: string; // Ví user

  @Prop({ required: [true, 'Địa chỉ nhận là bắt buộc'] })
  toAddress: string; // Ví smart contract

  @Prop({ required: [true, 'Số tiền Wei là bắt buộc'] })
  amountInWei: string; // BigNumber string

  @Prop()
  amountInEth: number;

  @Prop()
  amountInFiat: number; // Giá trị VND tại thời điểm giao dịch

  @Prop({
    type: String,
    enum: ['VND', 'USD'],
    default: 'VND',
  })
  fiatCurrency: string;

  @Prop()
  exchangeRate: number; // Tỷ giá VND/ETH

  @Prop()
  gasUsed: number;

  @Prop()
  gasPrice: string; // Wei

  @Prop()
  networkId: number; // 1 = mainnet, 11155111 = sepolia, 31337 = hardhat

  @Prop()
  networkName: string; // 'mainnet', 'sepolia', 'hardhat-local'

  @Prop()
  blockNumber: number;

  @Prop({ type: Date })
  blockTimestamp: Date;

  @Prop({
    type: String,
    enum: Object.values(CryptoTxStatus),
    default: CryptoTxStatus.PENDING,
  })
  status: CryptoTxStatus;

  @Prop({ default: 0 })
  confirmations: number;

  @Prop()
  contractAddress: string; // Địa chỉ smart contract

  @Prop()
  methodName: string; // Tên function đã gọi: 'payForOrder'

  @Prop({ type: [Object], default: [] })
  eventLogs: Record<string, any>[]; // Event logs từ contract
}

export const CryptoTransactionSchema =
  SchemaFactory.createForClass(CryptoTransaction);

// --- Indexes ---
CryptoTransactionSchema.index({ txHash: 1 }, { unique: true });
CryptoTransactionSchema.index({ orderId: 1 });
CryptoTransactionSchema.index({ fromAddress: 1, createdAt: -1 }); // Lịch sử giao dịch theo ví
CryptoTransactionSchema.index({ status: 1 });
CryptoTransactionSchema.index({ blockNumber: 1 });
