import { BehaviorAction } from '../constants/enums';

// --- UserBehavior Interface ---
export interface IBehaviorMetadata {
  searchQuery?: string;
  duration?: number;
  source?: string; // 'home' | 'category' | 'search' | 'recommendation'
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

// --- ProductEmbedding Interface ---
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

// --- Recommendation Result ---
export interface IRecommendationResult {
  productId: string;
  score: number;
  reason?: string; // 'CF' | 'VECTOR_SEARCH' | 'HYBRID'
}

// --- Weight mapping cho CF ---
export const BEHAVIOR_WEIGHTS: Record<BehaviorAction, number> = {
  [BehaviorAction.VIEW]: 1.0,
  [BehaviorAction.SEARCH]: 1.5,
  [BehaviorAction.ADD_TO_CART]: 3.0,
  [BehaviorAction.REMOVE_FROM_CART]: -1.0,
  [BehaviorAction.WISHLIST]: 3.5,
  [BehaviorAction.REVIEW]: 4.0,
  [BehaviorAction.PURCHASE]: 5.0,
  [BehaviorAction.SHARE]: 2.0,
};
