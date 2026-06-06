import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Coupon, CouponDocument } from './schemas/coupon.schema';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';

@Injectable()
export class CouponsService {
  constructor(
    @InjectModel(Coupon.name)
    private readonly couponModel: Model<CouponDocument>,
  ) {}

  async create(dto: CreateCouponDto): Promise<Coupon> {
    // Kiểm tra code trùng
    const existing = await this.couponModel.findOne({ code: dto.code.toUpperCase() });
    if (existing) throw new ConflictException('Mã giảm giá đã tồn tại');
    return this.couponModel.create(dto);
  }

  async findAll(query?: { isActive?: boolean; search?: string }) {
    const filter: any = {};
    if (query?.isActive !== undefined) {
      filter.isActive = query.isActive;
    }
    if (query?.search) {
      filter.code = { $regex: query.search, $options: 'i' };
    }

    const [items, total] = await Promise.all([
      this.couponModel.find(filter).sort({ createdAt: -1 }).lean(),
      this.couponModel.countDocuments(filter),
    ]);

    return { items, total };
  }

  async findById(id: string): Promise<Coupon> {
    const coupon = await this.couponModel.findById(id).lean();
    if (!coupon) throw new NotFoundException('Mã giảm giá không tồn tại');
    return coupon;
  }

  async findByCode(code: string): Promise<Coupon> {
    const coupon = await this.couponModel.findOne({ code: code.toUpperCase() }).lean();
    if (!coupon) throw new NotFoundException('Mã giảm giá không tồn tại');
    return coupon;
  }

  async update(id: string, dto: UpdateCouponDto): Promise<Coupon> {
    const coupon = await this.couponModel
      .findByIdAndUpdate(id, dto, { new: true, runValidators: true })
      .lean();
    if (!coupon) throw new NotFoundException('Mã giảm giá không tồn tại');
    return coupon;
  }

  async remove(id: string): Promise<Coupon> {
    const coupon = await this.couponModel.findByIdAndDelete(id).lean();
    if (!coupon) throw new NotFoundException('Mã giảm giá không tồn tại');
    return coupon;
  }

  /**
   * Validate coupon — kiểm tra coupon có hợp lệ để áp dụng không
   */
  async validate(code: string, orderAmount: number): Promise<{ valid: boolean; coupon?: any; message?: string }> {
    const coupon = await this.couponModel.findOne({ code: code.toUpperCase() }).lean();
    
    if (!coupon) {
      return { valid: false, message: 'Mã giảm giá không tồn tại' };
    }

    if (!coupon.isActive) {
      return { valid: false, message: 'Mã giảm giá đã bị vô hiệu hóa' };
    }

    const now = new Date();
    if (now < new Date(coupon.startDate)) {
      return { valid: false, message: 'Mã giảm giá chưa có hiệu lực' };
    }
    if (now > new Date(coupon.endDate)) {
      return { valid: false, message: 'Mã giảm giá đã hết hạn' };
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return { valid: false, message: 'Mã giảm giá đã hết lượt sử dụng' };
    }

    if (orderAmount < coupon.minOrderAmount) {
      return {
        valid: false,
        message: `Đơn hàng tối thiểu ${coupon.minOrderAmount.toLocaleString()}₫ để áp dụng mã này`,
      };
    }

    return { valid: true, coupon };
  }
}
