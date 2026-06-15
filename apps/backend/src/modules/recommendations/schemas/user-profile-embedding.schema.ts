import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserProfileEmbeddingDocument = HydratedDocument<UserProfileEmbedding>;

@Schema({
  timestamps: true,
  collection: 'user_profile_embeddings',
})
export class UserProfileEmbedding {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  @Prop({ type: [Number], required: true })
  embedding: number[]; // Vector 1536 dimensions đại diện cho sở thích tích hợp của User

  @Prop({ default: 'text-embedding-3-small' })
  embeddingModel: string; // Tên model sinh vector

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Product' }], default: [] })
  sourceProductIds: Types.ObjectId[]; // Danh sách các ID sản phẩm làm cơ sở tính toán vector này

  @Prop({ type: Date, default: Date.now })
  lastGeneratedAt: Date;
}

export const UserProfileEmbeddingSchema = SchemaFactory.createForClass(UserProfileEmbedding);
UserProfileEmbeddingSchema.index({ userId: 1 }, { unique: true });
// Hỗ trợ truy vấn vector search trực tiếp trên profile embedding nếu cần (ví dụ tìm người dùng có sở thích tương tự)
// Cấu hình vector search index tương tự như product embedding nếu muốn so sánh User-User
