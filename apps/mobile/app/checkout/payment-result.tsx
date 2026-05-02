import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { Pressable } from "@/components/ui/pressable";
import { useCart } from "@/contexts/CartContext";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { CheckCircle2, AlertCircle, Home, ClipboardList } from "lucide-react-native";

export default function PaymentResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { clearCart } = useCart();
  const [loading, setLoading] = useState(true);

  // Params: status=success|failed, orderId, code, message
  const status = params.status as string || "success"; 
  const orderId = params.orderId as string || "ORD-" + Math.floor(Math.random() * 1000000);
  const message = params.message as string;

  useEffect(() => {
    if (status === "success") {
      clearCart();
    }

    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, [status]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-zinc-950">
        <ActivityIndicator size="large" color="#eab308" />
        <Text className="mt-4 text-zinc-500 dark:text-zinc-400 font-medium">
          Đang xử lý kết quả thanh toán...
        </Text>
      </View>
    );
  }

  const isSuccess = status === "success";

  return (
    <SafeAreaView className="flex-1 bg-zinc-50 dark:bg-zinc-950">
      <Stack.Screen options={{ headerShown: false }} />
      
      <VStack className="flex-1 items-center justify-center p-6">
        {/* Status Icon */}
        <Box className={`w-24 h-24 rounded-full items-center justify-center mb-8 ${isSuccess ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
          <Icon 
            as={isSuccess ? CheckCircle2 : AlertCircle} 
            className={`w-12 h-12 ${isSuccess ? 'text-green-600' : 'text-red-600'}`} 
          />
        </Box>

        <Text className={`text-2xl font-black mb-3 ${isSuccess ? 'text-zinc-900 dark:text-white' : 'text-red-600'}`}>
          {isSuccess ? "Thanh toán thành công!" : "Thanh toán thất bại"}
        </Text>

        <Text className="text-zinc-500 dark:text-zinc-400 text-center mb-10 leading-relaxed px-4">
          {isSuccess
            ? `Đơn hàng #${orderId} đã được đặt thành công. Chúng tôi sẽ sớm giao hàng đến cho bạn.`
            : `Đã xảy ra lỗi trong quá trình thanh toán.\n${message || "Vui lòng kiểm tra lại số dư hoặc phương thức thanh toán."}`}
        </Text>

        {isSuccess && (
          <Box className="w-full bg-white dark:bg-zinc-900 rounded-3xl p-5 mb-8 border border-zinc-100 dark:border-zinc-800 shadow-sm">
            <HStack className="justify-between items-center mb-4">
              <Text className="text-zinc-500 text-sm">Mã đơn hàng</Text>
              <Text className="text-zinc-900 dark:text-white font-bold">{orderId}</Text>
            </HStack>
            <HStack className="justify-between items-center mb-4">
              <Text className="text-zinc-500 text-sm">Phương thức</Text>
              <Text className="text-zinc-900 dark:text-white font-bold">Thanh toán Online</Text>
            </HStack>
            <HStack className="justify-between items-center">
              <Text className="text-zinc-500 text-sm">Thời gian</Text>
              <Text className="text-zinc-900 dark:text-white font-bold">{new Date().toLocaleDateString('vi-VN')}</Text>
            </HStack>
          </Box>
        )}

        <VStack className="w-full space-y-4 gap-4">
          {isSuccess ? (
            <>
              <Pressable
                className="bg-zinc-900 dark:bg-zinc-100 w-full h-14 rounded-2xl items-center justify-center shadow-lg active:opacity-90"
                onPress={() => router.push("/orders/my-orders" as any)}
              >
                <HStack className="items-center gap-2">
                  <Icon as={ClipboardList} className="text-white dark:text-zinc-900 w-5 h-5" />
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
                  <Icon as={Home} className="text-zinc-700 dark:text-zinc-300 w-5 h-5" />
                  <Text className="text-zinc-700 dark:text-zinc-300 font-bold text-base">
                    VỀ TRANG CHỦ
                  </Text>
                </HStack>
              </Pressable>
            </>
          ) : (
            <Pressable
              className="bg-yellow-500 w-full h-14 rounded-2xl items-center justify-center shadow-lg active:opacity-90"
              onPress={() => router.back()}
            >
              <Text className="text-zinc-900 font-extrabold text-base">
                THỬ LẠI
              </Text>
            </Pressable>
          )}
        </VStack>
      </VStack>
    </SafeAreaView>
  );
}
