import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Wishlist, WishlistDocument } from './schemas/wishlist.schema';

@Injectable()
export class WishlistService {
  constructor(
    @InjectModel(Wishlist.name)
    private readonly wishlistModel: Model<WishlistDocument>,
  ) {}

  async toggle(
    userId: string,
    productId: string,
  ): Promise<{ action: 'added' | 'removed' }> {
    const existing = await this.wishlistModel.findOne({
      userId: new Types.ObjectId(userId),
      productId: new Types.ObjectId(productId),
    });

    if (existing) {
      await existing.deleteOne();
      return { action: 'removed' };
    }

    await this.wishlistModel.create({
      userId: new Types.ObjectId(userId),
      productId: new Types.ObjectId(productId),
    });
    return { action: 'added' };
  }

  async findAllByUser(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.wishlistModel
        .find({ userId: new Types.ObjectId(userId) })
        .sort({ addedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('productId', 'name images basePrice slug discountPercentage averageRating')
        .lean(),
      this.wishlistModel.countDocuments({
        userId: new Types.ObjectId(userId),
      }),
    ]);

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async checkProduct(
    userId: string,
    productId: string,
  ): Promise<{ isWishlisted: boolean }> {
    const existing = await this.wishlistModel.findOne({
      userId: new Types.ObjectId(userId),
      productId: new Types.ObjectId(productId),
    });
    return { isWishlisted: !!existing };
  }

  async remove(userId: string, id: string) {
    const result = await this.wishlistModel.findOneAndDelete({
      _id: id,
      userId: new Types.ObjectId(userId),
    });
    return result;
  }
}
