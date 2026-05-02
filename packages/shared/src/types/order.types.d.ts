import { OrderStatus, PaymentMethod, PaymentStatus, Currency } from '../constants/enums';
import { IVariantAttribute } from './product.types';
export interface ICartItem {
    _id: string;
    productId: string;
    variantId?: string;
    quantity: number;
    addedAt: string;
}
export interface ICart {
    _id: string;
    userId: string;
    items: ICartItem[];
    createdAt: string;
    updatedAt: string;
}
export interface IWishlist {
    _id: string;
    userId: string;
    productId: string;
    addedAt: string;
    note?: string;
    createdAt: string;
    updatedAt: string;
}
export interface IOrderItemSnapshot {
    name: string;
    image: string;
    productId: string;
    variantName?: string;
    variantSku?: string;
    attributes?: IVariantAttribute[];
}
export interface IOrderItem {
    _id: string;
    productId: string;
    variantId?: string;
    productSnapshot: IOrderItemSnapshot;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}
export interface IStatusHistory {
    status: string;
    changedAt: string;
    changedBy?: string;
    note?: string;
}
export interface IShippingAddressSnapshot {
    fullName: string;
    phone: string;
    province: string;
    district: string;
    ward: string;
    street: string;
    note?: string;
}
export interface IOrder {
    _id: string;
    orderId: string;
    userId: string;
    items: IOrderItem[];
    shippingAddressId: string;
    shippingAddressSnapshot: IShippingAddressSnapshot;
    subtotal: number;
    shippingFee: number;
    discount: number;
    totalAmount: number;
    currency: Currency;
    couponId?: string;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    orderStatus: OrderStatus;
    statusHistory: IStatusHistory[];
    note?: string;
    createdAt: string;
    updatedAt: string;
}
//# sourceMappingURL=order.types.d.ts.map