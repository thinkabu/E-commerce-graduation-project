import api from "./api";

export const getCryptoExchangeRate = async (currency = "ethereum") => {
  try {
    const response = await api.get("/payments/crypto-rate", {
      params: { currency },
    });
    return response.data.data || response.data;
  } catch (error) {
    console.error("Error fetching crypto exchange rate:", error);
    throw error;
  }
};

export const verifyBlockchainTransaction = async (
  userId: string,
  transactionHash: string,
  walletAddress: string,
  expectedAmount: number,
  network = "hardhat",
) => {
  try {
    const response = await api.post(
      "/payments/verify-blockchain",
      {
        transactionHash,
        walletAddress,
        expectedAmount,
        network,
      },
      {
        params: { userId },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error verifying blockchain transaction:", error);
    throw error;
  }
};

export const autoDetectTransaction = async (
  userId: string,
  expectedAmount: number,
  network = "hardhat",
) => {
  try {
    const response = await api.post(
      "/payments/auto-detect-transaction",
      {
        expectedAmount,
        network,
      },
      {
        params: { userId },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error auto-detecting transaction:", error);
    throw error;
  }
};
