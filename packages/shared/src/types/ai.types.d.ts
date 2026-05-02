import { BehaviorAction } from '../constants/enums';
export interface IBehaviorMetadata {
    searchQuery?: string;
    duration?: number;
    source?: string;
    sessionId?: string;
}
export interface IUserBehavior {
    _id: string;
    userId: string;
    productId: string;
    actionType: BehaviorAction;
    metadata: IBehaviorMetadata;
    weight: number;
    timestamp: string;
}
export interface IProductEmbedding {
    _id: string;
    productId: string;
    embedding: number[];
    embeddingModel: string;
    textUsedForEmbedding: string;
    version: number;
    lastGeneratedAt: string;
    createdAt: string;
    updatedAt: string;
}
export interface IRecommendationResult {
    productId: string;
    score: number;
    reason?: string;
}
export declare const BEHAVIOR_WEIGHTS: Record<BehaviorAction, number>;
//# sourceMappingURL=ai.types.d.ts.map