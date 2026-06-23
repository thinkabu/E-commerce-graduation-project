import React, { useState, useEffect } from "react";
import {
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Image,
  View,
  ActivityIndicator,
  Linking,
  Modal,
  Animated,
} from "react-native";
import { useRouter, Stack, useLocalSearchParams } from "expo-router";
import Header from "@/components/Header";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Icon } from "@/components/ui/icon";
import { Button, ButtonText } from "@/components/ui/button";
import {
  Copy,
  Wallet,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Info,
  ExternalLink,
} from "lucide-react-native";
import * as Clipboard from "expo-clipboard";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { usePayment } from "@/contexts/PaymentContext";
import { createOrder } from "@/services/order.service";
import {
  verifyBlockchainTransaction,
  autoDetectTransaction,
} from "@/services/crypto-payment.service";
import metaMaskService, {
  MERCHANT_WALLET,
  ETHEREUM_NETWORK,
} from "@/services/metamask.service";
import { ethers } from "ethers";

const BlockchainPaymentScreen = () => {
  const router = useRouter();
  const {
    total,
    mode,
    productId,
    variantId,
    quantity,
    shippingAddressId,
    couponId,
  } = useLocalSearchParams();

  const { user } = useAuth();
  const { cartItems, clearCart } = useCart();
  const { cryptoRate, convertVNDToCrypto, isLoadingRate } = usePayment();

  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transactionHash, setTransactionHash] = useState("");
  const [transactionStatus, setTransactionStatus] = useState<
    "idle" | "pending" | "confirming" | "success" | "error" | "waiting"
  >("idle");
  const [detectAttempts, setDetectAttempts] = useState(0);
  const [isDetecting, setIsDetecting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const successAnim = React.useRef(new Animated.Value(0)).current;

  const vndAmount = total ? parseFloat(total as string) : 0;
  const cryptoAmount = parseFloat(convertVNDToCrypto(vndAmount).toFixed(6));

  const copyToClipboard = async () => {
    try {
      await Clipboard.setStringAsync(MERCHANT_WALLET);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      Alert.alert("Thông báo", "Vui lòng sao chép thủ công địa chỉ ví này.");
    }
  };

  const openMetaMaskPayment = async () => {
    const amountInWei = ethers.parseEther(cryptoAmount.toFixed(6)).toString();
    const chainId = 31337; // Hardhat network chain ID

    // EIP-681: Ethereum Payment URI – MetaMask mobile nhận dạng và mở giao diện Send
    const eip681Uri = `ethereum:${MERCHANT_WALLET}@${chainId}?value=${amountInWei}`;

    // Fallback 1: metamask:// custom scheme
    const metamaskScheme = `metamask://send?to=${MERCHANT_WALLET}&value=${amountInWei}&chainId=${chainId}`;

    // Fallback 2: MetaMask universal link (mở MetaMask App qua web)
    const metamaskUniversalLink = `https://metamask.app.link/send/${MERCHANT_WALLET}@${chainId}?value=${amountInWei}`;

    try {
      // Thử EIP-681 trước (chuẩn, MetaMask mobile mở Send UI)
      const canOpenEip681 = await Linking.canOpenURL(eip681Uri);
      if (canOpenEip681) {
        await Linking.openURL(eip681Uri);
        return true;
      }

      // Thử metamask:// scheme
      const canOpenMetamask = await Linking.canOpenURL(metamaskScheme);
      if (canOpenMetamask) {
        await Linking.openURL(metamaskScheme);
        return true;
      }

      // Fallback cuối: mở universal link (sẽ redirect sang MetaMask App nếu đã cài)
      await Linking.openURL(metamaskUniversalLink);
      return true;
    } catch (err) {
      console.error("Cannot open MetaMask:", err);
      return false;
    }
  };

  const handleSendTransaction = async () => {
    if (!MERCHANT_WALLET) {
      Alert.alert("Lỗi", "Địa chỉ ví nhận chưa được cấu hình");
      return;
    }

    Alert.alert(
      "🦊 Mở MetaMask để thanh toán",
      `Bạn sẽ được chuyển sang MetaMask để xác nhận giao dịch:\n\n` +
        `💰 Số ETH: ${cryptoAmount.toFixed(6)} ETH\n` +
        `📍 Ví nhận: ${metaMaskService.formatAddress(MERCHANT_WALLET)}\n` +
        `🔗 Mạng: Hardhat Local (Chain ID: 31337)\n\n` +
        `Sau khi xác nhận trong MetaMask, quay lại app và nhấn "Tự động xác nhận giao dịch".`,
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Mở MetaMask 🦊",
          onPress: async () => {
            try {
              setLoading(true);
              setTransactionStatus("pending");

              const opened = await openMetaMaskPayment();

              if (opened) {
                setTransactionStatus("waiting");
              } else {
                // MetaMask chưa cài – hướng dẫn thủ công
                Alert.alert(
                  "Không thể mở MetaMask",
                  `Vui lòng mở MetaMask thủ công và gửi:\n\n` +
                    `Số lượng: ${cryptoAmount.toFixed(6)} ETH\n` +
                    `Đến địa chỉ: ${MERCHANT_WALLET}\n` +
                    `Mạng: Hardhat Local (Chain ID: 31337)`,
                  [{ text: "Đã hiểu", onPress: () => setTransactionStatus("waiting") }],
                );
              }
            } catch (error: any) {
              Alert.alert("Lỗi", error.message || "Không thể khởi tạo giao dịch");
              setTransactionStatus("idle");
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  const handleAutoDetect = async () => {
    if (!user?._id) return;
    try {
      setIsDetecting(true);
      setTransactionStatus("confirming");
      setLoading(true);
      setDetectAttempts(0);

      // Backend tự polling blockchain (tối đa 15 lần × 3 giây = ~45 giây)
      // Frontend chỉ cần gọi 1 lần và chờ kết quả
      const raw = await autoDetectTransaction(
        user._id,
        cryptoAmount,
        ETHEREUM_NETWORK,
      );

      // Backend có thể trả về trực tiếp hoặc có wrapper .data
      const result = raw?.data ?? raw;

      console.log("[AutoDetect] Backend trả về:", JSON.stringify(result));

      if (result?.verified && result?.transaction?.hash) {
        const txHash = result.transaction.hash;
        const senderAddress = result.transaction.from ?? "";
        setTransactionHash(txHash);
        setDetectAttempts(result.attempt ?? 1);
        await handleCreateOrder(txHash, senderAddress);
        return;
      }

      // Backend trả về 200 nhưng verified = false (trường hợp hiếm gặp)
      throw new Error("Giao dịch chưa được xác nhận trên blockchain.");
    } catch (error: any) {
      // Nếu lỗi xảy ra bên trong handleCreateOrder thì đã có Alert riêng
      if (error?.isOrderError) return;

      setTransactionStatus("waiting");
      Alert.alert(
        "Chưa tìm thấy giao dịch",
        error?.response?.data?.message ||
          error?.message ||
          "Giao dịch chưa xuất hiện trên mạng lưới.\n\n" +
          '• Nhấn "Tự động xác nhận" để quét lại\n' +
          '• Hoặc chọn "Nhập hash thủ công"',
        [
          { text: "Thử lại", onPress: () => handleAutoDetect() },
          { text: "Nhập thủ công", onPress: () => handleTransactionHashInput() },
        ],
      );
    } finally {
      setLoading(false);
      setIsDetecting(false);
    }
  };


  const handleTransactionHashInput = () => {
    Alert.prompt(
      "Nhập Transaction Hash",
      "Vào MetaMask -> Hoạt động -> Chọn giao dịch -> Copy mã hash (0x...):",
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Xác thực",
          onPress: async (hash?: string) => {
            if (!hash || !metaMaskService.isValidTransactionHash(hash)) {
              Alert.alert("Lỗi", "Mã Transaction Hash không hợp lệ");
              return;
            }
            setTransactionHash(hash);
            await verifyAndCreateOrder(hash);
          },
        },
      ],
      "plain-text",
    );
  };

  const verifyAndCreateOrder = async (txHash: string) => {
    if (!user?._id) return;
    try {
      setLoading(true);
      setTransactionStatus("confirming");

      const raw = await verifyBlockchainTransaction(
        user._id,
        txHash,
        "0x0000000000000000000000000000000000000000", // Backend tự phát hiện ví gửi
        cryptoAmount,
        ETHEREUM_NETWORK,
      );

      const result = raw?.data ?? raw;

      if (result?.verified) {
        await handleCreateOrder(txHash, result.transaction?.from || "");
      } else {
        throw new Error("Giao dịch không hợp lệ");
      }
    } catch (error: any) {
      setLoading(false);
      setTransactionStatus("error");
      Alert.alert(
        "Xác thực thất bại",
        error?.response?.data?.message ||
          error.message ||
          "Không thể xác thực giao dịch, vui lòng kiểm tra lại.",
      );
    }
  };

  const handleCreateOrder = async (txHash: string, senderAddress: string) => {
    if (!user?._id) return;
    try {
      const itemsPayload =
        mode === "single"
          ? [
              {
                productId: productId as string,
                variantId:
                  variantId &&
                  variantId !== "undefined" &&
                  variantId !== "null" &&
                  variantId !== ""
                    ? (variantId as string)
                    : undefined,
                quantity: parseInt(quantity as string) || 1,
              },
            ]
          : cartItems.map((item: any) => ({
              productId: item.productId,
              variantId:
                item.variantId &&
                item.variantId !== "undefined" &&
                item.variantId !== "null" &&
                item.variantId !== ""
                  ? item.variantId
                  : undefined,
              quantity: item.quantity,
            }));

      const payload = {
        items: itemsPayload,
        shippingAddressId: shippingAddressId as string,
        paymentMethod: "CRYPTO",
        couponId: (couponId as string) || undefined,
        blockchainPayment: {
          transactionHash: txHash,
          walletAddress: senderAddress,
          cryptoAmount: parseFloat(cryptoAmount.toFixed(6)),
          cryptoSymbol: cryptoRate?.symbol || "ETH",
          exchangeRate: cryptoRate?.vndRate || 0,
          network: ETHEREUM_NETWORK,
        },
      };

      const order = await createOrder(user._id, payload);

      if (mode !== "single") {
        await clearCart();
      }

      setTransactionStatus("success");
      setLoading(false);
      setIsDetecting(false);

      // Mở success modal
      setShowSuccess(true);
      Animated.spring(successAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    } catch (error: any) {
      setLoading(false);
      setIsDetecting(false);
      setTransactionStatus("error");
      Alert.alert(
        "Lỗi tạo đơn",
        error.message || "Không thể tạo đơn hàng sau khi chuyển khoản.",
      );
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-zinc-50 dark:bg-zinc-950">
      <Stack.Screen options={{ headerShown: false }} />
      <Header title="Thanh toán Blockchain" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1 px-5 pt-6"
      >
        <VStack className="space-y-6 gap-6 mb-10">
          {/* Amount Box */}
          <Box className="bg-zinc-900 p-8 rounded-[32px] items-center shadow-xl">
            <Text className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2">
              Số tiền cần thanh toán
            </Text>
            {isLoadingRate ? (
              <ActivityIndicator color="#EAB308" className="my-2" />
            ) : (
              <Text className="text-yellow-500 text-3xl font-black">
                {cryptoAmount.toFixed(6)} ETH
              </Text>
            )}
            <Text className="text-zinc-500 text-[10px] mt-1">
              ≈ {Number(total).toLocaleString()}₫ (Tỷ giá:{" "}
              {cryptoRate?.vndRate
                ? `1 ETH = ${cryptoRate.vndRate.toLocaleString()}₫`
                : "Đang tải tỷ giá..."}
              )
            </Text>
          </Box>

          {/* Wallet Address */}
          <VStack className="space-y-3 gap-3">
            <Text className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1">
              Địa chỉ ví nhận (Hardhat / Sepolia)
            </Text>
            <Box className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-100 dark:border-zinc-800 border-dashed">
              <HStack className="items-center justify-between">
                <Text
                  className="text-sm font-bold text-zinc-800 dark:text-zinc-200 flex-1 mr-4"
                  numberOfLines={1}
                >
                  {MERCHANT_WALLET}
                </Text>
                <TouchableOpacity
                  onPress={copyToClipboard}
                  className="bg-yellow-500 p-2 rounded-xl"
                >
                  <Icon
                    as={copied ? CheckCircle2 : Copy}
                    className="text-zinc-900 w-5 h-5"
                  />
                </TouchableOpacity>
              </HStack>
              {copied && (
                <Text className="text-[10px] text-green-500 font-bold mt-2">
                  Đã sao chép vào bộ nhớ tạm!
                </Text>
              )}
            </Box>
          </VStack>

          {/* QR Code */}
          <VStack className="items-center py-6 bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-100 dark:border-zinc-800">
            <Box className="w-48 h-48 bg-zinc-100 dark:bg-zinc-800 rounded-2xl items-center justify-center p-4">
              <Image
                source={{
                  uri: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${MERCHANT_WALLET}`,
                }}
                className="w-full h-full"
              />
            </Box>
            <Text className="text-xs text-zinc-400 mt-4 italic">
              Quét mã QR để lấy địa chỉ ví nhanh
            </Text>
          </VStack>

          {/* Status Box */}
          {transactionStatus !== "idle" && (
            <VStack className="space-y-3 gap-3">
              <Text className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1">
                Trạng thái giao dịch
              </Text>
              <Box className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-100 dark:border-zinc-800">
                <HStack className="items-center space-x-3 gap-3">
                  <ActivityIndicator
                    color="#EAB308"
                    size="small"
                    className={
                      transactionStatus === "pending" ||
                      transactionStatus === "confirming" ||
                      isDetecting
                        ? "opacity-100"
                        : "opacity-0"
                    }
                  />
                  <VStack className="flex-1">
                    {transactionStatus === "pending" && (
                      <Text className="text-sm font-bold text-blue-500">
                        ⏳ Đang mở ví MetaMask...
                      </Text>
                    )}
                    {transactionStatus === "waiting" && (
                      <Text className="text-sm font-bold text-orange-500">
                        📥 Đang chờ thanh toán trên ví...
                      </Text>
                    )}
                    {transactionStatus === "confirming" && (
                      <Text className="text-sm font-bold text-yellow-500">
                        🔄 Đang xác thực giao dịch trên Blockchain...
                        {isDetecting && ` (Lần quét: ${detectAttempts}/10)`}
                      </Text>
                    )}
                    {transactionStatus === "success" && (
                      <Text className="text-sm font-bold text-green-500">
                        ✅ Giao dịch thành công! Đang tạo đơn hàng...
                      </Text>
                    )}
                    {transactionStatus === "error" && (
                      <Text className="text-sm font-bold text-red-500">
                        ❌ Xác thực giao dịch thất bại.
                      </Text>
                    )}
                    {transactionHash !== "" && (
                      <Text className="text-[10px] text-zinc-400 mt-1 font-mono">
                        Hash: {metaMaskService.formatAddress(transactionHash)}
                      </Text>
                    )}
                  </VStack>
                </HStack>
              </Box>
            </VStack>
          )}

          {/* Warning Note */}
          <Box className="bg-red-50 dark:bg-red-900/10 p-5 rounded-3xl border border-red-100 dark:border-red-900/20">
            <HStack className="items-start space-x-3 gap-3">
              <Icon as={AlertCircle} className="text-red-500 w-5 h-5 mt-0.5" />
              <VStack className="flex-1">
                <Text className="text-xs font-black text-red-600 uppercase">
                  Lưu ý quan trọng
                </Text>
                <Text className="text-[11px] text-red-500/80 leading-relaxed mt-1">
                  Chỉ gửi tiền qua mạng lưới{" "}
                  <Text className="font-bold">
                    Ethereum{" "}
                    {ETHEREUM_NETWORK === "hardhat"
                      ? "Hardhat Node"
                      : "Sepolia"}
                  </Text>
                  . Gửi sai mạng lưới có thể dẫn đến mất tài sản vĩnh viễn. Giữ
                  app hoạt động cho tới khi hoàn tất.
                </Text>
              </VStack>
            </HStack>
          </Box>
        </VStack>
      </ScrollView>

      {/* Action Buttons */}
      <Box className="p-5 bg-white dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-800 gap-3">
        {transactionStatus === "idle" && (
          <Button
            onPress={handleSendTransaction}
            disabled={loading}
            className="bg-yellow-500 h-16 rounded-2xl shadow-xl active:opacity-90"
          >
            <ButtonText className="text-zinc-900 font-black text-lg uppercase tracking-wider">
              Thanh toán {cryptoAmount.toFixed(6)} ETH
            </ButtonText>
          </Button>
        )}

        {transactionStatus === "waiting" && (
          <VStack className="gap-3">
            <Button
              onPress={handleAutoDetect}
              disabled={isDetecting}
              className="bg-green-600 h-16 rounded-2xl active:opacity-90"
            >
              <ButtonText className="text-white font-black text-base uppercase tracking-wider">
                {isDetecting
                  ? `Đang tìm giao dịch... (${detectAttempts}/10)`
                  : "✅ Tự động xác nhận"}
              </ButtonText>
            </Button>

            <Button
              onPress={handleTransactionHashInput}
              variant="outline"
              className="border-zinc-200 dark:border-zinc-800 h-12 rounded-xl"
            >
              <ButtonText className="text-zinc-700 dark:text-zinc-200 font-bold">
                Nhập TX Hash thủ công
              </ButtonText>
            </Button>

            <Button
              onPress={handleSendTransaction}
              variant="link"
              className="h-10"
            >
              <ButtonText className="text-yellow-500 font-bold text-sm">
                Gửi lại giao dịch
              </ButtonText>
            </Button>
          </VStack>
        )}

        {transactionStatus === "error" && (
          <VStack className="gap-3">
            <Button
              onPress={handleSendTransaction}
              className="bg-yellow-500 h-16 rounded-2xl"
            >
              <ButtonText className="text-zinc-900 font-black text-base uppercase">
                Thử lại giao dịch
              </ButtonText>
            </Button>
            <Button
              onPress={handleTransactionHashInput}
              variant="outline"
              className="border-zinc-200 dark:border-zinc-800 h-12 rounded-xl"
            >
              <ButtonText className="text-zinc-700 dark:text-zinc-200 font-bold">
                Thử nhập TX Hash thủ công
              </ButtonText>
            </Button>
          </VStack>
        )}
      </Box>

      {/* Success Modal */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <Box className="flex-1 bg-black/80 items-center justify-center px-8">
          <Animated.View
            style={{
              transform: [{ scale: successAnim }],
              opacity: successAnim,
            }}
            className="bg-white dark:bg-zinc-900 w-full p-10 rounded-[48px] items-center"
          >
            <Box className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 items-center justify-center mb-6">
              <Icon as={CheckCircle2} className="text-green-500 w-12 h-12" />
            </Box>
            <Text className="text-2xl font-black text-zinc-900 dark:text-white text-center mb-2 uppercase tracking-tighter">
              Thanh toán thành công!
            </Text>
            <Text className="text-sm text-zinc-500 text-center mb-2 leading-relaxed">
              Giao dịch của bạn đã được ghi nhận trên Blockchain.{"\n"}Đơn hàng
              đang được xử lý.
            </Text>
            <Text className="text-xs text-zinc-400 text-center mb-8">
              Cảm ơn bạn đã tin dùng dịch vụ của chúng tôi.
            </Text>

            <VStack className="w-full space-y-3 gap-3">
              <Button
                onPress={() => {
                  setShowSuccess(false);
                  router.dismissAll();
                  router.replace("/(tabs)/home" as any);
                }}
                className="bg-zinc-900 dark:bg-yellow-500 w-full h-14 rounded-2xl"
              >
                <ButtonText className="text-white dark:text-zinc-900 font-bold uppercase">
                  Về trang chủ
                </ButtonText>
              </Button>
              <Button
                onPress={() => {
                  setShowSuccess(false);
                  router.dismissAll();
                  router.replace("/(tabs)/home" as any);
                  setTimeout(() => {
                    router.push("/profile/order-history" as any);
                  }, 100);
                }}
                className="bg-zinc-100 dark:bg-zinc-800 w-full h-14 rounded-2xl"
              >
                <ButtonText className="text-zinc-700 dark:text-zinc-200 font-bold">
                  Xem đơn hàng của tôi
                </ButtonText>
              </Button>
            </VStack>
          </Animated.View>
        </Box>
      </Modal>
    </SafeAreaView>
  );
};

export default BlockchainPaymentScreen;
