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
    ]),
  ],
  controllers: [RecommendationsController],
  providers: [RecommendationsService],
  exports: [RecommendationsService],
})
export class RecommendationsModule {}

