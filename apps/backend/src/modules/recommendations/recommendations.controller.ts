import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';

@Controller('recommendations')
export class RecommendationsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  @Get('user/:userId')
  async getUserRecommendations(@Param('userId') userId: string) {
    return this.recommendationsService.getTailoredRecommendations(userId);
  }

  @Get('similar/:productId')
  async getSimilarProducts(@Param('productId') productId: string) {
    return this.recommendationsService.findSimilarProducts(productId);
  }
}
