import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import {
  ProductVariant,
  ProductVariantDocument,
} from './schemas/product-variant.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(ProductVariant.name)
    private readonly variantModel: Model<ProductVariantDocument>,
  ) {}

  // ==========================================
  // Product CRUD
  // ==========================================

  async create(dto: CreateProductDto): Promise<any> {
    const { variants, ...productData } = dto;
    const product = await this.productModel.create(productData);

    // Tạo variants nếu có
    let createdVariants: any[] = [];
    if (variants?.length) {
      createdVariants = await this.variantModel.insertMany(
        variants.map((v) => ({ ...v, productId: product._id })),
      );
    }

    return {
      ...product.toObject(),
      variants: createdVariants,
    };
  }

  async findAll(query: QueryProductDto) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      categoryId,
      minPrice,
      maxPrice,
      tags,
      manufacturer,
      isFeatured,
    } = query;

    const skip = (page - 1) * limit;
    const filter: any = { isActive: true };

    // Text search
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    // Category filter
    if (categoryId) filter.categoryId = new Types.ObjectId(categoryId);

    // Price range
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.basePrice = {};
      if (minPrice !== undefined) filter.basePrice.$gte = minPrice;
      if (maxPrice !== undefined) filter.basePrice.$lte = maxPrice;
    }

    // Tags filter (comma-separated)
    if (tags) {
      const tagArray = tags.split(',').map((t) => t.trim());
      filter.tags = { $in: tagArray };
    }

    // Manufacturer
    if (manufacturer) {
      filter.manufacturer = { $regex: manufacturer, $options: 'i' };
    }

    // Featured
    if (isFeatured !== undefined) filter.isFeatured = isFeatured;

    const sort: any = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [items, total] = await Promise.all([
      this.productModel
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('categoryId', 'name slug')
        .lean(),
      this.productModel.countDocuments(filter),
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

  async findFeatured(limit = 10): Promise<Product[]> {
    return this.productModel
      .find({ isActive: true, isFeatured: true })
      .sort({ soldCount: -1, averageRating: -1 })
      .limit(limit)
      .populate('categoryId', 'name slug')
      .lean();
  }

  async findByIdOrSlug(idOrSlug: string): Promise<any> {
    const isObjectId = Types.ObjectId.isValid(idOrSlug);

    const product = isObjectId
      ? await this.productModel
          .findOne({ _id: idOrSlug, isActive: true })
          .populate('categoryId', 'name slug')
          .lean()
      : await this.productModel
          .findOne({ slug: idOrSlug, isActive: true })
          .populate('categoryId', 'name slug')
          .lean();

    if (!product) throw new NotFoundException('Sản phẩm không tồn tại');

    // Lấy variants
    const variants = await this.variantModel
      .find({ productId: product._id, isActive: true })
      .sort({ sortOrder: 1 })
      .lean();

    // Tăng viewCount
    await this.productModel.updateOne(
      { _id: product._id },
      { $inc: { viewCount: 1 } },
    );

    return { ...product, variants };
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const { variants, ...updateData } = dto as any;

    const product = await this.productModel
      .findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .lean();
    if (!product) throw new NotFoundException('Sản phẩm không tồn tại');

    // Đồng bộ variants nếu có gửi lên
    if (variants !== undefined) {
      // Lấy danh sách _id của các variants gửi lên (nếu có)
      const variantIdsToKeep = variants
        .map((v: any) => v._id)
        .filter((vid: any) => vid && Types.ObjectId.isValid(vid));

      // Xóa các variants cũ của sản phẩm này mà không nằm trong danh sách giữ lại
      await this.variantModel.deleteMany({
        productId: new Types.ObjectId(id),
        _id: { $nin: variantIdsToKeep.map((vId: string) => new Types.ObjectId(vId)) },
      });

      // Upsert (Cập nhật hoặc Tạo mới) từng variant
      for (const variant of variants) {
        if (variant._id && Types.ObjectId.isValid(variant._id)) {
          // Có _id hợp lệ => Cập nhật
          const { _id, ...variantUpdateData } = variant;
          await this.variantModel.findByIdAndUpdate(_id, variantUpdateData);
        } else {
          // Không có _id => Tạo mới
          const { _id, ...newVariantData } = variant; // Loại bỏ _id nếu có bị dính
          await this.variantModel.create({
            ...newVariantData,
            productId: new Types.ObjectId(id),
          });
        }
      }
    }

    return product;
  }

  async remove(id: string): Promise<Product> {
    const product = await this.productModel
      .findByIdAndUpdate(id, { isActive: false }, { new: true })
      .lean();
    if (!product) throw new NotFoundException('Sản phẩm không tồn tại');

    // Soft delete tất cả variants
    await this.variantModel.updateMany(
      { productId: new Types.ObjectId(id) },
      { isActive: false },
    );

    return product;
  }


  // Variant CRUD
  async createVariant(
    productId: string,
    dto: CreateVariantDto,
  ): Promise<ProductVariant> {
    const product = await this.productModel.findById(productId);
    if (!product) throw new NotFoundException('Sản phẩm không tồn tại');

    return this.variantModel.create({
      ...dto,
      productId: new Types.ObjectId(productId),
    });
  }

  async updateVariant(
    productId: string,
    variantId: string,
    dto: UpdateVariantDto,
  ): Promise<ProductVariant> {
    const variant = await this.variantModel
      .findOneAndUpdate(
        { _id: variantId, productId: new Types.ObjectId(productId) },
        dto,
        { new: true, runValidators: true },
      )
      .lean();
    if (!variant) throw new NotFoundException('Biến thể không tồn tại');
    return variant;
  }

  async removeVariant(
    productId: string,
    variantId: string,
  ): Promise<ProductVariant> {
    const variant = await this.variantModel
      .findOneAndUpdate(
        { _id: variantId, productId: new Types.ObjectId(productId) },
        { isActive: false },
        { new: true },
      )
      .lean();
    if (!variant) throw new NotFoundException('Biến thể không tồn tại');
    return variant;
  }
}
