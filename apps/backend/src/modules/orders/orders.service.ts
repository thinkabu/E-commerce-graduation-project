import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { ProductVariant, ProductVariantDocument } from '../products/schemas/product-variant.schema';
import { Address, AddressDocument } from '../users/schemas/address.schema';
import { Coupon, CouponDocument } from '../coupons/schemas/coupon.schema';
import { OrderStatus, PaymentStatus, NotificationType } from '../../common/enums';
import { NotificationsService } from '../notifications/notifications.service';
 
// Nhãn trạng thái đơn hàng tiếng Việt cho push notification
const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'đang chờ xác nhận',
  [OrderStatus.CONFIRMED]: 'đã được xác nhận',
  [OrderStatus.PROCESSING]: 'đang được xử lý',
  [OrderStatus.SHIPPING]: 'đang được giao đến bạn',
  [OrderStatus.DELIVERED]: 'đã được giao thành công',
  [OrderStatus.CANCELLED]: 'đã bị hủy',
  [OrderStatus.RETURNED]: 'đã được trả hàng',
};

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(ProductVariant.name)
    private readonly variantModel: Model<ProductVariantDocument>,
    @InjectModel(Address.name)
    private readonly addressModel: Model<AddressDocument>,
    @InjectModel(Coupon.name)
    private readonly couponModel: Model<CouponDocument>,
    private readonly notificationsService: NotificationsService,
  ) {}

  // Generate unique order ID
  private generateOrderId(): string {
    const timestamp = Date.now().toString().slice(-6);
    const randomStr = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `ORD-${timestamp}-${randomStr}`;
  }

  async createOrder(userId: string, dto: CreateOrderDto): Promise<Order> {
    // 1. Lấy địa chỉ giao hàng
    const address = await this.addressModel.findOne({
      _id: dto.shippingAddressId,
      userId: new Types.ObjectId(userId),
    });
    if (!address) {
      throw new NotFoundException('Địa chỉ giao hàng không tồn tại');
    }

    // 2. Lấy thông tin coupon (nếu có)
    let discountAmount = 0;
    let couponDoc: any = null;
    if (dto.couponId) {
      couponDoc = await this.couponModel.findOne({ code: dto.couponId, isActive: true });
      if (!couponDoc) {
        throw new BadRequestException('Mã giảm giá không hợp lệ hoặc đã hết hạn');
      }
    }

    // 3. Xử lý từng sản phẩm
    let subtotal = 0;
    const orderItems: any[] = [];

    for (const item of dto.items) {
      const product = await this.productModel.findById(item.productId);
      if (!product || !product.isActive) {
        throw new BadRequestException(`Sản phẩm ${item.productId} không tồn tại hoặc đã ngừng bán`);
      }

      let variantName = '';
      let variantSku = '';
      let unitPrice = product.basePrice;
      
      // Nếu có giảm giá trên sản phẩm
      if (product.discountPercentage && product.discountPercentage > 0) {
          unitPrice = unitPrice * (1 - product.discountPercentage / 100);
      }

      if (item.variantId) {
        const variant = await this.variantModel.findOne({
          _id: item.variantId,
          productId: product._id,
        });
        if (!variant) {
          throw new BadRequestException(`Biến thể ${item.variantId} không tồn tại`);
        }
        // Check stock
        if (variant.stockQuantity < item.quantity) {
          throw new BadRequestException(`Sản phẩm ${product.name} không đủ số lượng`);
        }
        
        variantName = variant.variantName || '';
        variantSku = variant.sku || '';
        if (variant.price !== undefined) {
           unitPrice = variant.price;
           if (product.discountPercentage && product.discountPercentage > 0) {
               unitPrice = unitPrice * (1 - product.discountPercentage / 100);
           }
        }

        // Giảm stock biến thể
        await this.variantModel.updateOne(
          { _id: variant._id },
          { $inc: { stockQuantity: -item.quantity } }
        );
      } else {
        // Check stock sản phẩm gốc
        if (((product as any).stockQuantity || 0) > 0 && (product as any).stockQuantity < item.quantity) {
          throw new BadRequestException(`Sản phẩm ${product.name} không đủ số lượng`);
        }
        // Giảm stock sản phẩm
        await this.productModel.updateOne(
          { _id: product._id },
          { $inc: { soldCount: item.quantity } }
        );
      }

      const totalPrice = unitPrice * item.quantity;
      subtotal += totalPrice;

      orderItems.push({
        productId: product._id,
        variantId: item.variantId ? new Types.ObjectId(item.variantId) : null,
        productSnapshot: {
          name: product.name,
          image: product.images?.[0] || '',
          productId: product.productId || product._id.toString(),
          variantName,
          variantSku,
          attributes: [],
        },
        quantity: item.quantity,
        unitPrice,
        totalPrice,
      });
    }

    // 4. Tính toán tổng tiền
    if (couponDoc) {
      if (couponDoc.discountType === 'PERCENTAGE') {
        discountAmount = (subtotal * couponDoc.discountValue) / 100;
        if (couponDoc.maxDiscountAmount) {
          discountAmount = Math.min(discountAmount, couponDoc.maxDiscountAmount);
        }
      } else {
        discountAmount = couponDoc.discountValue;
      }
    }

    const shippingFee = subtotal >= 12000000 ? 0 : 30000;
    const totalAmount = Math.max(0, subtotal + shippingFee - discountAmount);

    // 5. Tạo đơn hàng
    const orderId = this.generateOrderId();
    
    const shippingAddressSnapshot = {
        fullName: address.fullName,
        phone: address.phone,
        province: address.province?.name || '',
        district: (address as any).district?.name || address.province?.name || '',
        ward: address.ward?.name || '',
        street: address.street,
        note: dto.note || address.note || '',
    };

    const newOrder = await this.orderModel.create({
      orderId,
      userId: new Types.ObjectId(userId),
      items: orderItems,
      shippingAddressId: address._id,
      shippingAddressSnapshot,
      subtotal,
      shippingFee,
      discount: discountAmount,
      totalAmount,
      couponId: couponDoc ? couponDoc._id : undefined,
      paymentMethod: dto.paymentMethod,
      paymentStatus: PaymentStatus.PENDING,
      orderStatus: OrderStatus.PENDING,
      note: dto.note,
      statusHistory: [
        {
          status: OrderStatus.PENDING,
          changedAt: new Date(),
          changedBy: new Types.ObjectId(userId),
          note: 'Đơn hàng được tạo mới',
        },
      ],
    });

    return newOrder.toObject();
  }

  async findUserOrders(userId: string): Promise<Order[]> {
    return this.orderModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .lean();
  }

  async getOrderById(id: string, userId: string): Promise<Order> {
    const order = await this.orderModel
      .findOne({ _id: id, userId: new Types.ObjectId(userId) })
      .lean();
      
    if (!order) {
      throw new NotFoundException('Đơn hàng không tồn tại');
    }
    return order;
  }

  // --- ADMIN METHODS ---

  async findAllForAdmin(query: any): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, status, search, startDate, endDate } = query;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (status && status !== 'all') {
      filter.orderStatus = status;
    }
    
    if (search) {
      filter['$or'] = [
        { orderId: { $regex: search, $options: 'i' } },
        { 'shippingAddressSnapshot.fullName': { $regex: search, $options: 'i' } }
      ];
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        // Set to end of day
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    const [orders, total] = await Promise.all([
      this.orderModel
        .find(filter)
        .populate('userId', 'fullName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      this.orderModel.countDocuments(filter)
    ]);

    return {
      data: orders,
      total,
      page: Number(page),
      limit: Number(limit)
    };
  }

  async getAdminOrderSummary(startDate?: string, endDate?: string): Promise<{ totalOrders: number; totalRevenue: number; pendingOrders: number }> {
    const matchStage: any = {};
    
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) {
        matchStage.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchStage.createdAt.$lte = end;
      }
    }

    const [summary] = await this.orderModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: {
            $sum: {
              $cond: [{ $ne: ["$orderStatus", OrderStatus.CANCELLED] }, "$totalAmount", 0]
            }
          },
          pendingOrders: {
            $sum: {
              $cond: [{ $eq: ["$orderStatus", OrderStatus.PENDING] }, 1, 0]
            }
          }
        }
      }
    ]);

    if (!summary) {
      return { totalOrders: 0, totalRevenue: 0, pendingOrders: 0 };
    }

    return {
      totalOrders: summary.totalOrders,
      totalRevenue: summary.totalRevenue,
      pendingOrders: summary.pendingOrders
    };
  }

  async updateOrderStatus(id: string, status: OrderStatus, adminId?: string): Promise<Order> {
    const order = await this.orderModel.findById(id);
    if (!order) {
      throw new NotFoundException('Đơn hàng không tồn tại');
    }

    order.orderStatus = status;
    order.statusHistory.push({
      status,
      changedAt: new Date(),
      changedBy: adminId ? new Types.ObjectId(adminId) : order.userId,
      note: 'Admin cập nhật trạng thái đơn hàng',
    });

    await order.save();

    // ── Gửi Push Notification đến user sau khi cập nhật ──
    try {
      const statusLabel = ORDER_STATUS_LABELS[status] ?? status;
      await this.notificationsService.sendAndSave(
        order.userId.toString(),
        '📦 Cập nhật đơn hàng',
        `Đơn hàng ${(order as any).orderId || id} ${statusLabel}`,
        NotificationType.ORDER,
        {
          orderId: order._id.toString(),
          orderStatus: status,
          deepLink: `/profile/order-detail?id=${order._id}`,
        },
      );
    } catch (err: any) {
      // Không để lỗi push làm hỏng luồng cập nhật đơn hàng
      this.logger.warn(`Không gửi được push notification: ${err?.message}`);
    }

    return order;
  }
}
