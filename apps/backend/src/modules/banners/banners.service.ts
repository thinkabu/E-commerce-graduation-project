import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Banner, BannerDocument } from './schemas/banner.schema';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';

@Injectable()
export class BannersService {
  constructor(
    @InjectModel(Banner.name)
    private readonly bannerModel: Model<BannerDocument>,
  ) {}

  async create(dto: CreateBannerDto): Promise<Banner> {
    return this.bannerModel.create(dto);
  }

  async findAll(query?: { isActive?: boolean }) {
    const filter: any = {};
    if (query?.isActive !== undefined) {
      filter.isActive = query.isActive;
    }

    const items = await this.bannerModel
      .find(filter)
      .sort({ position: 1, createdAt: -1 })
      .lean();

    return { items, total: items.length };
  }

  async findById(id: string): Promise<Banner> {
    const banner = await this.bannerModel.findById(id).lean();
    if (!banner) throw new NotFoundException('Banner không tồn tại');
    return banner;
  }

  async update(id: string, dto: UpdateBannerDto): Promise<Banner> {
    const banner = await this.bannerModel
      .findByIdAndUpdate(id, dto, { new: true, runValidators: true })
      .lean();
    if (!banner) throw new NotFoundException('Banner không tồn tại');
    return banner;
  }

  async remove(id: string): Promise<Banner> {
    const banner = await this.bannerModel.findByIdAndDelete(id).lean();
    if (!banner) throw new NotFoundException('Banner không tồn tại');
    return banner;
  }
}
