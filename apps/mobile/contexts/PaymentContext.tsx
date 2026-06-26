import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { getCryptoExchangeRate } from "../services/crypto-payment.service";
import metaMaskService from "../services/metamask.service";

interface CryptoRate {
  currency: string;
  symbol: string;
  vndRate: number;
  lastUpdated: string;
}

interface WalletConnection {
  address: string;
  chainId: number;
  isConnected: boolean;
}

interface PaymentContextType {
  selectedPaymentMethod: "COD" | "BANKING" | "CRYPTO" | "VNPAY";
  setPaymentMethod: (method: "COD" | "BANKING" | "CRYPTO" | "VNPAY") => void;
  cryptoRate: CryptoRate | null;
  fetchCryptoRate: () => Promise<void>;
  resetPayment: () => void;
  paymentInProgress: boolean;
  setPaymentInProgress: (inProgress: boolean) => void;
  convertVNDToCrypto: (vndAmount: number) => number;
  isLoadingRate: boolean;

  // Wallet connection
  walletConnection: WalletConnection | null;
  connectWallet: (address: string, chainId: number) => Promise<void>;
  disconnectWallet: () => Promise<void>;
  isWalletConnected: boolean;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export function PaymentContextProvider({ children }: { children: ReactNode }) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    "COD" | "BANKING" | "CRYPTO" | "VNPAY"
  >("COD");
  const [cryptoRate, setCryptoRate] = useState<CryptoRate | null>(null);
  const [paymentInProgress, setPaymentInProgress] = useState(false);
  const [isLoadingRate, setIsLoadingRate] = useState(false);
  const [walletConnection, setWalletConnection] =
    useState<WalletConnection | null>(null);

  const setPaymentMethod = (method: "COD" | "BANKING" | "CRYPTO" | "VNPAY") => {
    setSelectedPaymentMethod(method);
    if (method === "CRYPTO" && !cryptoRate) {
      fetchCryptoRate();
    }
  };

  const fetchCryptoRate = async () => {
    setIsLoadingRate(true);
    try {
      const rate = await getCryptoExchangeRate("ethereum");
      setCryptoRate(rate);
    } catch (error) {
      console.error("Error fetching crypto rate:", error);
    } finally {
      setIsLoadingRate(false);
    }
  };

  const convertVNDToCrypto = (vndAmount: number): number => {
    if (!cryptoRate || !cryptoRate.vndRate) return 0;
    return vndAmount / cryptoRate.vndRate;
  };

  const connectWallet = async (address: string, chainId: number) => {
    try {
      await metaMaskService.saveWalletConnection(address, chainId);
      setWalletConnection({
        address,
        chainId,
        isConnected: true,
      });
    } catch (error) {
      console.error("Error connecting wallet:", error);
      throw error;
    }
  };

  const disconnectWallet = async () => {
    try {
      await metaMaskService.disconnectWallet();
      setWalletConnection(null);
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
      throw error;
    }
  };

  const resetPayment = () => {
    setSelectedPaymentMethod("COD");
    setCryptoRate(null);
    setPaymentInProgress(false);
  };

  // Restore wallet connection on mount
  useEffect(() => {
    const restoreConnection = async () => {
      const savedConnection = await metaMaskService.restoreWalletConnection();
      if (savedConnection) {
        setWalletConnection({
          address: savedConnection.address,
          chainId: savedConnection.chainId,
          isConnected: true,
        });
      }
    };
    restoreConnection();
  }, []);

  // Fetch crypto rate on mount
  useEffect(() => {
    fetchCryptoRate();
  }, []);

  return (
    <PaymentContext.Provider
      value={{
        selectedPaymentMethod,
        setPaymentMethod,
        cryptoRate,
        fetchCryptoRate,
        resetPayment,
        paymentInProgress,
        setPaymentInProgress,
        convertVNDToCrypto,
        isLoadingRate,
        walletConnection,
        connectWallet,
        disconnectWallet,
        isWalletConnected: !!walletConnection?.isConnected,
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
}

export function usePayment() {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error("usePayment must be used within a PaymentContextProvider");
  }
  return context;
}
