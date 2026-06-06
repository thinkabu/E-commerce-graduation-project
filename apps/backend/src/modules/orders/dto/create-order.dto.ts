import {
  IsString,
  IsArray,
  ValidateNested,
  IsNumber,
  IsOptional,
  IsEnum,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '../../../common/enums';

export class OrderItemDto {
  @ApiProperty({ example: '60d21b4667d0d8992e610c85' })
  @IsString()
  productId: string;

  @ApiPropertyOptional({ example: '60d21b4667d0d8992e610c86' })
  @IsOptional()
  @IsString()
  variantId?: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({ example: '60d21b4667d0d8992e610c85' })
  @IsString()
  shippingAddressId: string;

  @ApiPropertyOptional({ example: '60d21b4667d0d8992e610c85' })
  @IsOptional()
  @IsString()
  couponId?: string;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.COD })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional({ example: 'Giao giờ hành chính' })
  @IsOptional()
  @IsString()
  note?: string;
}
