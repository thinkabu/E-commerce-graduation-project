import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Review, ReviewDocument } from './schemas/review.schema';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { CreateReviewDto } from './dto/create-review.dto';
import { OrderStatus } from '../../common/enums';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name)
    private readonly reviewModel: Model<ReviewDocument>,
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  async create(userId: string, dto: CreateReviewDto) {
    // 1. Kiểm tra đơn hàng tồn tại và thuộc về user
    const order = await this.orderModel.findOne({
      _id: dto.orderId,
      userId: new Types.ObjectId(userId),
    });
    if (!order) throw new NotFoundException('Đơn hàng không tồn tại');

    // 2. Kiểm tra đơn hàng đã giao (DELIVERED)
    if (order.orderStatus !== OrderStatus.DELIVERED) {
      throw new BadRequestException(
        'Chỉ có thể đánh giá đơn hàng đã giao thành công',
      );
    }

    // 3. Kiểm tra sản phẩm nằm trong đơn hàng
    const productInOrder = order.items.some(
      (item) => item.productId.toString() === dto.productId,
    );
    if (!productInOrder) {
      throw new BadRequestException('Sản phẩm không nằm trong đơn hàng này');
    }

    // 4. Kiểm tra đã đánh giá chưa (mỗi user chỉ đánh giá 1 lần / sản phẩm)
    const existing = await this.reviewModel.findOne({
      userId: new Types.ObjectId(userId),
      productId: new Types.ObjectId(dto.productId),
    });
    if (existing) {
      throw new ConflictException('Bạn đã đánh giá sản phẩm này rồi');
    }

    // 5. Tạo review
    const review = await this.reviewModel.create({
      userId: new Types.ObjectId(userId),
      productId: new Types.ObjectId(dto.productId),
      orderId: new Types.ObjectId(dto.orderId),
      rating: dto.rating,
      title: dto.title,
      comment: dto.comment,
      isVerifiedPurchase: true,
    });

    // 6. Cập nhật averageRating và reviewCount trên Product
    const stats = await this.reviewModel.aggregate([
      { $match: { productId: new Types.ObjectId(dto.productId) } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) {
      await this.productModel.updateOne(
        { _id: dto.productId },
        {
          averageRating: Math.round(stats[0].avgRating * 10) / 10,
          reviewCount: stats[0].count,
        },
      );
    }

    return review;
  }

  async findByProduct(productId: string) {
    return this.reviewModel
      .find({ productId: new Types.ObjectId(productId) })
      .sort({ createdAt: -1 })
      .populate('userId', 'fullName avatar')
      .lean();
  }

  async findByUser(userId: string) {
    return this.reviewModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .populate('productId', 'name images basePrice')
      .lean();
  }

  async checkUserReviewed(userId: string, productId: string): Promise<boolean> {
    const review = await this.reviewModel.findOne({
      userId: new Types.ObjectId(userId),
      productId: new Types.ObjectId(productId),
    });
    return !!review;
  }
}
