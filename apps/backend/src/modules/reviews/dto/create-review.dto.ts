import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  Max,
  IsMongoId,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({ description: 'Product ID' })
  @IsMongoId()
  productId: string;

  @ApiProperty({ description: 'Order ID' })
  @IsMongoId()
  orderId: string;

  @ApiProperty({ description: 'Đánh giá từ 1-5 sao', minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({ description: 'Tiêu đề đánh giá' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Nội dung đánh giá' })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiPropertyOptional({ description: 'Ảnh đánh giá (mảng link ảnh)', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}
