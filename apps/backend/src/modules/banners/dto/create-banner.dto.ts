import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsDateString,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBannerDto {
  @ApiProperty({ example: 'Flash Sale 50%' })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({ example: 'Giảm giá cực sốc tuần này' })
  @IsOptional()
  @IsString()
  subtitle?: string;

  @ApiProperty({ example: 'https://res.cloudinary.com/...' })
  @IsString()
  image: string;

  @ApiPropertyOptional({ example: '/category/sale' })
  @IsOptional()
  @IsString()
  link?: string;

  @ApiPropertyOptional({ example: 0, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  position?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: '2026-05-01T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-06-01T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
