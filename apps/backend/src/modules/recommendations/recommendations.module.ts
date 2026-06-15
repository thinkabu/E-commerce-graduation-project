import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RecommendationsService } from './recommendations.service';
import { RecommendationsController } from './recommendations.controller';
import { UserCFRecommendation, UserCFRecommendationSchema } from './schemas/user-cf-recommendation.schema';
import { UserProfileEmbedding, UserProfileEmbeddingSchema } from './schemas/user-profile-embedding.schema';
import { UserRecommendationProfile, UserRecommendationProfileSchema } from './schemas/user-recommendation-profile.schema';
import { ProductRecommendationMetrics, ProductRecommendationMetricsSchema } from './schemas/product-recommendation-metrics.schema';
import { RecommendationFeedbackLog, RecommendationFeedbackLogSchema } from './schemas/recommendation-feedback-log.schema';
import { UserBehavior, UserBehaviorSchema } from './schemas/user-behavior.schema';
import { ProductEmbedding, ProductEmbeddingSchema } from './schemas/product-embedding.schema';
import { Product, ProductSchema } from '../products/schemas/product.schema';
import { AiEmbeddingService } from './ai-embedding.service';
import { RecommendationsCronService } from './recommendations-cron.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserCFRecommendation.name, schema: UserCFRecommendationSchema },
      { name: UserProfileEmbedding.name, schema: UserProfileEmbeddingSchema },
      { name: UserRecommendationProfile.name, schema: UserRecommendationProfileSchema },
      { name: ProductRecommendationMetrics.name, schema: ProductRecommendationMetricsSchema },
      { name: RecommendationFeedbackLog.name, schema: RecommendationFeedbackLogSchema },
      { name: UserBehavior.name, schema: UserBehaviorSchema },
      { name: ProductEmbedding.name, schema: ProductEmbeddingSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  controllers: [RecommendationsController],
  providers: [RecommendationsService, AiEmbeddingService, RecommendationsCronService],
  exports: [RecommendationsService, AiEmbeddingService, RecommendationsCronService],
})
export class RecommendationsModule {}


