import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AutoDetectDto {
  @ApiProperty({ example: 0.001 })
  @IsNumber()
  expectedAmount: number;

  @ApiPropertyOptional({ example: 'hardhat' })
  @IsOptional()
  @IsString()
  network?: string;
}
