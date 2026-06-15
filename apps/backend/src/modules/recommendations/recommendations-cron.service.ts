import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UserBehavior, UserBehaviorDocument } from './schemas/user-behavior.schema';
import { ProductRecommendationMetrics, ProductRecommendationMetricsDocument } from './schemas/product-recommendation-metrics.schema';
import { UserRecommendationProfile, UserRecommendationProfileDocument } from './schemas/user-recommendation-profile.schema';
import { UserProfileEmbedding, UserProfileEmbeddingDocument } from './schemas/user-profile-embedding.schema';
import { ProductEmbedding, ProductEmbeddingDocument } from './schemas/product-embedding.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { RecommendationsService } from './recommendations.service';

@Injectable()
export class RecommendationsCronService {
  private readonly logger = new Logger(RecommendationsCronService.name);

  constructor(
    @InjectModel(UserBehavior.name)
    private readonly userBehaviorModel: Model<UserBehaviorDocument>,
    @InjectModel(ProductRecommendationMetrics.name)
    private readonly productMetricsModel: Model<ProductRecommendationMetricsDocument>,
    @InjectModel(UserRecommendationProfile.name)
    private readonly userRecProfileModel: Model<UserRecommendationProfileDocument>,
    @InjectModel(UserProfileEmbedding.name)
    private readonly userProfileEmbeddingModel: Model<UserProfileEmbeddingDocument>,
    @InjectModel(ProductEmbedding.name)
    private readonly productEmbeddingModel: Model<ProductEmbeddingDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @Inject(forwardRef(() => RecommendationsService))
    private readonly recommendationsService: RecommendationsService,
  ) {}

  /**
   * Chạy tất cả các tác vụ đồng bộ thủ công phục vụ debug / test
   */
  async runAllSyncJobs(): Promise<void> {
    this.logger.log('🚀 Bắt đầu chạy đồng bộ thủ công toàn bộ hệ thống gợi ý...');
    await this.syncAllProductEmbeddings(); // Tạo vector cho các sản phẩm cũ
    await this.updateProductRecommendationMetrics(); // Tạo metrics cơ bản cho các sản phẩm cũ
    await this.updateUserRecommendationProfiles();
    await this.updateUserProfileEmbeddings();
    this.logger.log('✅ Hoàn tất đồng bộ toàn bộ hệ thống gợi ý!');
  }

  /**
   * Đồng bộ Vector Embeddings cho tất cả sản phẩm hiện có trong hệ thống
   */
  async syncAllProductEmbeddings(): Promise<void> {
    this.logger.log('🌀 Đang chạy tác vụ: Tạo Vector Embeddings cho tất cả sản phẩm...');
    try {
      const products = await this.productModel.find({ isActive: true }).lean();
      this.logger.log(`Tìm thấy ${products.length} sản phẩm cần xử lý vector.`);

      for (const product of products) {
        await this.recommendationsService.syncProductEmbedding(product._id.toString());
      }
      this.logger.log('✅ Hoàn thành tác vụ: Tạo Vector Embeddings cho tất cả sản phẩm.');
    } catch (err) {
      this.logger.error(`Lỗi tạo vector toàn bộ sản phẩm: ${err.message}`);
    }
  }

