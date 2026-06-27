import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  CryptoTransaction,
  CryptoTransactionDocument,
} from './schemas/crypto-transaction.schema';
import { CryptoTxStatus } from '../../common/enums';
import axios from 'axios';
import { ethers } from 'ethers';

@Injectable()
export class CryptoPaymentService {
  private readonly logger = new Logger(CryptoPaymentService.name);

  constructor(
    @InjectModel(CryptoTransaction.name)
    private readonly cryptoTransactionModel: Model<CryptoTransactionDocument>,
    private readonly configService: ConfigService,
  ) {}

  // Kết nối đến Hardhat local blockchain node (luôn dùng 127.0.0.1:8545)
  private async getHardhatProvider(): Promise<ethers.JsonRpcProvider> {
    const rpcUrl =
      this.configService.get<string>('HARDHAT_RPC_URL') ||
      'http://127.0.0.1:8545';
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    try {
      await provider.getBlockNumber();
    } catch {
      throw new BadRequestException(
        `Không thể kết nối đến Hardhat local node (${rpcUrl}). Hãy chắc chắn lệnh "pnpm blockchain:start" đang chạy.`,
      );
    }
    return provider;
  }

  // Lấy tỷ giá VND/Crypto từ Binance API
  async getCryptoExchangeRate(currency = 'ethereum') {
    try {
      const symbolMap = {
        ethereum: 'ETHUSDT',
        bitcoin: 'BTCUSDT',
      };

      const symbol = symbolMap[currency.toLowerCase()] || 'ETHUSDT';

      // Lấy giá crypto từ Binance qua API URL cấu hình trong .env
      const binancePriceUrl =
        this.configService.get<string>('BINANCE_PRICE_API_URL') ||
        'https://api.binance.com/api/v3/ticker/price';

      const cryptoResponse = await axios.get(binancePriceUrl, {
        params: { symbol },
        timeout: 10000,
      });

      const cryptoPrice = parseFloat(cryptoResponse.data.price);

      // Lấy tỷ giá USD/VND thời gian thực từ API cấu hình trong .env
      let usdToVnd = 25400; // Giá trị fallback mặc định
      try {
        const exchangeRateUrl =
          this.configService.get<string>('EXCHANGE_RATE_API_URL') ||
          'https://open.er-api.com/v6/latest/USD';

        const exchangeResponse = await axios.get(exchangeRateUrl, {
          timeout: 5000,
        });
        if (
          exchangeResponse.data &&
          exchangeResponse.data.rates &&
          exchangeResponse.data.rates.VND
        ) {
          usdToVnd = parseFloat(exchangeResponse.data.rates.VND);
        }
      } catch (apiError: any) {
        console.warn(
          '⚠️ Không thể lấy tỷ giá USD/VND trực tuyến, sử dụng tỷ giá mặc định:',
          apiError.message,
        );
      }

      const vndRate = Math.round(cryptoPrice * usdToVnd);

      return {
        currency: currency.toUpperCase(),
        symbol: currency.toLowerCase() === 'ethereum' ? 'ETH' : 'BTC',
        vndRate,
        usdRate: cryptoPrice,
        lastUpdated: new Date(),
        source: 'Binance',
      };
    } catch (error: any) {
      throw new InternalServerErrorException(
        'Lỗi khi lấy tỷ giá crypto: ' + error.message,
      );
    }
  }

