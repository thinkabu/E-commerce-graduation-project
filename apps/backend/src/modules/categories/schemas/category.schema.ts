import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CategoryDocument = HydratedDocument<Category>;

@Schema({ timestamps: true })
export class Category {
  @Prop({
    required: [true, 'Tên danh mục là bắt buộc'],
    unique: true,
    trim: true,
    maxlength: [100, 'Tên danh mục không quá 100 ký tự'],
  })
  name: string;

  @Prop({
    required: [true, 'Slug là bắt buộc'],
    unique: true,
    trim: true,
    lowercase: true,
  })
  slug: string; // URL-friendly: 'dien-thoai'

  @Prop({ trim: true })
  description: string;

  @Prop() // Cloudinary URL
  image: string;

  @Prop({ type: Types.ObjectId, ref: 'Category', default: null })
  parentId: Types.ObjectId; // Danh mục cha (null = root level)

  @Prop({ default: 0, min: 0 })
  level: number; // 0 = root, 1 = child, 2 = grandchild

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  sortOrder: number; // Thứ tự hiển thị
}

export const CategorySchema = SchemaFactory.createForClass(Category);

// --- Indexes ---
CategorySchema.index({ slug: 1 }, { unique: true });
CategorySchema.index({ parentId: 1 });
CategorySchema.index({ level: 1, sortOrder: 1 });
CategorySchema.index({ isActive: 1 });
