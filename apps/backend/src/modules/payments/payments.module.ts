import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CryptoPaymentService } from './crypto-payment.service';
import { VnPayService } from './vnpay.service';
import { PaymentsController } from './payments.controller';
import {
  CryptoTransaction,
  CryptoTransactionSchema,
} from './schemas/crypto-transaction.schema';
import { Payment, PaymentSchema } from './schemas/payment.schema';
import { Order, OrderSchema } from '../orders/schemas/order.schema';
import { Product, ProductSchema } from '../products/schemas/product.schema';
import {
  ProductVariant,
  ProductVariantSchema,
} from '../products/schemas/product-variant.schema';
import { Coupon, CouponSchema } from '../coupons/schemas/coupon.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CryptoTransaction.name, schema: CryptoTransactionSchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Product.name, schema: ProductSchema },
      { name: ProductVariant.name, schema: ProductVariantSchema },
      { name: Coupon.name, schema: CouponSchema },
    ]),
  ],
  controllers: [PaymentsController],
  providers: [CryptoPaymentService, VnPayService],
  exports: [CryptoPaymentService, VnPayService],
})
export class PaymentsModule {}
