import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserCFRecommendation, UserCFRecommendationDocument } from './schemas/user-cf-recommendation.schema';
import { UserProfileEmbedding, UserProfileEmbeddingDocument } from './schemas/user-profile-embedding.schema';
import { UserRecommendationProfile, UserRecommendationProfileDocument } from './schemas/user-recommendation-profile.schema';
import { ProductRecommendationMetrics, ProductRecommendationMetricsDocument } from './schemas/product-recommendation-metrics.schema';
import { RecommendationFeedbackLog, RecommendationFeedbackLogDocument } from './schemas/recommendation-feedback-log.schema';
import { UserBehavior, UserBehaviorDocument } from './schemas/user-behavior.schema';
import { ProductEmbedding, ProductEmbeddingDocument } from './schemas/product-embedding.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { Wishlist, WishlistDocument } from '../wishlist/schemas/wishlist.schema';
import { AiEmbeddingService } from './ai-embedding.service';

export interface IRecommendationResult {
  productId: string;
  score: number;
  reason?: string;
}

export interface IRecommendationResponse {
  sessionId: string;
  recommendations: IRecommendationResult[];
}

@Injectable()
export class RecommendationsService {
  private readonly logger = new Logger(RecommendationsService.name);

  constructor(
    @InjectModel(UserCFRecommendation.name)
    private readonly userCFRecModel: Model<UserCFRecommendationDocument>,
    @InjectModel(UserProfileEmbedding.name)
    private readonly userProfileEmbeddingModel: Model<UserProfileEmbeddingDocument>,
    @InjectModel(UserRecommendationProfile.name)
    private readonly userRecProfileModel: Model<UserRecommendationProfileDocument>,
    @InjectModel(ProductRecommendationMetrics.name)
    private readonly productMetricsModel: Model<ProductRecommendationMetricsDocument>,
    @InjectModel(RecommendationFeedbackLog.name)
    private readonly feedbackLogModel: Model<RecommendationFeedbackLogDocument>,
    @InjectModel(UserBehavior.name)
    private readonly userBehaviorModel: Model<UserBehaviorDocument>,
    @InjectModel(ProductEmbedding.name)
    private readonly productEmbeddingModel: Model<ProductEmbeddingDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(Wishlist.name)
    private readonly wishlistModel: Model<WishlistDocument>,
    private readonly aiEmbeddingService: AiEmbeddingService,
  ) {}


  /**
   * Helper: Tính cosine similarity giữa 2 vector
   */
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
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

  /**
   * Bước 1: Vector Search - Tìm sản phẩm tương đồng về đặc tính
   * Hỗ trợ tìm kiếm theo ID sản phẩm hoặc theo Vector sở thích của User
   */
  /**
   * Helper: Điền thông tin chi tiết sản phẩm (populate Product details) từ candidate IDs
   */
  private async populateProducts(results: IRecommendationResult[]): Promise<any[]> {
    if (results.length === 0) return [];
    
    const productIds = results.map(r => new Types.ObjectId(r.productId));
    const products = await this.productModel
      .find({ _id: { $in: productIds }, isActive: true })
      .lean();

    const productMap = new Map<string, any>();
    products.forEach(p => {
      productMap.set(p._id.toString(), p);
    });

    return results
      .map(r => {
        const productData = productMap.get(r.productId);
        if (!productData) return null;
        return {
          ...r,
          product: productData,
        };
      })
      .filter(Boolean);
  }

  /**
   * Bước 1: Vector Search - Tìm sản phẩm tương đồng về đặc tính
   * Hỗ trợ tìm kiếm theo ID sản phẩm hoặc theo Vector sở thích của User
   */
  async findSimilarProducts(
    productId: string,
    limit = 10,
  ): Promise<any[]> {
    this.logger.log(`Finding similar products for product ID: ${productId}`);

    if (!Types.ObjectId.isValid(productId)) {
      return [];
    }

    // Lấy embedding của sản phẩm nguồn
    const targetEmbed = await this.productEmbeddingModel.findOne({
      productId: new Types.ObjectId(productId),
    });

    if (!targetEmbed || !targetEmbed.embedding || targetEmbed.embedding.length === 0) {
      this.logger.warn(`No embedding found for product: ${productId}`);
      return [];
    }

    const similarResults = await this.searchSimilarByVector(
      targetEmbed.embedding,
      [new Types.ObjectId(productId)],
      limit,
    );

    return this.populateProducts(similarResults);
  }

