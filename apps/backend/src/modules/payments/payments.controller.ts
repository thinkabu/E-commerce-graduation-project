import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CryptoPaymentService } from './crypto-payment.service';
import { VerifyBlockchainDto } from './dto/verify-blockchain.dto';
import { AutoDetectDto } from './dto/auto-detect.dto';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly cryptoPaymentService: CryptoPaymentService) {}

  @Get('crypto-rate')
  @ApiOperation({ summary: 'Lấy tỷ giá crypto thời gian thực' })
  @ApiQuery({ name: 'currency', required: false, example: 'ethereum' })
  async getCryptoExchangeRate(@Query('currency') currency?: string) {
    return this.cryptoPaymentService.getCryptoExchangeRate(
      currency || 'ethereum',
    );
  }

  @Post('verify-blockchain')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Xác thực giao dịch blockchain thủ công qua tx hash',
  })
  @ApiQuery({ name: 'userId', required: false })
  async verifyBlockchainTransaction(
    @Query('userId') userId: string,
    @Body() dto: VerifyBlockchainDto,
  ) {
    return this.cryptoPaymentService.verifyBlockchainTransaction(
      userId,
      dto.transactionHash,
      dto.walletAddress,
      dto.expectedAmount,
      dto.network || 'hardhat',
    );
  }

  @Post('auto-detect-transaction')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Tự động detect giao dịch gửi đến shop' })
  @ApiQuery({ name: 'userId', required: false })
  async autoDetectTransaction(
    @Query('userId') userId: string,
    @Body() dto: AutoDetectDto,
  ) {
    return this.cryptoPaymentService.autoDetectTransaction(
      userId,
      dto.expectedAmount,
      dto.network || 'hardhat',
    );
  }

  @Get('debug-blocks')
  @ApiOperation({ summary: '[DEBUG] Xem transaction trong 5 block gần nhất' })
  async debugBlocks() {
    return this.cryptoPaymentService.debugBlocks();
  }
}
