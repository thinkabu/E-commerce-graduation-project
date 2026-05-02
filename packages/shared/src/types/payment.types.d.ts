import { PaymentMethod, PaymentStatus, Currency, CryptoTxStatus } from '../constants/enums';
export interface IBankingInfo {
    bankName: string;
    accountNumber: string;
    transactionId: string;
}
export interface ICryptoPaymentInfo {
    txHash: string;
    fromAddress: string;
    toAddress: string;
    networkId: number;
    amountInWei: string;
    amountInEth: number;
    exchangeRate: number;
    confirmedAt?: string;
    blockNumber?: number;
}
export interface IPayment {
    _id: string;
    orderId: string;
    userId: string;
    method: PaymentMethod;
    status: PaymentStatus;
    amount: number;
    currency: Currency;
    bankingInfo?: IBankingInfo;
    cryptoInfo?: ICryptoPaymentInfo;
    paidAt?: string;
    failReason?: string;
    createdAt: string;
    updatedAt: string;
}
export interface ICryptoTransaction {
    _id: string;
    txHash: string;
    orderId: string;
    userId: string;
    fromAddress: string;
    toAddress: string;
    amountInWei: string;
    amountInEth: number;
    amountInFiat: number;
    fiatCurrency: string;
    exchangeRate: number;
    gasUsed?: number;
    gasPrice?: string;
    networkId: number;
    networkName: string;
    blockNumber?: number;
    blockTimestamp?: string;
    status: CryptoTxStatus;
    confirmations: number;
    contractAddress?: string;
    methodName?: string;
    eventLogs: any[];
    createdAt: string;
    updatedAt: string;
}
//# sourceMappingURL=payment.types.d.ts.map