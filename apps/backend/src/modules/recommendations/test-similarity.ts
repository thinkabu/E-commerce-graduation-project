import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environmental variables
const envPath = path.resolve(__dirname, '../../../../../.env');
console.log('Loading .env from:', envPath);
dotenv.config({ path: envPath });

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  console.error('No MONGODB_URI found in environment!');
  process.exit(1);
}

// Define inline schemas with collection names
const ProductSchema = new mongoose.Schema({
  name: String,
});
const Product = mongoose.model('Product', ProductSchema, 'products');

const ProductEmbeddingSchema = new mongoose.Schema({
  productId: mongoose.Schema.Types.ObjectId,
  embedding: [Number],
  textUsedForEmbedding: String,
});
const ProductEmbedding = mongoose.model('ProductEmbedding', ProductEmbeddingSchema, 'product_embeddings');

function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function run() {
  console.log('Connecting to database...');
  await mongoose.connect(mongoUri!);
  console.log('Connected.');

  const embeddings = await ProductEmbedding.find().lean() as any[];
  const products = await Product.find({ _id: { $in: embeddings.map(e => e.productId) } }).lean() as any[];
  const productMap = new Map<string, string>(products.map(p => [p._id.toString(), p.name]));

  console.log(`\nFound ${embeddings.length} products with embeddings.\n`);

  if (embeddings.length === 0) {
    console.log('No embeddings found in the database. Make sure you ran the sync-all endpoint first.');
    await mongoose.disconnect();
    return;
  }

  const results: any[] = [];
  
  // Calculate similarity matrix
  for (const docA of embeddings) {
    const nameA = productMap.get(docA.productId.toString()) || docA.productId.toString();
    const row: any = { 'Sản phẩm': nameA };
    for (const docB of embeddings) {
      const nameB = productMap.get(docB.productId.toString()) || docB.productId.toString();
      const sim = cosineSimilarity(docA.embedding, docB.embedding);
      row[nameB] = parseFloat(sim.toFixed(3));
    }
    results.push(row);
  }

  console.table(results);

  await mongoose.disconnect();
}

run().catch(console.error);
