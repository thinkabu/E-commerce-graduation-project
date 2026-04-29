import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ProductEmbeddingDocument = HydratedDocument<ProductEmbedding>;

@Schema({
  timestamps: true,
  collection: 'product_embeddings',
})
export class ProductEmbedding {
  @Prop({
    type: Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product ID là bắt buộc'],
    unique: true, // Mỗi product chỉ có 1 embedding
  })
  productId: Types.ObjectId;

  @Prop({
    type: [Number],
    required: [true, 'Embedding vector là bắt buộc'],
  })
  embedding: number[]; // Vector 1536 dimensions cho AI Vector Search

  @Prop({ default: 'text-embedding-3-small' })
  embeddingModel: string; // Model đã dùng để tạo embedding

  @Prop()
  textUsedForEmbedding: string; // Text gốc đã dùng: "iPhone 15 Pro Max - Apple - Smartphone..."

  @Prop({ default: 1 })
  version: number; // Version embedding (tăng khi re-embed)

  @Prop({ type: Date, default: Date.now })
  lastGeneratedAt: Date;
}

export const ProductEmbeddingSchema =
  SchemaFactory.createForClass(ProductEmbedding);

// --- Indexes ---
ProductEmbeddingSchema.index({ productId: 1 }, { unique: true });

// NOTE: Vector Search Index cần được tạo trên MongoDB Atlas UI hoặc Atlas CLI
// Không thể tạo qua Mongoose. Config:
// {
//   "type": "vectorSearch",
//   "fields": [{
//     "path": "embedding",
//     "numDimensions": 1536,
//     "similarity": "cosine",
//     "type": "vector"
//   }]
// }
