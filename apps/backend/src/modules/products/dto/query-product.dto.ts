import { IsOptional, IsString, IsMongoId, IsNumber, IsArray, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class QueryProductDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Tìm kiếm theo tên, mô tả, tags' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Lọc theo category ID' })
  @IsOptional()
  @IsMongoId()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Giá tối thiểu' })
  @IsOptional()
  @IsNumber()
  minPrice?: number;

  @ApiPropertyOptional({ description: 'Giá tối đa' })
  @IsOptional()
  @IsNumber()
  maxPrice?: number;

  @ApiPropertyOptional({
    description: 'Lọc theo tags (comma-separated)',
    example: 'smartphone,apple',
  })
  @IsOptional()
  @IsString()
  tags?: string;

  @ApiPropertyOptional({ description: 'Lọc theo nhà sản xuất' })
  @IsOptional()
  @IsString()
  manufacturer?: string;

  @ApiPropertyOptional({ description: 'Chỉ sản phẩm nổi bật', default: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;
}
