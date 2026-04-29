// =============================================
// Shared Enums - Dùng chung cho Backend, Admin, Mobile
// =============================================

// --- User ---
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export enum AddressType {
  HOME = 'HOME',
  OFFICE = 'OFFICE',
  OTHER = 'OTHER',
}

// --- Product ---
export enum StockStatus {
  INSTOCK = 'Instock',
  OUT_OF_STOCK = 'Outofstock',
  PREORDER = 'Preorder',
}

export enum ImportStatus {
  IMPORTED = 'Imported',
  PROCESSING = 'Processing',
}

export enum Currency {
  VND = 'VND',
  USD = 'USD',
  ETH = 'ETH',
}

// --- Order ---
export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPING = 'SHIPPING',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  RETURNED = 'RETURNED',
}

export enum PaymentMethod {
  COD = 'COD',
  BANKING = 'BANKING',
  CRYPTO = 'CRYPTO',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

// --- Blockchain ---
export enum CryptoTxStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  FAILED = 'FAILED',
}

// --- AI Recommendation ---
export enum BehaviorAction {
  VIEW = 'VIEW',
  ADD_TO_CART = 'ADD_TO_CART',
  REMOVE_FROM_CART = 'REMOVE_FROM_CART',
  PURCHASE = 'PURCHASE',
  WISHLIST = 'WISHLIST',
  SEARCH = 'SEARCH',
  REVIEW = 'REVIEW',
  SHARE = 'SHARE',
}

// --- Chat ---
export enum ConversationType {
  SUPPORT = 'SUPPORT',
  ORDER_INQUIRY = 'ORDER_INQUIRY',
  PRODUCT_INQUIRY = 'PRODUCT_INQUIRY',
}

export enum ConversationStatus {
  ACTIVE = 'ACTIVE',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  PRODUCT_CARD = 'PRODUCT_CARD',
  ORDER_CARD = 'ORDER_CARD',
  SYSTEM = 'SYSTEM',
}

// --- Others ---
export enum CouponDiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT',
}

export enum NotificationType {
  ORDER = 'ORDER',
  PAYMENT = 'PAYMENT',
  CRYPTO = 'CRYPTO',
  PROMOTION = 'PROMOTION',
  SYSTEM = 'SYSTEM',
  RECOMMENDATION = 'RECOMMENDATION',
  CHAT = 'CHAT',
}
