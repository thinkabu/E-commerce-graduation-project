import {
  IsString,
  IsOptional,
  IsMongoId,
  IsNumber,
  IsBoolean,
  IsArray,
  IsEnum,
  Min,
  Max,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ImportStatus } from '../../../common/enums';
import { CreateVariantDto } from './create-variant.dto';

export class CreateProductDto {
  @ApiProperty({ example: 'iPhone 15 Pro Max' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: 'Apple' })
  @IsString()
  @MaxLength(255)
  manufacturer: string;

  @ApiProperty({ example: 'IP15-PRO-MAX', description: 'SKU chính (unique)' })
  @IsString()
  productId: string;

  @ApiProperty({ description: 'Category ObjectId' })
  @IsMongoId()
  categoryId: string;

  @ApiProperty({ example: 'iphone-15-pro-max' })
  @IsString()
  slug: string;

  @ApiPropertyOptional({ example: ['smartphone', 'apple', 'iphone'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ example: ['https://res.cloudinary.com/...'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiProperty({ example: 34990000 })
  @IsNumber()
  @Min(0)
  basePrice: number;

  @ApiPropertyOptional({ enum: ['VND', 'USD'], default: 'VND' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ example: 10, minimum: 0, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercentage?: number;

  @ApiPropertyOptional({ example: 'Smartphone cao cấp của Apple' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: ImportStatus })
  @IsOptional()
  @IsEnum(ImportStatus)
  importStatus?: ImportStatus;

  @ApiProperty({ example: 'Mỹ' })
  @IsString()
  @MaxLength(100)
  countryOfOrigin: string;

  @ApiPropertyOptional()
  @IsOptional()
  releaseDate?: Date;

  @ApiPropertyOptional({ example: '12 tháng' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  warrantyLength?: string;

  @ApiPropertyOptional({
    example: { processor: 'A17 Pro', ram: '8GB', storage: '256GB' },
  })
  @IsOptional()
  specifications?: Record<string, any>;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  hasVariants?: boolean;

  @ApiPropertyOptional({ example: ['color', 'storage'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  variantAttributes?: string[];

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  // Cho phép tạo variants cùng lúc khi tạo product
  @ApiPropertyOptional({ type: [CreateVariantDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVariantDto)
  variants?: CreateVariantDto[];
}
