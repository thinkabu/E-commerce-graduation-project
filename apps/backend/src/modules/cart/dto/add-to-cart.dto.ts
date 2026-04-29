import { IsMongoId, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddToCartDto {
  @ApiProperty({ description: 'Product ID' })
  @IsMongoId()
  productId: string;

  @ApiPropertyOptional({ description: 'Variant ID (nếu sản phẩm có biến thể)' })
  @IsOptional()
  @IsMongoId()
  variantId?: string;

  @ApiProperty({ example: 1, minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;
}
