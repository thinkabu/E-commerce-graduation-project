import {
  IsString,
  IsOptional,
  IsMongoId,
  IsInt,
  Min,
  MaxLength,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Điện thoại' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'dien-thoai' })
  @IsString()
  @MaxLength(100)
  slug: string;

  @ApiPropertyOptional({ example: 'Danh mục điện thoại di động' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'https://res.cloudinary.com/...' })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({ description: 'ID danh mục cha (null = root)' })
  @IsOptional()
  @IsMongoId()
  parentId?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  level?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
