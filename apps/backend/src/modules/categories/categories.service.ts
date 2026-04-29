import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  async create(dto: CreateCategoryDto): Promise<Category> {
    // Tự động tính level nếu có parentId
    if (dto.parentId) {
      const parent = await this.categoryModel.findById(dto.parentId);
      if (!parent) throw new NotFoundException('Danh mục cha không tồn tại');
      dto.level = parent.level + 1;
    }
    return this.categoryModel.create(dto);
  }

  async findAll(query: { isActive?: boolean } = {}): Promise<Category[]> {
    const filter: any = {};
    if (query.isActive !== undefined) filter.isActive = query.isActive;
    return this.categoryModel
      .find(filter)
      .sort({ level: 1, sortOrder: 1 })
      .lean();
  }

  async getTree(): Promise<any[]> {
    const categories = await this.categoryModel
      .find({ isActive: true })
      .sort({ sortOrder: 1 })
      .lean();

    return this.buildTree(categories, null);
  }

  private buildTree(categories: any[], parentId: string | null): any[] {
    return categories
      .filter((cat) => {
        const catParent = cat.parentId ? String(cat.parentId) : null;
        return catParent === (parentId ? String(parentId) : null);
      })
      .map((cat) => ({
        ...cat,
        children: this.buildTree(categories, String(cat._id)),
      }));
  }

  async findById(id: string): Promise<Category> {
    const category = await this.categoryModel.findById(id).lean();
    if (!category) throw new NotFoundException('Danh mục không tồn tại');
    return category;
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    // Tính lại level nếu đổi parentId
    if (dto.parentId) {
      const parent = await this.categoryModel.findById(dto.parentId);
      if (!parent) throw new NotFoundException('Danh mục cha không tồn tại');
      dto.level = parent.level + 1;
    } else if (dto.parentId === null) {
      dto.level = 0;
    }

    const category = await this.categoryModel
      .findByIdAndUpdate(id, dto, { new: true, runValidators: true })
      .lean();
    if (!category) throw new NotFoundException('Danh mục không tồn tại');
    return category;
  }

  async remove(id: string): Promise<Category> {
    const category = await this.categoryModel
      .findByIdAndUpdate(id, { isActive: false }, { new: true })
      .lean();
    if (!category) throw new NotFoundException('Danh mục không tồn tại');
    return category;
  }
}