  /**
   * Lõi Vector Search: Chạy Atlas $vectorSearch hoặc fallback tính in-memory
   */
  async searchSimilarByVector(
    queryVector: number[],
    excludeProductIds: Types.ObjectId[] = [],
    limit = 10,
  ): Promise<IRecommendationResult[]> {
    try {
      // Thử dùng Atlas $vectorSearch (Chỉ chạy được trên MongoDB Atlas thực tế)
      // Để tránh crash ở local dev, ta thực hiện kiểm tra hoặc chạy trong block try/catch
      const excludeIds = excludeProductIds.map(id => id.toString());
      
      const results = await this.productEmbeddingModel.aggregate([
        {
          $vectorSearch: {
            index: 'vector_index', // Tên index trên Atlas
            path: 'embedding',
            queryVector: queryVector,
            numCandidates: 100,
            limit: limit + excludeIds.length,
          },
        },
      ]);

      if (results && results.length > 0) {
        return results
          .filter(doc => !excludeIds.includes(doc.productId.toString()))
          .slice(0, limit)
          .map(doc => ({
            productId: doc.productId.toString(),
            score: doc.score || 0.5, // MongoDB Atlas trả về score tương đồng
            reason: 'Vector Similarity (Atlas Search)',
          }));
      }
    } catch (err) {
      this.logger.debug(
        `Atlas Vector Search không khả dụng (${err.message}). Chuyển sang Fallback In-Memory Similarity.`,
      );
    }

    // --- Fallback In-Memory Cosine Similarity ---
    // Phục vụ cho môi trường local dev để hệ thống hoạt động bình thường
    const allEmbeddings = await this.productEmbeddingModel.find().lean();
    const excludeIds = excludeProductIds.map(id => id.toString());

    const matched = allEmbeddings
      .filter(doc => !excludeIds.includes(doc.productId.toString()))
      .map(doc => {
        const sim = this.cosineSimilarity(queryVector, doc.embedding);
        return {
          productId: doc.productId.toString(),
          score: sim,
          reason: 'Vector Similarity (Cosine Fallback)',
        };
      })
      .filter(item => item.score >= 0.35) // Chỉ lấy sản phẩm có độ tương quan khá trở lên (>= 0.35)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return matched;
  }

  /**
   * Bước 2: Collaborative Filtering - Gợi ý dựa trên hành vi nhóm
   * Truy vấn kết quả đã pre-computed từ model ALS/CF
   */
  async getCFRecommendations(
    userId: string,
    limit = 10,
  ): Promise<IRecommendationResult[]> {
    this.logger.log(`Getting CF recommendations for user: ${userId}`);

    if (!Types.ObjectId.isValid(userId)) {
      return this.getPopularFallback(limit);
    }

    const cfData = await this.userCFRecModel.findOne({
      userId: new Types.ObjectId(userId),
    });

    if (!cfData || !cfData.recommendations || cfData.recommendations.length === 0) {
      this.logger.warn(`No CF data precomputed for user: ${userId}. Dùng Fallback Popularity.`);
      return this.getPopularFallback(limit);
    }

    return cfData.recommendations.slice(0, limit).map(rec => ({
      productId: rec.productId.toString(),
      score: rec.score,
      reason: 'Collaborative Filtering (ALS)',
    }));
  }

  /**
   * Fallback: Lấy sản phẩm phổ biến nhất dựa trên metric bán chạy/view cao
   */
  private async getPopularFallback(limit: number): Promise<IRecommendationResult[]> {
    const populars = await this.productMetricsModel
      .find()
      .sort({ popularityScore: -1 })
      .limit(limit)
      .lean();

    return populars.map(doc => ({
      productId: doc.productId.toString(),
      score: doc.popularityScore > 0 ? Math.min(doc.popularityScore / 100, 1.0) : 0.5,
      reason: 'Popular Product Fallback',
    }));
  }

