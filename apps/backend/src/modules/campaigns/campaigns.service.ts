import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Campaign, CampaignDocument } from './schemas/campaign.schema';
import { NotificationsService, PushPayload } from '../notifications/notifications.service';
import { NotificationType } from '../../common/enums';

export interface CreateCampaignDto {
  title: string;
  body: string;
  targetType: 'ALL_USERS' | 'SPECIFIC_USERS';
  targetUserIds?: string[];
  data?: Record<string, any>;
  sendType: 'IMMEDIATE' | 'SCHEDULED';
  scheduledAt?: string;
}

@Injectable()
export class CampaignsService {
  private readonly logger = new Logger(CampaignsService.name);

  constructor(
    @InjectModel(Campaign.name)
    private readonly campaignModel: Model<CampaignDocument>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(dto: CreateCampaignDto, adminId: string): Promise<Campaign> {
    const isScheduled = dto.sendType === 'SCHEDULED' && dto.scheduledAt;

    // 1. Tạo bản ghi Campaign trong DB
    const campaign = await this.campaignModel.create({
      title: dto.title,
      body: dto.body,
      targetType: dto.targetType,
      targetUserIds:
        dto.targetType === 'SPECIFIC_USERS'
          ? (dto.targetUserIds ?? []).map((id) => new Types.ObjectId(id))
          : [],
      data: dto.data ?? {},
      status: isScheduled ? 'SCHEDULED' : 'DRAFT',
      scheduledAt: isScheduled && dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
      sentCount: 0,
      createdBy: new Types.ObjectId(adminId),
    });

    // 2. Thực thi gửi push ngay lập tức nếu không đặt lịch
    if (!isScheduled) {
      try {
        await this.executeCampaign(campaign._id.toString());
      } catch (error: any) {
        this.logger.error(`Lỗi thực thi campaign ${campaign._id}: ${error?.message}`);
        await this.campaignModel.updateOne(
          { _id: campaign._id },
          { status: 'FAILED' },
        );
      }
    } else {
      this.logger.log(
        `📅 Đã lên lịch campaign "${campaign.title}" gửi vào lúc: ${campaign.scheduledAt}`,
      );
    }

    return this.campaignModel.findById(campaign._id).populate('createdBy', 'fullName email').lean() as Promise<Campaign>;
  }

  async executeCampaign(campaignId: string): Promise<void> {
    const campaign = await this.campaignModel.findById(campaignId);
    if (!campaign) throw new NotFoundException('Campaign không tồn tại');

    const payload: PushPayload = {
      title: campaign.title,
      body: campaign.body,
      data: {
        ...campaign.data,
        campaignId: campaign._id.toString(),
        type: 'PROMOTION',
      },
    };

    let sentCount = 0;

    if (campaign.targetType === 'ALL_USERS') {
      const result = await this.notificationsService.sendToAll(payload);
      sentCount = result.sentCount;
    } else {
      const userIds = campaign.targetUserIds.map((id) => id.toString());
      const result = await this.notificationsService.sendToMany(userIds, payload);
      sentCount = result.sentCount;

      // Lưu thông báo in-app cho từng user được chọn
      await Promise.all(
        userIds.map((uid) =>
          this.notificationsService.saveNotification(
            uid,
            campaign.title,
            campaign.body,
            NotificationType.PROMOTION,
            payload.data,
          ),
        ),
      );
    }

    // Nếu gửi ALL_USERS, không lưu notification riêng (quá nhiều)
    // Admin có thể xem sentCount trên Campaign dashboard

    await this.campaignModel.updateOne(
      { _id: campaignId },
      { status: 'SENT', sentCount, sentAt: new Date() },
    );

    this.logger.log(`✅ Campaign "${campaign.title}" đã gửi đến ${sentCount} thiết bị`);
  }

  async findAll(page = 1, limit = 20): Promise<{ data: Campaign[]; total: number }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.campaignModel
        .find()
        .populate('createdBy', 'fullName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.campaignModel.countDocuments(),
    ]);
    return { data, total };
  }

  async findOne(id: string): Promise<Campaign> {
    const campaign = await this.campaignModel
      .findById(id)
      .populate('createdBy', 'fullName email')
      .lean();
    if (!campaign) throw new NotFoundException('Campaign không tồn tại');
    return campaign;
  }

  // ── Cron Job quét campaign đã lên lịch ───────────────────────────
  @Cron(CronExpression.EVERY_MINUTE)
  async handleScheduledCampaigns() {
    const now = new Date();
    const pendingCampaigns = await this.campaignModel.find({
      status: 'SCHEDULED',
      scheduledAt: { $lte: now },
    });

    if (pendingCampaigns.length > 0) {
      this.logger.log(`Tìm thấy ${pendingCampaigns.length} campaign(s) đã đến lịch gửi.`);
    }

    for (const campaign of pendingCampaigns) {
      try {
        this.logger.log(`Bắt đầu thực thi campaign lên lịch: "${campaign.title}" (${campaign._id})`);
        await this.executeCampaign(campaign._id.toString());
      } catch (error: any) {
        this.logger.error(`Lỗi thực thi campaign lên lịch ${campaign._id}: ${error?.message}`);
        await this.campaignModel.updateOne(
          { _id: campaign._id },
          { status: 'FAILED' },
        );
      }
    }
  }
}