  /**
   * Tác vụ 1: Tổng hợp các chỉ số tương tác sản phẩm (CTR, CVR, Popularity) trong 30 ngày qua
   * Chạy vào lúc 1:00 AM hàng ngày
   */
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async updateProductRecommendationMetrics(): Promise<void> {
    this.logger.log('📊 Đang chạy tác vụ: Cập nhật Product Recommendation Metrics...');
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    try {
      // 0. Tạo Dữ liệu Gợi ý Baseline (Giải quyết Cold Start cho sản phẩm cũ và tài khoản cũ)
      const products = await this.productModel.find({ isActive: true }).lean();
      this.logger.log(`Khởi tạo chỉ số đo lường cơ bản cho ${products.length} sản phẩm.`);
      for (const product of products) {
        const viewCount = product.viewCount || 0;
        const purchaseCount = product.soldCount || 0;
        const popularityScore = viewCount * 1 + purchaseCount * 10;

        await this.productMetricsModel.updateOne(
          { productId: product._id },
          {
            $set: {
              averageRating: product.averageRating || 0,
              reviewCount: product.reviewCount || 0,
            },
            $setOnInsert: {
              viewCount30d: viewCount || 1,
              clickCount30d: viewCount || 1,
              cartCount30d: 0,
              purchaseCount30d: purchaseCount,
              ctr: 0.1,
              cvr: 0.05,
              popularityScore: popularityScore || 1,
            },
          },
          { upsert: true },
        );
      }

      // 1. Nhóm tương tác theo từng sản phẩm
      const aggregatedBehaviors = await this.userBehaviorModel.aggregate([
        { $match: { timestamp: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: '$productId',
            views: { $sum: { $cond: [{ $eq: ['$actionType', 'VIEW'] }, 1, 0] } },
            clicks: { $sum: { $cond: [{ $eq: ['$actionType', 'VIEW'] }, 1, 0] } }, // view ở đây tương đương click
            carts: { $sum: { $cond: [{ $eq: ['$actionType', 'ADD_TO_CART'] }, 1, 0] } },
            purchases: { $sum: { $cond: [{ $eq: ['$actionType', 'PURCHASE'] }, 1, 0] } },
          },
        },
      ]);

      this.logger.log(`Tìm thấy tương tác cho ${aggregatedBehaviors.length} sản phẩm trong 30 ngày qua.`);

      // 2. Cập nhật chỉ số vào collection
      for (const item of aggregatedBehaviors) {
        const productId = item._id;
        const viewCount = item.views || 0;
        const clickCount = item.clicks || 0;
        const cartCount = item.carts || 0;
        const purchaseCount = item.purchases || 0;

        // Tính CTR & CVR
        const ctr = viewCount > 0 ? clickCount / viewCount : 0;
        const cvr = clickCount > 0 ? purchaseCount / clickCount : 0;

        // Điểm phổ biến = views*1 + carts*5 + purchases*10
        const popularityScore = viewCount * 1 + cartCount * 5 + purchaseCount * 10;

        // Lấy thông tin review từ bảng Product gốc để cache
        const product = await this.productModel.findById(productId).lean();
        const averageRating = product?.averageRating || 0;
        const reviewCount = product?.reviewCount || 0;

        await this.productMetricsModel.updateOne(
          { productId },
          {
            $set: {
              viewCount30d: viewCount,
              clickCount30d: clickCount,
              cartCount30d: cartCount,
              purchaseCount30d: purchaseCount,
              ctr,
              cvr,
              popularityScore,
              averageRating,
              reviewCount,
            },
          },
          { upsert: true },
        );
      }

      this.logger.log('✅ Hoàn thành tác vụ: Product Recommendation Metrics.');
    } catch (err) {
      this.logger.error(`Lỗi chạy Product Metrics Cron Job: ${err.message}`);
    }
  }

