import { UserRole, AddressType } from '../constants/enums';
export interface IUser {
    _id: string;
    email: string;
    fullName: string;
    phone?: string;
    avatar?: string;
    role: UserRole;
    isActive: boolean;
    walletAddress?: string;
    defaultAddressId?: string;
    aiPreferences: IAiPreferences;
    createdAt: string;
    updatedAt: string;
}
export interface IAiPreferences {
    preferredCategories: string[];
    priceRange: {
        min: number;
        max: number;
    };
    preferredBrands: string[];
}
export interface IAddress {
    _id: string;
    userId: string;
    fullName: string;
    phone: string;
    province: ILocationInfo;
    district: ILocationInfo;
    ward: ILocationInfo;
    street: string;
    addressType: AddressType;
    isDefault: boolean;
    note?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
export interface ILocationInfo {
    code: number;
    name: string;
}
//# sourceMappingURL=user.types.d.ts.map