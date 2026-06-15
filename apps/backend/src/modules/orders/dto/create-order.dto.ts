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

export class BlockchainPaymentDto {
  @ApiProperty({ example: '0x1234abcd...' })
  @IsString()
  transactionHash: string;

  @ApiProperty({ example: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266' })
  @IsString()
  walletAddress: string;

  @ApiProperty({ example: 0.0012 })
  @IsNumber()
  cryptoAmount: number;

  @ApiPropertyOptional({ example: 'ETH' })
  @IsOptional()
  @IsString()
  cryptoSymbol?: string;

  @ApiProperty({ example: 63000000 })
  @IsNumber()
  exchangeRate: number;

  @ApiPropertyOptional({ example: 'hardhat' })
  @IsOptional()
  @IsString()
  network?: string;
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

  @ApiPropertyOptional({ type: BlockchainPaymentDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => BlockchainPaymentDto)
  blockchainPayment?: BlockchainPaymentDto;

  @ApiPropertyOptional({ example: 'Giao giờ hành chính' })
  @IsOptional()
  @IsString()
  note?: string;
}
