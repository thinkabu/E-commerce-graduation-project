import { ConversationType, ConversationStatus, MessageType } from '../constants/enums';
export interface IParticipant {
    userId: string;
    role: 'buyer' | 'seller' | 'admin';
    joinedAt: string;
    isActive: boolean;
}
export interface ILastMessage {
    content: string;
    senderId: string;
    sentAt: string;
    type: string;
}
export interface IConversation {
    _id: string;
    participants: IParticipant[];
    type: ConversationType;
    relatedOrder?: string;
    relatedProduct?: string;
    lastMessage?: ILastMessage;
    unreadCount: Record<string, number>;
    status: ConversationStatus;
    resolvedAt?: string;
    resolvedBy?: string;
    createdAt: string;
    updatedAt: string;
}
export interface IAttachment {
    url: string;
    type: 'image' | 'file';
    fileName?: string;
    fileSize?: number;
}
export interface IReadReceipt {
    userId: string;
    readAt: string;
}
export interface IMessage {
    _id: string;
    conversationId: string;
    senderId: string;
    messageType: MessageType;
    content?: string;
    attachments: IAttachment[];
    productRef?: string;
    orderRef?: string;
    readBy: IReadReceipt[];
    isDeleted: boolean;
    deletedAt?: string;
    createdAt: string;
    updatedAt: string;
}
//# sourceMappingURL=chat.types.d.ts.map