  // Xác thực giao dịch Blockchain thủ công qua TX hash
  async verifyBlockchainTransaction(
    userId: string,
    transactionHash: string,
    walletAddress?: string,
    expectedAmount?: number,
    network = 'hardhat',
  ) {
    // 1. Kiểm tra xem transaction hash đã tồn tại trong DB chưa để tránh double spend
    const existingTx = await this.cryptoTransactionModel.findOne({
      txHash: transactionHash,
    });
    if (existingTx && existingTx.status === CryptoTxStatus.CONFIRMED) {
      throw new BadRequestException('Giao dịch đã được xác thực trước đó');
    }

    // 2. Validate format hash
    const isValidHash = /^0x[a-fA-F0-9]{64}$/.test(transactionHash);
    if (!isValidHash) {
      throw new BadRequestException('Transaction hash không hợp lệ');
    }

    const isPlaceholder =
      !walletAddress ||
      walletAddress === '0x0000000000000000000000000000000000000000';

    // 3. Merchant wallet address từ env
    const merchantWallet = this.configService.get<string>(
      'MERCHANT_WALLET_ADDRESS',
    );
    if (!merchantWallet) {
      throw new InternalServerErrorException(
        'Merchant wallet chưa được cấu hình trên hệ thống',
      );
    }

    // 4. Kết nối đến Hardhat local node (luôn dùng 127.0.0.1:8545)
    const provider = await this.getHardhatProvider();

    // Lấy transaction từ blockchain
    let transaction: any;
    try {
      transaction = await provider.getTransaction(transactionHash);
    } catch (err: any) {
      throw new BadRequestException(
        'Lỗi kết nối hoặc không tìm thấy giao dịch trên blockchain',
      );
    }

    if (!transaction) {
      throw new NotFoundException(
        'Không tìm thấy giao dịch. Vui lòng đợi transaction được confirm.',
      );
    }

    // Lấy transaction receipt để kiểm tra status
    const receipt = await provider.getTransactionReceipt(transactionHash);
    if (!receipt) {
      throw new BadRequestException(
        'Giao dịch chưa được confirm. Vui lòng đợi.',
      );
    }

    // Kiểm tra transaction có thành công không
    if (receipt.status !== 1) {
      throw new BadRequestException('Giao dịch thất bại trên blockchain');
    }

    // Validate transaction details
    const txFrom = transaction.from?.toLowerCase();
    const txTo = transaction.to?.toLowerCase();
    const txValue = transaction.value;

    // Kiểm tra địa chỉ gửi (skip if placeholder)
    if (!isPlaceholder && txFrom !== walletAddress.toLowerCase()) {
      throw new BadRequestException('Địa chỉ ví gửi không khớp');
    }

    // Kiểm tra địa chỉ nhận
    if (txTo !== merchantWallet.toLowerCase()) {
      throw new BadRequestException('Địa chỉ ví nhận không đúng');
    }

    // Kiểm tra số tiền (cho phép sai lệch nhỏ 0.0001 ETH)
    const txValueInEth = parseFloat(ethers.formatEther(txValue));
    if (expectedAmount !== undefined) {
      const expectedAmountNum = parseFloat(expectedAmount.toString());
      const tolerance = 0.00001; // Tăng độ chính xác lên 6 chữ số thập phân (khớp với mobile app)
      if (Math.abs(txValueInEth - expectedAmountNum) > tolerance) {
        throw new BadRequestException(
          `Số tiền không khớp. Nhận: ${txValueInEth} ETH, Mong đợi: ${expectedAmountNum} ETH`,
        );
      }
    }

    // Kiểm tra số lượng confirmations
    const currentBlock = await provider.getBlockNumber();
    const confirmations = currentBlock - receipt.blockNumber + 1;
    if (confirmations < 1) {
      throw new BadRequestException(
        'Giao dịch chưa được confirm. Vui lòng đợi thêm.',
      );
    }

    // Lưu thông tin giao dịch vào DB
    const rateData = await this.getCryptoExchangeRate('ethereum');
    const amountInFiat = Math.round(txValueInEth * rateData.vndRate);

    let txRecord = existingTx;
    if (!txRecord) {
      txRecord = new this.cryptoTransactionModel({
        txHash: transactionHash,
        userId: userId ? new Types.ObjectId(userId) : undefined,
        fromAddress: txFrom,
        toAddress: txTo,
        amountInWei: txValue.toString(),
        amountInEth: txValueInEth,
        amountInFiat,
        fiatCurrency: 'VND',
        exchangeRate: rateData.vndRate,
        gasUsed: Number(receipt.gasUsed),
        gasPrice: transaction.gasPrice ? transaction.gasPrice.toString() : '0',
        networkId: 31337,
        networkName: network,
        blockNumber: receipt.blockNumber,
        status: CryptoTxStatus.CONFIRMED,
        confirmations,
      });
      await txRecord.save();
    } else {
      txRecord.status = CryptoTxStatus.CONFIRMED;
      txRecord.confirmations = confirmations;
      await txRecord.save();
    }

    return {
      verified: true,
      transaction: {
        hash: transactionHash,
        from: txFrom,
        to: txTo,
        value: txValueInEth,
        valueWei: txValue.toString(),
        status: 'success',
        confirmations,
        blockNumber: receipt.blockNumber,
        network,
      },
      verifiedAt: new Date(),
    };
  }

