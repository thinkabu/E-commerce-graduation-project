import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order, OrderSchema } from './schemas/order.schema';
import { Product, ProductSchema } from '../products/schemas/product.schema';
import { ProductVariant, ProductVariantSchema } from '../products/schemas/product-variant.schema';
import { Address, AddressSchema } from '../users/schemas/address.schema';
import { Coupon, CouponSchema } from '../coupons/schemas/coupon.schema';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Product.name, schema: ProductSchema },
      { name: ProductVariant.name, schema: ProductVariantSchema },
      { name: Address.name, schema: AddressSchema },
      { name: Coupon.name, schema: CouponSchema },
    ]),
    NotificationsModule, // Dùng NotificationsService trong OrdersService
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