  /**
   * Bước 3: AI Ranking - Tổng hợp (Retrieval), Làm giàu (Feature Store) và Xếp hạng lại (Re-ranking)
   */
  async getTailoredRecommendations(
    userId: string,
    limit = 10,
  ): Promise<IRecommendationResponse> {
    this.logger.log(`Generating tailored recommendations for user: ${userId}`);
    const sessionId = new Types.ObjectId().toString(); // Tạo session tracking độc bản

    const userObjId = Types.ObjectId.isValid(userId) ? new Types.ObjectId(userId) : null;

    // --- 1. GIAI ĐOẠN RETRIEVAL: LẤY TOÀN BỘ SẢN PHẨM HOẠT ĐỘNG ---
    const activeProductsList = await this.productModel.find({ isActive: true }).select('_id').lean();
    const candidateIds = activeProductsList.map(p => p._id.toString());

    if (candidateIds.length === 0) {
      return { sessionId, recommendations: [] };
    }

    let vectorCandidates: IRecommendationResult[] = [];
    let cfCandidates: IRecommendationResult[] = [];

    // Lấy Vector search candidates dựa trên User Profile Embedding cho toàn bộ sản phẩm
    if (userObjId) {
      const userProfileEmbed = await this.userProfileEmbeddingModel.findOne({ userId: userObjId });
      if (userProfileEmbed && userProfileEmbed.embedding && userProfileEmbed.embedding.length > 0) {
        vectorCandidates = await this.searchSimilarByVector(userProfileEmbed.embedding, [], candidateIds.length);
      } else {
        // Fallback: Nếu user chưa có profile embedding, lấy embedding của sản phẩm cuối cùng user vừa view
        const lastBehavior = await this.userBehaviorModel
          .findOne({ userId: userObjId, actionType: 'VIEW' })
          .sort({ timestamp: -1 });

        if (lastBehavior) {
          vectorCandidates = await this.findSimilarProducts(lastBehavior.productId.toString(), candidateIds.length);
        }
      }
    }

    // Lấy Collaborative Filtering candidates cho toàn bộ sản phẩm
    cfCandidates = await this.getCFRecommendations(userId, candidateIds.length);

    // Hợp nhất candidates: Khởi tạo tất cả active sản phẩm để chấm điểm toàn bộ
    const candidateMap = new Map<string, { vectorScore: number; cfScore: number }>();
    candidateIds.forEach(id => {
      candidateMap.set(id, { vectorScore: 0, cfScore: 0 });
    });
    
    vectorCandidates.forEach(c => {
      const val = candidateMap.get(c.productId);
      if (val) val.vectorScore = c.score;
    });

    cfCandidates.forEach(c => {
      const val = candidateMap.get(c.productId);
      if (val) val.cfScore = c.score;
    });

    // --- 2. GIAI ĐOẠN FEATURE RETRIEVAL: ĐỌC DỮ LIỆU TỪ FEATURE STORE ---
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const [userProfile, productMetricsList, candidateProducts, wishlistItems, recentLogs] = await Promise.all([
      userObjId ? this.userRecProfileModel.findOne({ userId: userObjId }).lean() : null,
      this.productMetricsModel.find({ productId: { $in: candidateIds.map(id => new Types.ObjectId(id)) } }).lean(),
      this.productModel.find({ _id: { $in: candidateIds.map(id => new Types.ObjectId(id)) }, isActive: true }).lean(),
      userObjId ? this.wishlistModel.find({ userId: userObjId }).lean() : [] as any[],
      userObjId ? this.feedbackLogModel.find({
        userId: userObjId,
        createdAt: { $gte: fiveMinutesAgo },
        recommendationType: 'home_feed',
      }).lean() as any : [] as any[],
    ]);

    const productMetricsMap = new Map<string, any>();
    productMetricsList.forEach(m => {
      productMetricsMap.set(m.productId.toString(), m);
    });

    const candidateProductsMap = new Map<string, any>();
    candidateProducts.forEach(p => {
      candidateProductsMap.set(p._id.toString(), p);
    });

    const wishlistedProductIds = new Set<string>(
      wishlistItems.map(w => w.productId.toString())
    );

    const recentlyShownProductIds = new Set<string>();
    recentLogs.forEach(log => {
      log.recommendedProducts?.forEach(item => {
        recentlyShownProductIds.add(item.productId.toString());
      });
    });

    // --- 3. GIAI ĐOẠN RE-RANKING: AI HEURISTIC RANKING FORMULA ---
    // Công thức xếp hạng lai (Hybrid Recommendation Scoring Formula)
    const rankedResults: IRecommendationResult[] = [];

    candidateMap.forEach((scores, prodId) => {
      const metrics = productMetricsMap.get(prodId);
      const product = candidateProductsMap.get(prodId);
      
      // Trọng số các thành phần (Tổng = 1.0)
      const wVector = 0.35; // Độ tương đồng về vector
      const wCF = 0.35;    // Điểm Collaborative filtering
      const wPopularity = 0.15; // Lượt mua/bán của sản phẩm
      const wContext = 0.15; // Mức độ khớp Category/Brand yêu thích của User

      // Tính điểm Popularity
      let popScore = 0;
      if (metrics) {
        popScore = metrics.popularityScore > 0 
          ? Math.min(metrics.popularityScore / 100, 1.0) 
          : (metrics.averageRating / 5.0) * 0.5;
      }

      // Tính điểm khớp Category & Brand từ User Profile và Wishlist
      let contextScore = 0;
      if (userProfile && product) {
        // 1. Kiểm tra khớp danh mục ưa thích (trọng số 0.4)
        const prodCatId = product.categoryId?.toString();
        if (prodCatId) {
          const preferredCat = userProfile.preferredCategories?.find(
            c => c.categoryId?.toString() === prodCatId,
          );
          if (preferredCat) {
            contextScore += 0.4 * (preferredCat.score / 10.0);
          }
        }

        // 2. Kiểm tra khớp thương hiệu/nhà sản xuất ưa thích (trọng số 0.2)
        const prodBrand = product.manufacturer;
        if (prodBrand) {
          const preferredBrand = userProfile.preferredBrands?.find(
            b => b.brand?.toLowerCase() === prodBrand.toLowerCase(),
          );
          if (preferredBrand) {
            contextScore += 0.2 * (preferredBrand.score / 10.0);
          }
        }

        // 3. Kiểm tra khớp khoảng giá ưa thích (trọng số 0.2)
        if (userProfile.pricePreference && userProfile.pricePreference.avg > 0) {
          const priceDiff = Math.abs(product.basePrice - userProfile.pricePreference.avg);
          const priceRatio = priceDiff / userProfile.pricePreference.avg;
          // Điểm cộng tối đa là 0.2 nếu khớp chính xác, giảm dần nếu lệch
          contextScore += Math.max(0, 0.2 * (1 - priceRatio));
        }

        // 4. Cộng điểm nếu sản phẩm nằm trong Wishlist của người dùng (trọng số 0.2)
        if (wishlistedProductIds.has(prodId)) {
          contextScore += 0.2;
        }
      }

      // Tổng điểm AI Ranking
      let finalScore = 
        (scores.vectorScore * wVector) +
        (scores.cfScore * wCF) +
        (popScore * wPopularity) +
        (contextScore * wContext);

      // --- ÁP DỤNG ROTATION (LUÂN PHIÊN) ---
      // Nếu sản phẩm đã được hiển thị cho user trong 5 phút qua, phạt nhẹ điểm số
      if (recentlyShownProductIds.has(prodId)) {
        finalScore -= 0.15;
      }

      // --- ÁP DỤNG JITTER (XÁO TRỘN NGẪU NHIÊN ±3%) ---
      const jitter = (Math.random() * 0.06) - 0.03; // Random từ -0.03 đến 0.03
      finalScore += jitter;

      // Giới hạn điểm số trong khoảng [0.0, 1.0]
      finalScore = Math.max(0, Math.min(1.0, finalScore));

      // Xác định lý do xếp hạng cao nhất để giải thích UI
      let reason = 'Được đề xuất dựa trên sở thích của bạn';
      if (scores.cfScore > scores.vectorScore && scores.cfScore > popScore) {
        reason = 'Khách hàng có sở thích giống bạn cũng mua sản phẩm này';
      } else if (scores.vectorScore > scores.cfScore && scores.vectorScore > popScore) {
        reason = 'Tương tự các sản phẩm bạn đã xem gần đây';
      } else if (popScore > scores.vectorScore && popScore > scores.cfScore) {
        reason = 'Sản phẩm phổ biến được mua nhiều';
      }

      rankedResults.push({
        productId: prodId,
        score: parseFloat(finalScore.toFixed(4)),
        reason,
      });
    });

    // Sắp xếp theo score giảm dần
    const finalRecommendations = rankedResults
      .sort((a, b) => b.score - a.score);

    // --- 4. GIAI ĐOẠN FEEDBACK LOGGING: GHI LOG ĐỂ THEO DÕI CTR ---
    try {
      const logItems = finalRecommendations.map((rec, index) => ({
        productId: new Types.ObjectId(rec.productId),
        position: index,
        score: rec.score,
      }));

      await this.feedbackLogModel.create({
        userId: userObjId || undefined,
        sessionId,
        recommendationType: 'home_feed',
        algorithmVersion: 'hybrid_v1',
        recommendedProducts: logItems,
        clickedProducts: [],
        purchasedProducts: [],
      });
    } catch (err) {
      this.logger.error(`Lỗi ghi nhận feedback log: ${err.message}`);
    }

    const populatedRecommendations = await this.populateProducts(finalRecommendations);

    return {
      sessionId,
      recommendations: populatedRecommendations,
    };
  }