  /**
   * Tác vụ 2: Tổng hợp hồ sơ sở thích người dùng (Danh mục, thương hiệu, khoảng giá)
   * Chạy vào lúc 2:00 AM hàng ngày
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async updateUserRecommendationProfiles(): Promise<void> {
    this.logger.log('👤 Đang chạy tác vụ: Cập nhật User Recommendation Profiles...');
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    try {
      // 1. Lấy tất cả user có hoạt động trong 30 ngày qua
      const activeUsers = await this.userBehaviorModel.distinct('userId', {
        timestamp: { $gte: thirtyDaysAgo },
      });

      this.logger.log(`Tìm thấy ${activeUsers.length} người dùng hoạt động trong 30 ngày qua.`);

      for (const userId of activeUsers) {
        if (!userId) continue;

        // Lấy tất cả hành vi của user này
        const userBehaviors = await this.userBehaviorModel
          .find({ userId, timestamp: { $gte: thirtyDaysAgo } })
          .populate({
            path: 'productId',
            select: 'categoryId manufacturer basePrice',
            model: Product.name,
          })
          .lean();

        const categoryScores: Record<string, number> = {};
        const brandScores: Record<string, number> = {};
        const prices: number[] = [];

        let totalViews = 0;
        let totalCarts = 0;
        let totalPurchases = 0;

        for (const behavior of userBehaviors) {
          const product = behavior.productId as any;
          if (!product) continue;

          // Tính trọng số hành vi
          let weight = 1; // VIEW
          if (behavior.actionType === 'VIEW') {
            totalViews++;
            weight = 1;
          } else if (behavior.actionType === 'ADD_TO_CART') {
            totalCarts++;
            weight = 5;
          } else if (behavior.actionType === 'PURCHASE') {
            totalPurchases++;
            weight = 10;
          }

          // Cộng dồn điểm danh mục
          if (product.categoryId) {
            const catId = product.categoryId.toString();
            categoryScores[catId] = (categoryScores[catId] || 0) + weight;
          }

          // Cộng dồn điểm thương hiệu
          if (product.manufacturer) {
            const brandName = product.manufacturer.trim();
            brandScores[brandName] = (brandScores[brandName] || 0) + weight;
          }

          // Lưu giá sản phẩm để tính khoảng giá
          if (behavior.actionType === 'PURCHASE' || behavior.actionType === 'ADD_TO_CART') {
            prices.push(product.basePrice || 0);
          }
        }

        // Định dạng preferredCategories
        const preferredCategories = Object.entries(categoryScores)
          .map(([categoryId, score]) => ({
            categoryId: new Types.ObjectId(categoryId),
            score,
          }))
          .sort((a, b) => b.score - a.score)
          .slice(0, 5);

        // Định dạng preferredBrands
        const preferredBrands = Object.entries(brandScores)
          .map(([brand, score]) => ({
            brand,
            score,
          }))
          .sort((a, b) => b.score - a.score)
          .slice(0, 5);

        // Định dạng pricePreference
        let minPrice = 0;
        let maxPrice = 0;
        let avgPrice = 0;
        if (prices.length > 0) {
          minPrice = Math.min(...prices);
          maxPrice = Math.max(...prices);
          avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
        }

        await this.userRecProfileModel.updateOne(
          { userId },
          {
            $set: {
              preferredCategories,
              preferredBrands,
              pricePreference: {
                min: minPrice,
                max: maxPrice,
                avg: avgPrice,
              },
              activityMetrics: {
                totalViews,
                totalCarts,
                totalPurchases,
                lastActiveTime: new Date(),
              },
            },
          },
          { upsert: true },
        );
      }

      this.logger.log('✅ Hoàn thành tác vụ: User Recommendation Profiles.');
    } catch (err) {
      this.logger.error(`Lỗi chạy User Profiles Cron Job: ${err.message}`);
    }
  }

  /**
   * Tác vụ 3: Cập nhật Vector đại diện sở thích của người dùng (UserProfileEmbedding)
   * Chạy vào lúc 3:00 AM hàng ngày
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async updateUserUserProfileEmbeddings(): Promise<void> {
    await this.updateUserProfileEmbeddings();
  }

  async updateUserProfileEmbeddings(): Promise<void> {
    this.logger.log('🌀 Đang chạy tác vụ: Cập nhật User Profile Embeddings...');
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    try {
      // 1. Lấy tất cả user có hành vi VIEW hoặc ADD_TO_CART trong 7 ngày qua
      const activeUsers = await this.userBehaviorModel.distinct('userId', {
        actionType: { $in: ['VIEW', 'ADD_TO_CART', 'PURCHASE'] },
        timestamp: { $gte: sevenDaysAgo },
      });

      this.logger.log(`Tìm thấy ${activeUsers.length} người dùng có tương tác gần đây để sinh Vector sở thích.`);

      for (const userId of activeUsers) {
        if (!userId) continue;

        // Lấy danh sách sản phẩm gần đây
        const behaviors = await this.userBehaviorModel
          .find({
            userId,
            actionType: { $in: ['VIEW', 'ADD_TO_CART', 'PURCHASE'] },
            timestamp: { $gte: sevenDaysAgo },
          })
          .limit(20)
          .lean();

        const productIds = behaviors.map(b => b.productId);
        if (productIds.length === 0) continue;

        // Truy vấn embeddings của các sản phẩm này
        const productEmbeds = await this.productEmbeddingModel.find({
          productId: { $in: productIds },
        }).lean();

        if (productEmbeds.length === 0) continue;

        // Tính trung bình cộng các vector
        const dimension = productEmbeds[0].embedding.length;
        const meanVector: number[] = new Array(dimension).fill(0);

        for (const prodEmbed of productEmbeds) {
          for (let i = 0; i < dimension; i++) {
            meanVector[i] += prodEmbed.embedding[i] || 0;
          }
        }

        // Chia trung bình
        for (let i = 0; i < dimension; i++) {
          meanVector[i] = meanVector[i] / productEmbeds.length;
        }

        // Chuẩn hóa vector kết quả (Unit Vector)
        const magnitude = Math.sqrt(meanVector.reduce((sum, val) => sum + val * val, 0));
        const normalizedVector = meanVector.map(val => val / (magnitude || 1));

        await this.userProfileEmbeddingModel.updateOne(
          { userId },
          {
            $set: {
              embedding: normalizedVector,
              embeddingModel: productEmbeds[0].embeddingModel || 'text-embedding-3-small',
              sourceProductIds: productEmbeds.map(pe => pe.productId),
              lastGeneratedAt: new Date(),
            },
          },
          { upsert: true },
        );
      }

      this.logger.log('✅ Hoàn thành tác vụ: User Profile Embeddings.');
    } catch (err) {
      this.logger.error(`Lỗi chạy User Embeddings Cron Job: ${err.message}`);
    }
  }
}
