import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  ActivityIndicator,
  AppState,
  AppStateStatus,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { Pressable } from "@/components/ui/pressable";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { useAuth } from "@/contexts/AuthContext";
import { getOrderById } from "@/services/order.service";
import {
  CheckCircle2,
  AlertCircle,
  Home,
  ClipboardList,
  Loader2,
} from "lucide-react-native";

const POLL_INTERVAL_MS = 3000; // Check every 3 seconds
const TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes timeout

export default function WaitingPaymentScreen() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { user } = useAuth();
  
  const [status, setStatus] = useState<"waiting" | "success" | "failed" | "timeout">("waiting");
  const [message, setMessage] = useState("");

  const pollTimer = useRef<any>(null);
  const timeoutTimer = useRef<any>(null);
  const isFinished = useRef(false);

  const cleanTimers = useCallback(() => {
    if (pollTimer.current) clearInterval(pollTimer.current);
    if (timeoutTimer.current) clearTimeout(timeoutTimer.current);
  }, []);

  const checkStatus = useCallback(async () => {
    if (isFinished.current || !orderId || !user?._id) return;
    try {
      const order = await getOrderById(orderId, user._id);
      if (order) {
        if (order.paymentStatus === "COMPLETED") {
          isFinished.current = true;
          cleanTimers();
          setStatus("success");
        } else if (order.orderStatus === "CANCELLED" || order.paymentStatus === "FAILED") {
          isFinished.current = true;
          cleanTimers();
          setStatus("failed");
          setMessage("Giao dịch đã bị hủy hoặc thanh toán không thành công.");
        }
      }
    } catch (err) {
      console.warn("Lỗi kiểm tra trạng thái thanh toán VNPay:", err);
    }
  }, [orderId, user?._id, cleanTimers]);

  useEffect(() => {
    if (!orderId || !user?._id) return;

    // Check status immediately
    checkStatus();

    // Start polling
    pollTimer.current = setInterval(checkStatus, POLL_INTERVAL_MS);

    // Timeout safety
    timeoutTimer.current = setTimeout(() => {
      if (!isFinished.current) {
        isFinished.current = true;
        cleanTimers();
        setStatus("timeout");
        setMessage("Hết thời gian chờ thanh toán (10 phút).");
      }
    }, TIMEOUT_MS);

    // Listen to AppState (detect return from browser)
    const subscription = AppState.addEventListener("change", (nextState: AppStateStatus) => {
      if (nextState === "active" && !isFinished.current) {
        checkStatus();
      }
    });

    return () => {
      cleanTimers();
      subscription.remove();
    };
  }, [orderId, user?._id, checkStatus, cleanTimers]);

  if (status === "waiting") {
    return (
      <SafeAreaView className="flex-1 bg-zinc-50 dark:bg-zinc-950">
        <Stack.Screen options={{ headerShown: false }} />
        <VStack className="flex-1 items-center justify-center p-6">
          <Box className="w-24 h-24 rounded-full bg-yellow-100 dark:bg-yellow-900/20 items-center justify-center mb-8">
            <ActivityIndicator size="large" color="#eab308" />
          </Box>
          <Text className="text-xl font-black text-zinc-900 dark:text-white mb-3">
            Đang chờ thanh toán VNPay
          </Text>
          <Text className="text-zinc-500 dark:text-zinc-400 text-center leading-relaxed px-4 mb-2">
            Vui lòng hoàn thành giao dịch trên trình duyệt vừa mở.
          </Text>
          <Text className="text-zinc-400 dark:text-zinc-500 text-center text-xs px-6">
            Hệ thống đang tự động cập nhật kết quả thanh toán. Vui lòng không đóng màn hình này.
          </Text>
        </VStack>
      </SafeAreaView>
    );
  }

  const isSuccess = status === "success";

  return (
    <SafeAreaView className="flex-1 bg-zinc-50 dark:bg-zinc-950">
      <Stack.Screen options={{ headerShown: false }} />

      <VStack className="flex-1 items-center justify-center p-6">
        <Box
          className={`w-24 h-24 rounded-full items-center justify-center mb-8 ${isSuccess ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"}`}
        >
          <Icon
            as={isSuccess ? CheckCircle2 : AlertCircle}
            className={`w-12 h-12 ${isSuccess ? "text-green-600" : "text-red-600"}`}
          />
        </Box>

        <Text
          className={`text-2xl font-black mb-3 ${isSuccess ? "text-zinc-900 dark:text-white" : "text-red-600"}`}
        >
          {isSuccess ? "Thanh toán thành công!" : "Thanh toán thất bại"}
        </Text>

        <Text className="text-zinc-500 dark:text-zinc-400 text-center mb-10 leading-relaxed px-4">
          {isSuccess
            ? `Đơn hàng #${orderId?.slice(-8).toUpperCase()} của bạn đã được đặt và thanh toán thành công.`
            : message || "Đã xảy ra lỗi trong quá trình thực hiện giao dịch qua VNPay."}
        </Text>

        {isSuccess && (
          <Box className="w-full bg-white dark:bg-zinc-900 rounded-3xl p-5 mb-8 border border-zinc-100 dark:border-zinc-800 shadow-sm">
            <HStack className="justify-between items-center mb-4">
              <Text className="text-zinc-500 text-sm">Mã đơn hàng</Text>
              <Text className="text-zinc-900 dark:text-white font-bold">
                #{orderId?.slice(-8).toUpperCase()}
              </Text>
            </HStack>
            <HStack className="justify-between items-center mb-4">
              <Text className="text-zinc-500 text-sm">Cổng thanh toán</Text>
              <Text className="text-zinc-900 dark:text-white font-bold">
                VNPay Sandbox
              </Text>
            </HStack>
            <HStack className="justify-between items-center">
              <Text className="text-zinc-500 text-sm">Thời gian</Text>
              <Text className="text-zinc-900 dark:text-white font-bold">
                {new Date().toLocaleDateString("vi-VN")}
              </Text>
            </HStack>
          </Box>
        )}

        <VStack className="w-full space-y-4 gap-4">
          {isSuccess ? (
            <>
              <Pressable
                className="bg-zinc-900 dark:bg-zinc-100 w-full h-14 rounded-2xl items-center justify-center shadow-lg active:opacity-90"
                onPress={() => router.push("/profile/order-history" as any)}
              >
                <HStack className="items-center gap-2">
                  <Icon
                    as={ClipboardList}
                    className="text-white dark:text-zinc-900 w-5 h-5"
                  />
                  <Text className="text-white dark:text-zinc-900 font-extrabold text-base">
                    XEM ĐƠN HÀNG
                  </Text>
                </HStack>
              </Pressable>

              <Pressable
                className="w-full h-14 rounded-2xl items-center justify-center border border-zinc-200 dark:border-zinc-800 active:bg-zinc-100 dark:active:bg-zinc-800"
                onPress={() => {
                  router.dismissAll();
                  router.push("/(tabs)/home");
                }}
              >
                <HStack className="items-center gap-2">
                  <Icon
                    as={Home}
                    className="text-zinc-700 dark:text-zinc-300 w-5 h-5"
                  />
                  <Text className="text-zinc-700 dark:text-zinc-300 font-bold text-base">
                    VỀ TRANG CHỦ
                  </Text>
                </HStack>
              </Pressable>
            </>
          ) : (
            <Pressable
              className="bg-yellow-500 w-full h-14 rounded-2xl items-center justify-center shadow-lg active:opacity-90"
              onPress={() => {
                router.dismissAll();
                router.push("/(tabs)/home");
              }}
            >
              <Text className="text-zinc-900 font-extrabold text-base">
                QUAY LẠI TRANG CHỦ
              </Text>
            </Pressable>
          )}
        </VStack>
      </VStack>
    </SafeAreaView>
  );
}