  /**
   * Theo dõi phản hồi: Người dùng click vào sản phẩm từ gợi ý
   */
  async logClick(sessionId: string, productId: string): Promise<boolean> {
    this.logger.log(`Logging click: Session ${sessionId}, Product ${productId}`);
    if (!Types.ObjectId.isValid(productId)) return false;

    const result = await this.feedbackLogModel.updateOne(
      { sessionId, 'recommendedProducts.productId': new Types.ObjectId(productId) },
      {
        $push: {
          clickedProducts: {
            productId: new Types.ObjectId(productId),
            clickedAt: new Date(),
          },
        },
      },
    );

    return result.modifiedCount > 0;
  }

  /**
   * Theo dõi phản hồi: Người dùng mua sản phẩm được gợi ý
   */
  async logPurchase(sessionId: string, productId: string): Promise<boolean> {
    this.logger.log(`Logging purchase: Session ${sessionId}, Product ${productId}`);
    if (!Types.ObjectId.isValid(productId)) return false;

    const result = await this.feedbackLogModel.updateOne(
      { sessionId, 'recommendedProducts.productId': new Types.ObjectId(productId) },
      {
        $push: {
          purchasedProducts: {
            productId: new Types.ObjectId(productId),
            purchasedAt: new Date(),
          },
        },
      },
    );

    return result.modifiedCount > 0;
  }

