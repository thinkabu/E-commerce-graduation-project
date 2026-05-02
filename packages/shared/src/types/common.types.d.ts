import { CouponDiscountType, NotificationType } from '../constants/enums';
export interface ICoupon {
    _id: string;
    code: string;
    description?: string;
    discountType: CouponDiscountType;
    discountValue: number;
    minOrderAmount: number;
    maxDiscountAmount?: number;
    usageLimit?: number;
    usedCount: number;
    usageLimitPerUser: number;
    applicableCategories: string[];
    applicableProducts: string[];
    startDate: string;
    endDate: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
export interface INotificationData {
    orderId?: string;
    productId?: string;
    txHash?: string;
    conversationId?: string;
    deepLink?: string;
}
export interface INotification {
    _id: string;
    userId: string;
    title: string;
    body: string;
    type: NotificationType;
    data: INotificationData;
    isRead: boolean;
    readAt?: string;
    createdAt: string;
    updatedAt: string;
}
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: any;
}
export interface IPaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}
export interface IPaginatedResponse<T> {
    items: T[];
    meta: IPaginationMeta;
}
//# sourceMappingURL=common.types.d.ts.map