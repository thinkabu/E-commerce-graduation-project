import { IsString, IsNumber, IsOptional, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VerifyBlockchainDto {
  @ApiProperty({ example: '0x1234abcd...' })
  @IsString()
  @Matches(/^0x[a-fA-F0-9]{64}$/, {
    message: 'Transaction hash không hợp lệ',
  })
  transactionHash: string;

  @ApiPropertyOptional({
    example: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  })
  @IsOptional()
  @IsString()
  walletAddress?: string;

  @ApiProperty({ example: 0.001 })
  @IsNumber()
  expectedAmount: number;

  @ApiPropertyOptional({ example: 'hardhat' })
  @IsOptional()
  @IsString()
  network?: string;
}
