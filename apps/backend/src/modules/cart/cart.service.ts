import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart, CartDocument } from './schemas/cart.schema';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name)
    private readonly cartModel: Model<CartDocument>,
  ) {}

  async getCart(userId: string) {
    let cart = await this.cartModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .populate('items.productId', 'name images basePrice slug discountPercentage isActive')
      .populate('items.variantId', 'variantName price images sku stockQuantity stockStatus discountPercentage')
      .lean();

    if (!cart) {
      // Tạo cart trống nếu chưa có
      cart = await this.cartModel.create({
        userId: new Types.ObjectId(userId),
        items: [],
      });
      return cart.toObject();
    }

    return cart;
  }

  async addItem(userId: string, dto: AddToCartDto) {
    const userObjectId = new Types.ObjectId(userId);

    // Tìm hoặc tạo cart
    let cart = await this.cartModel.findOne({ userId: userObjectId });
    if (!cart) {
      cart = new this.cartModel({ userId: userObjectId, items: [] });
    }

    // Kiểm tra item đã tồn tại chưa (cùng product + variant)
    const existingIndex = cart.items.findIndex(
      (item) =>
        item.productId.equals(new Types.ObjectId(dto.productId)) &&
        String(item.variantId || '') === String(dto.variantId || ''),
    );

    if (existingIndex !== -1) {
      // Cộng dồn số lượng
      cart.items[existingIndex].quantity += dto.quantity;
    } else {
      // Thêm item mới
      cart.items.push({
        productId: new Types.ObjectId(dto.productId),
        variantId: dto.variantId
          ? new Types.ObjectId(dto.variantId)
          : undefined,
        quantity: dto.quantity,
        addedAt: new Date(),
      } as any);
    }

    await cart.save();
    return this.getCart(userId);
  }

  async updateItem(userId: string, itemId: string, dto: UpdateCartItemDto) {
    const cart = await this.cartModel.findOne({
      userId: new Types.ObjectId(userId),
    });
    if (!cart) throw new NotFoundException('Giỏ hàng không tồn tại');

    const item = cart.items.find(
      (i) => String((i as any)._id) === itemId,
    );
    if (!item) throw new NotFoundException('Sản phẩm không có trong giỏ hàng');

    item.quantity = dto.quantity;
    await cart.save();
    return this.getCart(userId);
  }

  async removeItem(userId: string, itemId: string) {
    const cart = await this.cartModel.findOne({
      userId: new Types.ObjectId(userId),
    });
    if (!cart) throw new NotFoundException('Giỏ hàng không tồn tại');

    cart.items = cart.items.filter(
      (i) => String((i as any)._id) !== itemId,
    ) as any;

    await cart.save();
    return this.getCart(userId);
  }

  async clearCart(userId: string) {
    const cart = await this.cartModel.findOne({
      userId: new Types.ObjectId(userId),
    });
    if (!cart) throw new NotFoundException('Giỏ hàng không tồn tại');

    cart.items = [] as any;
    await cart.save();
    return cart;
  }
}
