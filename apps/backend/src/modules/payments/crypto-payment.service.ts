import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
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
  constructor(
    @InjectModel(CryptoTransaction.name)
    private readonly cryptoTransactionModel: Model<CryptoTransactionDocument>,
    private readonly configService: ConfigService,
  ) {}

  // Lấy tỷ giá VND/Crypto từ Binance API
  async getCryptoExchangeRate(currency = 'ethereum') {
    try {
      const symbolMap = {
        ethereum: 'ETHUSDT',
        bitcoin: 'BTCUSDT',
      };

      const symbol = symbolMap[currency.toLowerCase()] || 'ETHUSDT';

      // Lấy giá crypto từ Binance
      const cryptoResponse = await axios.get(
        `https://api.binance.com/api/v3/ticker/price`,
        {
          params: { symbol },
          timeout: 10000,
        },
      );

      const cryptoPrice = parseFloat(cryptoResponse.data.price);

      // Lấy tỷ giá USD/VND thời gian thực từ API công khai (không cần API key)
      let usdToVnd = 25400; // Giá trị fallback mặc định
      try {
        const exchangeResponse = await axios.get(
          'https://open.er-api.com/v6/latest/USD',
          { timeout: 5000 },
        );
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

    // 4. Kết nối đến Hardhat local node
    const hardhatUrl =
      this.configService.get<string>('HARDHAT_RPC_URL') ||
      'http://127.0.0.1:8545';
    const provider = new ethers.JsonRpcProvider(hardhatUrl);

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
      const tolerance = 0.0001;
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

  // Tự động detect transaction trong 20 blocks gần nhất
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

    const hardhatUrl =
      this.configService.get<string>('HARDHAT_RPC_URL') ||
      'http://127.0.0.1:8545';
    const provider = new ethers.JsonRpcProvider(hardhatUrl);

    let currentBlock: number;
    try {
      currentBlock = await provider.getBlockNumber();
    } catch (err: any) {
      throw new BadRequestException(
        'Không thể kết nối đến local blockchain node',
      );
    }

    const expectedAmountNum = parseFloat(expectedAmount.toString());
    const tolerance = 0.0001;
    const startBlock = Math.max(0, currentBlock - 20);

    for (let blockNum = currentBlock; blockNum >= startBlock; blockNum--) {
      const block = await provider.getBlock(blockNum);
      if (!block || !block.transactions) continue;

      for (const txHash of block.transactions) {
        const tx = await provider.getTransaction(txHash);
        if (!tx) continue;

        const txTo = tx.to?.toLowerCase();
        if (txTo !== merchantWallet.toLowerCase()) continue;

        const txValueInEth = parseFloat(ethers.formatEther(tx.value));
        if (Math.abs(txValueInEth - expectedAmountNum) <= tolerance) {
          // Check if already used
          const existingTx = await this.cryptoTransactionModel.findOne({
            txHash,
          });
          if (existingTx && existingTx.status === CryptoTxStatus.CONFIRMED) {
            continue;
          }

          const receipt = await provider.getTransactionReceipt(txHash);
          if (!receipt || receipt.status !== 1) continue;

          const confirmations = currentBlock - receipt.blockNumber + 1;

          // Save to DB
          const rateData = await this.getCryptoExchangeRate('ethereum');
          const amountInFiat = Math.round(txValueInEth * rateData.vndRate);

          const txRecord = new this.cryptoTransactionModel({
            txHash,
            userId: userId ? new Types.ObjectId(userId) : undefined,
            fromAddress: tx.from?.toLowerCase(),
            toAddress: txTo,
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
              to: txTo,
              value: txValueInEth,
              valueWei: tx.value.toString(),
              status: 'success',
              confirmations,
              blockNumber: receipt.blockNumber,
              network,
            },
            verifiedAt: new Date(),
          };
        }
      }
    }

    throw new NotFoundException(
      'Chưa tìm thấy giao dịch phù hợp. Vui lòng đợi hoặc nhập TX hash thủ công.',
    );
  }
}
