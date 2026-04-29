import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  IsEnum,
  IsInt,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StockStatus } from '../../../common/enums';

export class VariantAttributeDto {
  @ApiProperty({ example: 'color' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Đen' })
  @IsString()
  value: string;
}

export class CreateVariantDto {
  @ApiProperty({ example: 'IP15-BLK-128' })
  @IsString()
  sku: string;

  @ApiProperty({ example: 'Đen - 128GB' })
  @IsString()
  variantName: string;

  @ApiProperty({ type: [VariantAttributeDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantAttributeDto)
  attributes: VariantAttributeDto[];

  @ApiProperty({ example: 22990000 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ example: 5, minimum: 0, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercentage?: number;

  @ApiPropertyOptional({ example: ['https://res.cloudinary.com/...'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({ example: 50, minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  stockQuantity?: number;

  @ApiPropertyOptional({ enum: StockStatus })
  @IsOptional()
  @IsEnum(StockStatus)
  stockStatus?: StockStatus;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
