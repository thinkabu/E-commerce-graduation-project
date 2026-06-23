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
  } catch (error: any) {
    // Không dùng console.error để tránh hiện màn hình đỏ LogBox trong React Native
    console.warn("Verify blockchain transaction failed:", error?.response?.data || error.message);
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
        timeout: 60000, // 60 giây: đủ để backend polling 15 lần × 3 giây = 45 giây
      },
    );
    return response.data;
  } catch (error: any) {
    if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
      console.warn("Auto-detect timeout after 60s");
      const timeoutErr = new Error("Hết thời gian chờ. Vui lòng thử lại hoặc nhập TX hash thủ công.");
      throw timeoutErr;
    }
    console.log(
      "Auto-detect status:",
      error?.response?.status === 404 ? "Not found" : error.message,
    );
    throw error;
  }
};
