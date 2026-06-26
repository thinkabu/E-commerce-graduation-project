import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  HttpCode,
  HttpStatus,
  Req,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CryptoPaymentService } from './crypto-payment.service';
import { VnPayService } from './vnpay.service';
import { VerifyBlockchainDto } from './dto/verify-blockchain.dto';
import { AutoDetectDto } from './dto/auto-detect.dto';
import { CreateVnPayDto } from './dto/create-vnpay.dto';
import { Request, Response } from 'express';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly cryptoPaymentService: CryptoPaymentService,
    private readonly vnPayService: VnPayService,
  ) {}

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

  @Post('vnpay/create')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Tạo link thanh toán VNPay' })
  @ApiQuery({ name: 'userId', required: true })
  async createVNPayPayment(
    @Query('userId') userId: string,
    @Body() dto: CreateVnPayDto,
    @Req() req: Request,
  ) {
    return this.vnPayService.createVNPayPaymentUrl(userId, dto.orderId, req);
  }

  @Get('vnpay/ipn')
  @ApiOperation({ summary: 'VNPay IPN (Server-to-Server) Callback' })
  async handleVNPayIPN(@Query() query: any, @Res() res: Response) {
    const result = await this.vnPayService.handleVNPayIPN(query);
    return res.json(result);
  }

  @Get('vnpay/return')
  @ApiOperation({ summary: 'VNPay Redirect Return URL' })
  async handleVNPayReturn(@Query() query: any, @Res() res: Response) {
    const result = await this.vnPayService.handleVNPayReturn(query);

    const isSuccess = result.isSuccess;
    const statusText = isSuccess ? 'Thanh toán thành công! 🎉' : 'Giao dịch thất bại ⚠️';
    const statusColor = isSuccess ? '#16a34a' : '#dc2626';
    const statusBg = isSuccess ? '#f0fdf4' : '#fef2f2';
    const icon = isSuccess ? '🎉' : '⚠️';
    const bodyMsg = isSuccess
      ? 'Giao dịch của bạn đã được ghi nhận thành công.<br/>Vui lòng quay lại ứng dụng để kiểm tra kết quả.'
      : 'Giao dịch thất bại hoặc bị hủy.<br/>Vui lòng quay lại ứng dụng để thử lại.';

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(`<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>${statusText}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
         background:${statusBg};min-height:100vh;display:flex;
         align-items:center;justify-content:center;padding:24px}
    .card{background:#fff;border-radius:24px;padding:48px 32px;max-width:400px;
          width:100%;text-align:center;box-shadow:0 8px 32px rgba(0,0,0,0.10)}
    .icon{font-size:72px;margin-bottom:20px}
    h1{font-size:22px;font-weight:700;color:${statusColor};margin-bottom:16px}
    p{color:#6b7280;font-size:15px;line-height:1.7;margin-bottom:0}
    .hint{margin-top:32px;background:#f3f4f6;border-radius:14px;padding:16px 20px;
          color:#374151;font-size:14px;line-height:1.6}
    .hint strong{color:#111827}
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${icon}</div>
    <h1>${statusText}</h1>
    <p>${bodyMsg}</p>
    <div class="hint">
      📱 Bạn có thể đóng trình duyệt này và quay lại ứng dụng <strong>Think Heart</strong> của mình.
    </div>
  </div>
</body>
</html>`);
  }
}
