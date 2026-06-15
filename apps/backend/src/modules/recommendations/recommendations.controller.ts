import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';
import { RecommendationsCronService } from './recommendations-cron.service';

@Controller('recommendations')
export class RecommendationsController {
  constructor(
    private readonly recommendationsService: RecommendationsService,
    private readonly cronService: RecommendationsCronService,
  ) {}

  @Get('user/:userId')
  async getUserRecommendations(@Param('userId') userId: string) {
    return this.recommendationsService.getTailoredRecommendations(userId);
  }

  @Get('similar/:productId')
  async getSimilarProducts(@Param('productId') productId: string) {
    return this.recommendationsService.findSimilarProducts(productId);
  }

  @Post('click')
  async logClick(
    @Body('sessionId') sessionId: string,
    @Body('productId') productId: string,
  ) {
    const success = await this.recommendationsService.logClick(sessionId, productId);
    return { success };
  }

  @Post('purchase')
  async logPurchase(
    @Body('sessionId') sessionId: string,
    @Body('productId') productId: string,
  ) {
    const success = await this.recommendationsService.logPurchase(sessionId, productId);
    return { success };
  }

  @Post('admin/sync-all')
  async runAllSyncJobs() {
    await this.cronService.runAllSyncJobs();
    return {
      success: true,
      message: 'Đã hoàn thành đồng bộ thủ công các chỉ số đo lường, hồ sơ người dùng và Vector Embeddings.',
    };
  }
}