  /**
   * Đồng bộ vector embedding cho một sản phẩm cụ thể
   */
  async syncProductEmbedding(productId: string): Promise<number[]> {
    this.logger.log(`Đang đồng bộ Embedding cho sản phẩm ID: ${productId}`);
    if (!Types.ObjectId.isValid(productId)) {
      return [];
    }

    try {
      const product = await this.productModel.findById(productId).lean();
      if (!product) {
        this.logger.warn(`Không tìm thấy sản phẩm để đồng bộ: ${productId}`);
        return [];
      }

      // Tạo văn bản ngữ nghĩa chứa đầy đủ metadata sản phẩm
      const textParts = [
        `Tên sản phẩm: ${product.name}`,
        `Nhà sản xuất: ${product.manufacturer}`,
        `Mô tả: ${product.description || ''}`,
        `Từ khóa: ${(product.tags || []).join(', ')}`,
      ];
      const textUsed = textParts.filter(Boolean).join('. ');

      // Gọi service sinh vector (384 chiều cho paraphrase-multilingual-MiniLM-L12-v2)
      const embedding = await this.aiEmbeddingService.generateEmbedding(textUsed, 384);

      // Cập nhật bảng product_embeddings
      await this.productEmbeddingModel.updateOne(
        { productId: product._id },
        {
          $set: {
            embedding,
            textUsedForEmbedding: textUsed,
            embeddingModel: 'paraphrase-multilingual-MiniLM-L12-v2',
            lastGeneratedAt: new Date(),
          },
          $inc: { version: 1 },
        },
        { upsert: true },
      );

      // Đồng bộ lại vào trường embedding của bảng Product chính để hỗ trợ Atlas Search trực tiếp
      await this.productModel.updateOne(
        { _id: product._id },
        { $set: { embedding } },
      );

      this.logger.log(`✅ Đồng bộ Embedding thành công cho sản phẩm: ${product.name}`);
      return embedding;
    } catch (err) {
      this.logger.error(`Lỗi đồng bộ product embedding: ${err.message}`);
      return [];
    }
  }

  /**
   * Khởi tạo chỉ số đo lường cơ bản cho sản phẩm mới (Cold Start)
   */
  async initializeProductMetrics(productId: string, averageRating = 0, reviewCount = 0): Promise<void> {
    this.logger.log(`Initializing recommendation metrics for product ID: ${productId}`);
    if (!Types.ObjectId.isValid(productId)) {
      return;
    }

    try {
      await this.productMetricsModel.updateOne(
        { productId: new Types.ObjectId(productId) },
        {
          $set: {
            averageRating,
            reviewCount,
          },
          $setOnInsert: {
            viewCount30d: 1,
            clickCount30d: 1,
            cartCount30d: 0,
            purchaseCount30d: 0,
            ctr: 0.1,
            cvr: 0.05,
            popularityScore: 10, // Baseline boost cho sản phẩm mới
          },
        },
        { upsert: true },
      );
      this.logger.log(`✅ Khởi tạo product metrics thành công cho sản phẩm ID: ${productId}`);
    } catch (err) {
      this.logger.error(`Lỗi khởi tạo product metrics: ${err.message}`);
    }
  }
}

