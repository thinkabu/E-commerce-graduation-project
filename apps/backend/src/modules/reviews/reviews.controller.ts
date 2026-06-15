import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo đánh giá sản phẩm' })
  @ApiQuery({ name: 'userId', required: true })
  create(@Query('userId') userId: string, @Body() dto: CreateReviewDto) {
    return this.reviewsService.create(userId, dto);
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Lấy đánh giá theo sản phẩm' })
  findByProduct(@Param('productId') productId: string) {
    return this.reviewsService.findByProduct(productId);
  }

  @Get('user')
  @ApiOperation({ summary: 'Lấy đánh giá của user' })
  @ApiQuery({ name: 'userId', required: true })
  findByUser(@Query('userId') userId: string) {
    return this.reviewsService.findByUser(userId);
  }

  @Get('check')
  @ApiOperation({ summary: 'Kiểm tra user đã đánh giá sản phẩm chưa' })
  @ApiQuery({ name: 'userId', required: true })
  @ApiQuery({ name: 'productId', required: true })
  checkReviewed(
    @Query('userId') userId: string,
    @Query('productId') productId: string,
  ) {
    return this.reviewsService.checkUserReviewed(userId, productId);
  }
}