  // Quét các block gần nhất để tìm giao dịch phù hợp (helper)
  private async scanBlocks(
    provider: ethers.JsonRpcProvider,
    merchantWallet: string,
    expectedAmountNum: number,
    tolerance: number,
  ): Promise<null | {
    txHash: string;
    tx: any;
    receipt: any;
    txValueInEth: number;
    confirmations: number;
  }> {
    const currentBlock = await provider.getBlockNumber();
    const startBlock = Math.max(0, currentBlock - 50); // Quét 50 block gần nhất

    this.logger.log(
      `🔍 Scanning blocks ${startBlock}–${currentBlock} for ${expectedAmountNum} ETH → ${merchantWallet.slice(0, 10)}...`,
    );

    for (let blockNum = currentBlock; blockNum >= startBlock; blockNum--) {
      // Lấy block với danh sách hash transaction (cách đáng tin cậy trên Hardhat)
      const block = await provider.getBlock(blockNum);
      if (!block) continue;

      const txHashes: string[] = block.transactions as string[];
      if (!txHashes || txHashes.length === 0) continue;

      this.logger.debug(`  Block #${blockNum}: ${txHashes.length} transactions`);

      for (const txHash of txHashes) {
        const tx = await provider.getTransaction(txHash);
        if (!tx) continue;

        const txTo = tx.to?.toLowerCase();
        this.logger.debug(`    TX ${txHash.slice(0, 10)}: to=${txTo?.slice(0, 10)} value=${ethers.formatEther(tx.value)} ETH`);

        if (txTo !== merchantWallet.toLowerCase()) continue;

        const txValueInEth = parseFloat(ethers.formatEther(tx.value));
        const diff = Math.abs(txValueInEth - expectedAmountNum);

        this.logger.log(`  ✔ Gửi đến merchant! Giá trị: ${txValueInEth} ETH, cần: ${expectedAmountNum} ETH, diff: ${diff}`);

        if (diff > tolerance) {
          this.logger.warn(`  ✗ Số tiền không khớp (diff=${diff} > tolerance=${tolerance})`);
          continue;
        }

        // Kiểm tra giao dịch đã được xử lý chưa
        const existingTx = await this.cryptoTransactionModel.findOne({ txHash });
        if (existingTx && existingTx.status === CryptoTxStatus.CONFIRMED) {
          this.logger.warn(`  ✗ TX ${txHash.slice(0, 10)} đã được xác thực trước đó`);
          continue;
        }

        const receipt = await provider.getTransactionReceipt(txHash);
        if (!receipt || receipt.status !== 1) {
          this.logger.warn(`  ✗ TX ${txHash.slice(0, 10)} chưa confirmed (receipt.status=${receipt?.status})`);
          continue;
        }

        const confirmations = currentBlock - receipt.blockNumber + 1;
        this.logger.log(`  ✅ Tìm thấy TX hợp lệ: ${txHash} (${confirmations} confirmations)`);
        return { txHash, tx, receipt, txValueInEth, confirmations };
      }
    }

    this.logger.log(`  ❌ Không tìm thấy TX phù hợp trong blocks ${startBlock}–${currentBlock}`);
    return null;
  }

