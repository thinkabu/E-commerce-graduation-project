import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  Notification,
  NotificationDocument,
} from './schemas/notification.schema';
import { UsersService } from '../users/users.service';
import { NotificationType } from '../../common/enums';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const CHUNK_SIZE = 100; // Expo cho phép tối đa 100 messages / request

export interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: 'default' | null;
  badge?: number;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
    private readonly usersService: UsersService,
    private readonly httpService: HttpService,
  ) {}

  // ── Internal: Gửi Push qua Expo API ──────────────────────────────

  private async sendExpoPush(
    tokens: string[],
    payload: PushPayload,
  ): Promise<void> {
    if (!tokens || tokens.length === 0) return;

    // Lọc token hợp lệ (phải bắt đầu bằng ExponentPushToken)
    const validTokens = tokens.filter((t) => t.startsWith('ExponentPushToken'));
    if (validTokens.length === 0) return;

    // Chia thành chunks để tránh vượt giới hạn Expo API
    const chunks: string[][] = [];
    for (let i = 0; i < validTokens.length; i += CHUNK_SIZE) {
      chunks.push(validTokens.slice(i, i + CHUNK_SIZE));
    }

    for (const chunk of chunks) {
      const messages = chunk.map((token) => ({
        to: token,
        sound: payload.sound ?? 'default',
        title: payload.title,
        body: payload.body,
        data: payload.data ?? {},
        badge: payload.badge,
      }));

      try {
        const response = await firstValueFrom(
          this.httpService.post(EXPO_PUSH_URL, messages, {
            headers: {
              Accept: 'application/json',
              'Accept-Encoding': 'gzip, deflate',
              'Content-Type': 'application/json',
            },
          }),
        );
        this.logger.log(
          `✅ Gửi push thành công: ${chunk.length} tokens | Status: ${response.status}`,
        );
      } catch (error: any) {
        this.logger.error(
          `❌ Lỗi gửi Expo push: ${error?.message}`,
          error?.response?.data,
        );
      }
    }
  }

  // ── Public: Gửi Push đến 1 User ──────────────────────────────────

  async sendToUser(userId: string, payload: PushPayload): Promise<void> {
    const tokens = await this.usersService.getExpoPushTokens(userId);
    await this.sendExpoPush(tokens, payload);
  }

  // ── Public: Gửi Push đến nhiều Users ─────────────────────────────

  async sendToMany(
    userIds: string[],
    payload: PushPayload,
  ): Promise<{ sentCount: number }> {
    const allTokens: string[] = [];
    for (const userId of userIds) {
      const tokens = await this.usersService.getExpoPushTokens(userId);
      allTokens.push(...tokens);
    }
    await this.sendExpoPush(allTokens, payload);
    return { sentCount: allTokens.length };
  }

  // ── Public: Gửi Push đến TẤT CẢ Users có token ───────────────────

  async sendToAll(payload: PushPayload): Promise<{ sentCount: number }> {
    // Query trực tiếp vào collection users để tối ưu (không N+1 query)
    const users = await this.notificationModel.db
      .collection('users')
      .find(
        { expoPushTokens: { $exists: true, $not: { $size: 0 } } },
        { projection: { expoPushTokens: 1 } },
      )
      .toArray();

    const allTokens: string[] = users.flatMap(
      (u: any) => u.expoPushTokens ?? [],
    );

    await this.sendExpoPush(allTokens, payload);
    return { sentCount: allTokens.length };
  }

  // ── Lưu thông báo vào MongoDB ─────────────────────────────────────

  async saveNotification(
    userId: string,
    title: string,
    body: string,
    type: NotificationType,
    data?: Record<string, any>,
  ): Promise<NotificationDocument> {
    const notif = await this.notificationModel.create({
      userId: new Types.ObjectId(userId),
      title,
      body,
      type,
      // Map free-form data vào các field có sẵn trong NotificationData schema
      data: {
        orderId: data?.orderId ? new Types.ObjectId(data.orderId) : undefined,
        productId: data?.productId
          ? new Types.ObjectId(data.productId)
          : undefined,
        txHash: data?.txHash,
        deepLink: data?.deepLink,
      },
      isRead: false,
    });
    return notif;
  }

  async saveNotificationToAll(
    title: string,
    body: string,
    type: NotificationType,
    data?: Record<string, any>,
  ): Promise<{ savedCount: number }> {
    const users = await this.notificationModel.db
      .collection('users')
      .find({}, { projection: { _id: 1 } })
      .toArray();

    if (users.length === 0) return { savedCount: 0 };

    const notifications = users.map((u) => ({
      userId: u._id,
      title,
      body,
      type,
      data: {
        orderId: data?.orderId ? new Types.ObjectId(data.orderId) : undefined,
        productId: data?.productId
          ? new Types.ObjectId(data.productId)
          : undefined,
        txHash: data?.txHash,
        deepLink: data?.deepLink,
      },
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await this.notificationModel.insertMany(notifications);
    return { savedCount: users.length };
  }

  // ── Gửi Push + Lưu MongoDB (dùng nhiều nhất) ─────────────────────

  async sendAndSave(
    userId: string,
    title: string,
    body: string,
    type: NotificationType,
    data?: Record<string, any>,
  ): Promise<void> {
    // Chạy song song: gửi push + lưu DB
    await Promise.all([
      this.sendToUser(userId, { title, body, data }),
      this.saveNotification(userId, title, body, type, data),
    ]);
  }

  // ── CRUD Notifications ────────────────────────────────────────────

  async findByUser(
    userId: string,
    page = 1,
    limit = 20,
  ): Promise<{ items: any[]; meta: any }> {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.notificationModel
        .find({ userId: new Types.ObjectId(userId) })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean<any[]>(),
      this.notificationModel.countDocuments({
        userId: new Types.ObjectId(userId),
      }),
    ]);
    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationModel.countDocuments({
      userId: new Types.ObjectId(userId),
      isRead: false,
    });
  }

  async markAsRead(
    notifId: string,
    userId: string,
  ): Promise<{ success: boolean }> {
    await this.notificationModel.updateOne(
      { _id: notifId, userId: new Types.ObjectId(userId) },
      { isRead: true, readAt: new Date() },
    );
    return { success: true };
  }

  async markAllAsRead(userId: string): Promise<{ modifiedCount: number }> {
    const result = await this.notificationModel.updateMany(
      { userId: new Types.ObjectId(userId), isRead: false },
      { isRead: true, readAt: new Date() },
    );
    return { modifiedCount: result.modifiedCount };
  }
}
