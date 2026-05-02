export interface IAdminReply {
    content: string;
    repliedAt: string;
}
export interface IReview {
    _id: string;
    userId: string;
    productId: string;
    orderId: string;
    rating: number;
    title?: string;
    comment?: string;
    images: string[];
    isVerifiedPurchase: boolean;
    helpfulCount: number;
    adminReply?: IAdminReply;
    createdAt: string;
    updatedAt: string;
}
//# sourceMappingURL=review.types.d.ts.map