import React from 'react';
import { ScrollView, SafeAreaView } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { ChevronLeft, ClipboardList, Package } from 'lucide-react-native';

const MyOrdersScreen = () => {
  const router = useRouter();

  const mockOrders = [
    { id: 'ORD-772910', date: '02/05/2026', total: 8530000, status: 'Đang xử lý' },
    { id: 'ORD-654321', date: '28/04/2026', total: 9500000, status: 'Đã giao hàng' },
  ];

  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-zinc-50 dark:bg-zinc-950">
      <Stack.Screen options={{ 
        title: 'Đơn hàng của tôi',
        headerLeft: () => (
          <Pressable onPress={() => router.back()} className="mr-4">
            <Icon as={ChevronLeft} className="text-zinc-900 dark:text-white" />
          </Pressable>
        ),
      }} />

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-5 pt-6">
        <VStack className="space-y-4 gap-4">
          {mockOrders.map((order) => (
            <Pressable 
              key={order.id}
              onPress={() => router.push(`/orders/order-detail?id=${order.id}` as any)}
              className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm"
            >
              <HStack className="justify-between items-start mb-4">
                <HStack className="items-center space-x-3 gap-3">
                  <Box className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-800 items-center justify-center">
                    <Icon as={Package} className="text-zinc-700 dark:text-zinc-300 w-5 h-5" />
                  </Box>
                  <VStack>
                    <Text className="text-sm font-bold text-zinc-900 dark:text-white">{order.id}</Text>
                    <Text className="text-xs text-zinc-400">{order.date}</Text>
                  </VStack>
                </HStack>
                <Box className="bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1 rounded-full">
                  <Text className="text-[10px] font-bold text-yellow-700 dark:text-yellow-500">{order.status}</Text>
                </Box>
              </HStack>

              <HStack className="justify-between items-center pt-4 border-t border-zinc-50 dark:border-zinc-800">
                <Text className="text-sm text-zinc-500">Tổng thanh toán</Text>
                <Text className="text-base font-bold text-zinc-900 dark:text-white">{formatPrice(order.total)}₫</Text>
              </HStack>
            </Pressable>
          ))}
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MyOrdersScreen;
