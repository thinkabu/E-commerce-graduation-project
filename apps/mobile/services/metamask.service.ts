import { ethers } from "ethers";
import * as SecureStore from "expo-secure-store";

export const MERCHANT_WALLET =
  process.env.EXPO_PUBLIC_MERCHANT_WALLET ||
  "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266";
export const ETHEREUM_NETWORK =
  process.env.EXPO_PUBLIC_ETHEREUM_NETWORK || "hardhat";

export const CHAIN_IDS: Record<string, number> = {
  hardhat: 31337,
  localhost: 31337,
};

export const RPC_URLS: Record<string, string> = {
  hardhat: process.env.EXPO_PUBLIC_HARDHAT_RPC_URL || "http://127.0.0.1:8545",
  localhost: process.env.EXPO_PUBLIC_HARDHAT_RPC_URL || "http://127.0.0.1:8545",
};

class MetaMaskService {
  private address: string | null = null;
  private chainId: number | null = null;

  async saveWalletConnection(address: string, chainId: number): Promise<void> {
    this.address = address;
    this.chainId = chainId;

    await SecureStore.setItemAsync("wallet_address", address);
    await SecureStore.setItemAsync("wallet_chainId", chainId.toString());
  }

  async restoreWalletConnection(): Promise<{
    address: string;
    chainId: number;
  } | null> {
    try {
      const address = await SecureStore.getItemAsync("wallet_address");
      const chainId = await SecureStore.getItemAsync("wallet_chainId");

      if (address && chainId) {
        this.address = address;
        this.chainId = parseInt(chainId, 10);
        return { address, chainId: this.chainId };
      }
      return null;
    } catch (error) {
      console.error("Error restoring wallet connection:", error);
      return null;
    }
  }

  async disconnectWallet(): Promise<void> {
    this.address = null;
    this.chainId = null;

    await SecureStore.deleteItemAsync("wallet_address");
    await SecureStore.deleteItemAsync("wallet_chainId");
  }

  getAddress(): string | null {
    return this.address;
  }

  isConnected(): boolean {
    return !!this.address;
  }

  isCorrectNetwork(): boolean {
    const expectedChainId = CHAIN_IDS[ETHEREUM_NETWORK];
    return this.chainId === expectedChainId;
  }

  getCurrentNetwork(): string {
    if (this.chainId === CHAIN_IDS.hardhat) return "Hardhat Local";
    if (this.chainId === CHAIN_IDS.sepolia) return "Sepolia Testnet";
    if (this.chainId === CHAIN_IDS.mainnet) return "Ethereum Mainnet";
    return "Unknown Network";
  }

  formatAddress(address: string): string {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4,
    )}`;
  }

  isValidAddress(address: string): boolean {
    return ethers.isAddress(address);
  }

  isValidTransactionHash(hash: string): boolean {
    return /^0x[a-fA-F0-9]{64}$/.test(hash);
  }

  convertVNDToETH(vndAmount: number, ethVndRate: number): string {
    if (!ethVndRate || ethVndRate === 0) return "0";
    const ethAmount = vndAmount / ethVndRate;
    return ethAmount.toFixed(6);
  }

  parseEther(ethAmount: string | number): bigint {
    return ethers.parseEther(ethAmount.toString());
  }

  formatEther(weiAmount: bigint): string {
    return ethers.formatEther(weiAmount);
  }
}

const metaMaskService = new MetaMaskService();
export default metaMaskService;