  // Tự động detect transaction — backend tự polling blockchain (10 lần × 3 giây)
  async autoDetectTransaction(
    userId: string,
    expectedAmount: number,
    network = 'hardhat',
  ) {
    const merchantWallet = this.configService.get<string>(
      'MERCHANT_WALLET_ADDRESS',
    );
    if (!merchantWallet) {
      throw new InternalServerErrorException(
        'Merchant wallet chưa được cấu hình',
      );
    }

    // Kết nối Hardhat local qua RPC (luôn dùng 127.0.0.1:8545)
    const provider = await this.getHardhatProvider();

    const expectedAmountNum = parseFloat(expectedAmount.toString());
    const tolerance = 0.0001; // Cho phép sai lệch nhỏ (0.0001 ETH) để tránh lỗi làm tròn
    const maxAttempts = 15; // 15 lần × 3 giây = tối đa 45 giây
    const delayMs = 3000;

    this.logger.log(
      `🚀 Auto-detect bắt đầu: userId=${userId}, cần ${expectedAmountNum} ETH, mạng=${network}`,
    );

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      this.logger.log(`[Lần ${attempt}/${maxAttempts}] Bắt đầu quét blockchain...`);

      const found = await this.scanBlocks(
        provider,
        merchantWallet,
        expectedAmountNum,
        tolerance,
      );

      if (found) {
        const { txHash, tx, receipt, txValueInEth, confirmations } = found;

        // Lưu giao dịch vào DB
        const rateData = await this.getCryptoExchangeRate('ethereum');
        const amountInFiat = Math.round(txValueInEth * rateData.vndRate);

        const txRecord = new this.cryptoTransactionModel({
          txHash,
          userId: userId ? new Types.ObjectId(userId) : undefined,
          fromAddress: tx.from?.toLowerCase(),
          toAddress: tx.to?.toLowerCase(),
          amountInWei: tx.value.toString(),
          amountInEth: txValueInEth,
          amountInFiat,
          fiatCurrency: 'VND',
          exchangeRate: rateData.vndRate,
          gasUsed: Number(receipt.gasUsed),
          gasPrice: tx.gasPrice ? tx.gasPrice.toString() : '0',
          networkId: 31337,
          networkName: network,
          blockNumber: receipt.blockNumber,
          status: CryptoTxStatus.CONFIRMED,
          confirmations,
        });
        await txRecord.save();

        return {
          verified: true,
          transaction: {
            hash: txHash,
            from: tx.from?.toLowerCase(),
            to: tx.to?.toLowerCase(),
            value: txValueInEth,
            valueWei: tx.value.toString(),
            status: 'success',
            confirmations,
            blockNumber: receipt.blockNumber,
            network,
          },
          verifiedAt: new Date(),
          attempt,
        };
      }

      // Chưa tìm thấy — chờ trước khi quét lại (trừ lần cuối)
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    throw new NotFoundException(
      `Không tìm thấy giao dịch sau ${maxAttempts} lần quét (${(maxAttempts * delayMs) / 1000} giây). Vui lòng nhập TX hash thủ công.`,
    );
  }

  // [DEBUG] Xem nội dung 10 block gần nhất - dùng để kiểm tra backend có thấy TX không
  async debugBlocks() {
    const provider = await this.getHardhatProvider();
    const currentBlock = await provider.getBlockNumber();
    const startBlock = Math.max(0, currentBlock - 10);
    const result: any[] = [];

    for (let blockNum = currentBlock; blockNum >= startBlock; blockNum--) {
      const block = await provider.getBlock(blockNum);
      if (!block) continue;

      const txHashes: string[] = block.transactions as string[];
      const txDetails: any[] = [];

      for (const txHash of txHashes) {
        const tx = await provider.getTransaction(txHash);
        if (tx) {
          txDetails.push({
            hash: tx.hash,
            from: tx.from,
            to: tx.to,
            value: ethers.formatEther(tx.value) + ' ETH',
            valueWei: tx.value.toString(),
          });
        }
      }

      result.push({
        blockNumber: blockNum,
        txCount: txHashes.length,
        transactions: txDetails,
      });
    }

    return {
      currentBlock,
      scannedRange: `${startBlock}–${currentBlock}`,
      merchantWallet: this.configService.get<string>('MERCHANT_WALLET_ADDRESS'),
      blocks: result,
    };
  }
}
