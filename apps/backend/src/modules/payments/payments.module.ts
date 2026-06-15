import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CryptoPaymentService } from './crypto-payment.service';
import { PaymentsController } from './payments.controller';
import {
  CryptoTransaction,
  CryptoTransactionSchema,
} from './schemas/crypto-transaction.schema';
import { Payment, PaymentSchema } from './schemas/payment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CryptoTransaction.name, schema: CryptoTransactionSchema },
      { name: Payment.name, schema: PaymentSchema },
    ]),
  ],
  controllers: [PaymentsController],
  providers: [CryptoPaymentService],
  exports: [CryptoPaymentService],
})
export class PaymentsModule {}
