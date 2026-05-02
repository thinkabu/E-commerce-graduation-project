"use strict";
// =============================================
// Shared Enums - Dùng chung cho Backend, Admin, Mobile
// =============================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationType = exports.CouponDiscountType = exports.MessageType = exports.ConversationStatus = exports.ConversationType = exports.BehaviorAction = exports.CryptoTxStatus = exports.PaymentStatus = exports.PaymentMethod = exports.OrderStatus = exports.Currency = exports.ImportStatus = exports.StockStatus = exports.AddressType = exports.UserRole = void 0;
// --- User ---
var UserRole;
(function (UserRole) {
    UserRole["USER"] = "user";
    UserRole["ADMIN"] = "admin";
})(UserRole || (exports.UserRole = UserRole = {}));
var AddressType;
(function (AddressType) {
    AddressType["HOME"] = "HOME";
    AddressType["OFFICE"] = "OFFICE";
    AddressType["OTHER"] = "OTHER";
})(AddressType || (exports.AddressType = AddressType = {}));
// --- Product ---
var StockStatus;
(function (StockStatus) {
    StockStatus["INSTOCK"] = "Instock";
    StockStatus["OUT_OF_STOCK"] = "Outofstock";
    StockStatus["PREORDER"] = "Preorder";
})(StockStatus || (exports.StockStatus = StockStatus = {}));
var ImportStatus;
(function (ImportStatus) {
    ImportStatus["IMPORTED"] = "Imported";
    ImportStatus["PROCESSING"] = "Processing";
})(ImportStatus || (exports.ImportStatus = ImportStatus = {}));
var Currency;
(function (Currency) {
    Currency["VND"] = "VND";
    Currency["USD"] = "USD";
    Currency["ETH"] = "ETH";
})(Currency || (exports.Currency = Currency = {}));
// --- Order ---
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PENDING"] = "PENDING";
    OrderStatus["CONFIRMED"] = "CONFIRMED";
    OrderStatus["PROCESSING"] = "PROCESSING";
    OrderStatus["SHIPPING"] = "SHIPPING";
    OrderStatus["DELIVERED"] = "DELIVERED";
    OrderStatus["CANCELLED"] = "CANCELLED";
    OrderStatus["RETURNED"] = "RETURNED";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["COD"] = "COD";
    PaymentMethod["BANKING"] = "BANKING";
    PaymentMethod["CRYPTO"] = "CRYPTO";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "PENDING";
    PaymentStatus["PROCESSING"] = "PROCESSING";
    PaymentStatus["COMPLETED"] = "COMPLETED";
    PaymentStatus["FAILED"] = "FAILED";
    PaymentStatus["REFUNDED"] = "REFUNDED";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
// --- Blockchain ---
var CryptoTxStatus;
(function (CryptoTxStatus) {
    CryptoTxStatus["PENDING"] = "PENDING";
    CryptoTxStatus["CONFIRMED"] = "CONFIRMED";
    CryptoTxStatus["FAILED"] = "FAILED";
})(CryptoTxStatus || (exports.CryptoTxStatus = CryptoTxStatus = {}));
// --- AI Recommendation ---
var BehaviorAction;
(function (BehaviorAction) {
    BehaviorAction["VIEW"] = "VIEW";
    BehaviorAction["ADD_TO_CART"] = "ADD_TO_CART";
    BehaviorAction["REMOVE_FROM_CART"] = "REMOVE_FROM_CART";
    BehaviorAction["PURCHASE"] = "PURCHASE";
    BehaviorAction["WISHLIST"] = "WISHLIST";
    BehaviorAction["SEARCH"] = "SEARCH";
    BehaviorAction["REVIEW"] = "REVIEW";
    BehaviorAction["SHARE"] = "SHARE";
})(BehaviorAction || (exports.BehaviorAction = BehaviorAction = {}));
// --- Chat ---
var ConversationType;
(function (ConversationType) {
    ConversationType["SUPPORT"] = "SUPPORT";
    ConversationType["ORDER_INQUIRY"] = "ORDER_INQUIRY";
    ConversationType["PRODUCT_INQUIRY"] = "PRODUCT_INQUIRY";
})(ConversationType || (exports.ConversationType = ConversationType = {}));
var ConversationStatus;
(function (ConversationStatus) {
    ConversationStatus["ACTIVE"] = "ACTIVE";
    ConversationStatus["RESOLVED"] = "RESOLVED";
    ConversationStatus["CLOSED"] = "CLOSED";
})(ConversationStatus || (exports.ConversationStatus = ConversationStatus = {}));
var MessageType;
(function (MessageType) {
    MessageType["TEXT"] = "TEXT";
    MessageType["IMAGE"] = "IMAGE";
    MessageType["PRODUCT_CARD"] = "PRODUCT_CARD";
    MessageType["ORDER_CARD"] = "ORDER_CARD";
    MessageType["SYSTEM"] = "SYSTEM";
})(MessageType || (exports.MessageType = MessageType = {}));
// --- Others ---
var CouponDiscountType;
(function (CouponDiscountType) {
    CouponDiscountType["PERCENTAGE"] = "PERCENTAGE";
    CouponDiscountType["FIXED_AMOUNT"] = "FIXED_AMOUNT";
})(CouponDiscountType || (exports.CouponDiscountType = CouponDiscountType = {}));
var NotificationType;
(function (NotificationType) {
    NotificationType["ORDER"] = "ORDER";
    NotificationType["PAYMENT"] = "PAYMENT";
    NotificationType["CRYPTO"] = "CRYPTO";
    NotificationType["PROMOTION"] = "PROMOTION";
    NotificationType["SYSTEM"] = "SYSTEM";
    NotificationType["RECOMMENDATION"] = "RECOMMENDATION";
    NotificationType["CHAT"] = "CHAT";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
