import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsInt,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AddressType } from '../../../common/enums';

export class LocationInfoDto {
  @ApiProperty({ example: 79 })
  @IsInt()
  code: number;

  @ApiProperty({ example: 'Hồ Chí Minh' })
  @IsString()
  name: string;
}

export class CreateAddressDto {
  @ApiProperty({ example: 'Nguyễn Văn A' })
  @IsString()
  @MaxLength(100)
  fullName: string;

  @ApiProperty({ example: '0901234567' })
  @IsString()
  phone: string;

  @ApiProperty({ type: LocationInfoDto })
  @ValidateNested()
  @Type(() => LocationInfoDto)
  province: LocationInfoDto;

  @ApiProperty({ type: LocationInfoDto })
  @ValidateNested()
  @Type(() => LocationInfoDto)
  district: LocationInfoDto;

  @ApiProperty({ type: LocationInfoDto })
  @ValidateNested()
  @Type(() => LocationInfoDto)
  ward: LocationInfoDto;

  @ApiProperty({ example: '123 Nguyễn Huệ, Phường Bến Nghé' })
  @IsString()
  street: string;

  @ApiPropertyOptional({ enum: AddressType, default: AddressType.HOME })
  @IsOptional()
  @IsEnum(AddressType)
  addressType?: AddressType;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({ example: 'Gần ngã tư' })
  @IsOptional()
  @IsString()
  note?: string;
}
