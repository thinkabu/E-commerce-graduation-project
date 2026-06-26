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
import * as crypto from 'crypto';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { ProductVariant, ProductVariantDocument } from '../products/schemas/product-variant.schema';
import { Coupon, CouponDocument } from '../coupons/schemas/coupon.schema';
import { PaymentStatus, OrderStatus } from '../../common/enums';
import { Request } from 'express';

@Injectable()
export class VnPayService {
  private readonly logger = new Logger(VnPayService.name);

  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(ProductVariant.name)
    private readonly variantModel: Model<ProductVariantDocument>,
    @InjectModel(Coupon.name)
    private readonly couponModel: Model<CouponDocument>,
    private readonly configService: ConfigService,
  ) {}

  async createVNPayPaymentUrl(userId: string, orderId: string, req: Request) {
    try {
      if (!orderId) {
        throw new BadRequestException('Thiếu thông tin mã đơn hàng');
      }

      const order = await this.orderModel.findById(orderId);
      if (!order) {
        throw new NotFoundException('Không tìm thấy đơn hàng');
      }

      // Kiểm tra quyền sở hữu đơn hàng
      if (order.userId.toString() !== userId) {
        throw new BadRequestException('Bạn không có quyền thanh toán đơn hàng này');
      }

      const tmnCode = this.configService.get<string>('VNPAY_TMN_CODE');
      const secretKey = this.configService.get<string>('VNPAY_HASH_SECRET');
      const vnpUrl =
        this.configService.get<string>('VNPAY_URL') ||
        'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';

      if (!tmnCode || !secretKey) {
        throw new InternalServerErrorException(
          'Cổng thanh toán VNPay chưa được cấu hình đầy đủ trên hệ thống',
        );
      }

      // Xử lý return URL hỗ trợ IP LAN cho thiết bị di động bằng sslip.io
      const protocol = req.protocol === 'https' ? 'https' : 'http';
      let host = req.get('host'); // e.g. 192.168.1.10:3000

      if (host && /^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/.test(host.split(':')[0])) {
        const [ip, port] = host.split(':');
        host = `${ip}.sslip.io${port ? ':' + port : ''}`;
      }
      const returnUrl = `${protocol}://${host}/api/payments/vnpay/return`;

      // Định dạng ngày giờ VNPay: yyyyMMddHHmmss
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      const createDate =
        `${now.getFullYear()}` +
        `${pad(now.getMonth() + 1)}` +
        `${pad(now.getDate())}` +
        `${pad(now.getHours())}` +
        `${pad(now.getMinutes())}` +
        `${pad(now.getSeconds())}`;

      // Tạo mã tham chiếu giao dịch độc nhất
      const txnRef = `${order._id.toString().slice(-8)}_${Date.now()}`;
      const amount = order.totalAmount * 100; // VNPay nhận đơn vị Đồng * 100

      const vnpParams: any = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode: tmnCode,
        vnp_Amount: amount,
        vnp_CurrCode: 'VND',
        vnp_TxnRef: txnRef,
        vnp_OrderInfo: `Thanh toan don hang #${order.orderId} tai Think Heart`,
        vnp_OrderType: 'other',
        vnp_Locale: 'vn',
        vnp_ReturnUrl: returnUrl,
        vnp_IpAddr:
          req.headers['x-forwarded-for'] ||
          req.socket.remoteAddress ||
          '127.0.0.1',
        vnp_CreateDate: createDate,
      };

      // Sắp xếp các tham số VNPay theo thứ tự A-Z
      const sortedKeys = Object.keys(vnpParams).sort();
      const queryStr = sortedKeys
        .map(
          (k) =>
            `${k}=${encodeURIComponent(vnpParams[k]).replace(/%20/g, '+')}`,
        )
        .join('&');

      // Ký mã HMAC-SHA512
      const signature = crypto
        .createHmac('sha512', secretKey)
        .update(queryStr)
        .digest('hex');

      const paymentUrl = `${vnpUrl}?${queryStr}&vnp_SecureHash=${signature}`;

      // Lưu lại transactionId tạm thời
      order.vnpayPayment = {
        transactionId: txnRef,
        orderInfo: vnpParams.vnp_OrderInfo,
      };
      await order.save();

      return { paymentUrl, txnRef };
    } catch (error: any) {
      this.logger.error('❌ Lỗi trong createVNPayPaymentUrl:', error);
      throw error;
    }
  }

  async handleVNPayIPN(query: any) {
    try {
      const vnpParams = { ...query };
      const secureHash = vnpParams.vnp_SecureHash;

      delete vnpParams.vnp_SecureHash;
      delete vnpParams.vnp_SecureHashType;

      const secretKey = this.configService.get<string>('VNPAY_HASH_SECRET');
      if (!secretKey) {
        return { RspCode: '99', Message: 'Server secret key not configured' };
      }

      const sortedKeys = Object.keys(vnpParams).sort();
      const queryStr = sortedKeys
        .map(
          (k) =>
            `${k}=${encodeURIComponent(vnpParams[k]).replace(/%20/g, '+')}`,
        )
        .join('&');

      const calculatedHash = crypto
        .createHmac('sha512', secretKey)
        .update(queryStr)
        .digest('hex');

      if (calculatedHash !== secureHash) {
        this.logger.warn('⚠️ VNPay IPN Chữ ký không hợp lệ');
        return { RspCode: '97', Message: 'Invalid signature' };
      }

      const txnRef = vnpParams.vnp_TxnRef;
      const resultCode = vnpParams.vnp_ResponseCode;

      const order = await this.orderModel.findOne({
        'vnpayPayment.transactionId': txnRef,
      });

      if (!order) {
        return { RspCode: '01', Message: 'Order not found' };
      }

      // Kiểm tra trùng lặp (Idempotency)
      if (order.paymentStatus === PaymentStatus.COMPLETED) {
        return { RspCode: '02', Message: 'Order already paid' };
      }

      if (resultCode === '00') {
        // Cập nhật trạng thái đơn hàng thành công
        order.paymentStatus = PaymentStatus.COMPLETED;
        order.paidAt = new Date();
        order.orderStatus = OrderStatus.CONFIRMED;
        order.vnpayPayment = {
          transactionId: txnRef,
          vnpayTxNo: vnpParams.vnp_TransactionNo,
          bankCode: vnpParams.vnp_BankCode,
          cardType: vnpParams.vnp_CardType,
          payDate: new Date(),
          orderInfo: order.vnpayPayment?.orderInfo,
        };
        await order.save();

        // Cập nhật số lần sử dụng coupon
        if (order.couponId) {
          const coupon = await this.couponModel.findById(order.couponId);
          if (coupon) {
            coupon.usedCount += 1;
            await coupon.save();
          }
        }

        this.logger.log(`🎉 Đơn hàng #${order.orderId} đã được thanh toán thành công qua VNPay`);
        return { RspCode: '00', Message: 'Success' };
      } else {
        this.logger.log(`⚠️ Đơn hàng #${order.orderId} thanh toán không thành công qua VNPay (Mã lỗi: ${resultCode}). Giữ lại trạng thái Chờ thanh toán.`);
        return { RspCode: '00', Message: 'Processed' };
      }
    } catch (error: any) {
      this.logger.error('❌ Lỗi xử lý VNPay IPN:', error);
      return { RspCode: '99', Message: 'Server error: ' + error.message };
    }
  }

  async handleVNPayReturn(query: any) {
    try {
      const vnpParams = { ...query };
      const secureHash = vnpParams.vnp_SecureHash;
      const responseCode = vnpParams.vnp_ResponseCode;
      const txnRef = vnpParams.vnp_TxnRef;

      delete vnpParams.vnp_SecureHash;
      delete vnpParams.vnp_SecureHashType;

      const secretKey = this.configService.get<string>('VNPAY_HASH_SECRET');
      if (!secretKey) {
        throw new InternalServerErrorException(
          'VNPAY_HASH_SECRET chưa được cấu hình trên server',
        );
      }

      const sortedKeys = Object.keys(vnpParams).sort();
      const queryStr = sortedKeys
        .map(
          (k) =>
            `${k}=${encodeURIComponent(vnpParams[k]).replace(/%20/g, '+')}`,
        )
        .join('&');

      const calculatedHash = crypto
        .createHmac('sha512', secretKey)
        .update(queryStr)
        .digest('hex');

      const signatureValid = calculatedHash === secureHash;

      if (signatureValid && txnRef) {
        const order = await this.orderModel.findOne({
          'vnpayPayment.transactionId': txnRef,
        });

        // Backup xử lý nếu IPN bị trễ
        if (order && order.paymentStatus !== PaymentStatus.COMPLETED) {
          if (responseCode === '00') {
            order.paymentStatus = PaymentStatus.COMPLETED;
            order.paidAt = new Date();
            order.orderStatus = OrderStatus.CONFIRMED;
            order.vnpayPayment = {
              transactionId: txnRef,
              vnpayTxNo: vnpParams.vnp_TransactionNo || txnRef,
              bankCode: vnpParams.vnp_BankCode,
              cardType: vnpParams.vnp_CardType,
              payDate: new Date(),
              orderInfo: order.vnpayPayment?.orderInfo,
            };
            await order.save();

            // Cập nhật số lần sử dụng coupon
            if (order.couponId) {
              const coupon = await this.couponModel.findById(order.couponId);
              if (coupon) {
                coupon.usedCount += 1;
                await coupon.save();
              }
            }
          } else {
            this.logger.log(`⚠️ VNPay Return nhận mã lỗi: ${responseCode} cho đơn hàng #${order.orderId}. Giữ lại trạng thái Chờ thanh toán.`);
          }
        }
      }

      const isSuccess = responseCode === '00' && signatureValid;
      return {
        isSuccess,
        responseCode,
        orderId: txnRef,
      };
    } catch (error) {
      this.logger.error('❌ Lỗi xử lý VNPay Return:', error);
      throw error;
    }
  }
}
