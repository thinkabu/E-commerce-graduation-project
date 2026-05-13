import React from 'react';
import { ScrollView, SafeAreaView, StatusBar } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import Header from '@/components/Header';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { 
  ChevronLeft, 
  Package, 
  Calendar, 
  CreditCard, 
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  Truck
} from 'lucide-react-native';

const MyOrdersScreen = () => {
  const router = useRouter();

  const mockOrders = [
    { 
      id: 'ORD-772910', 
      date: '02/05/2026', 
      total: 8530000, 
      status: 'Processing',
      itemsCount: 3,
      paymentMethod: 'VNPAY'
    },
    { 
      id: 'ORD-654321', 
      date: '28/04/2026', 
      total: 12500000, 
      status: 'Shipped',
      itemsCount: 1,
      paymentMethod: 'Blockchain'
    },
    { 
      id: 'ORD-123456', 
      date: '25/04/2026', 
      total: 1500000, 
      status: 'Cancelled',
      itemsCount: 2,
      paymentMethod: 'COD'
    },
  ];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Processing': return { color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20', icon: Clock, label: 'Đang xử lý' };
      case 'Shipped': return { color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20', icon: Truck, label: 'Đang giao' };
      case 'Delivered': return { color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', icon: CheckCircle2, label: 'Đã giao' };
      case 'Cancelled': return { color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20', icon: XCircle, label: 'Đã hủy' };
      default: return { color: 'text-zinc-500', bg: 'bg-zinc-50 dark:bg-zinc-800', icon: Package, label: status };
    }
  };

  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-zinc-50 dark:bg-zinc-950">
      <Stack.Screen options={{ headerShown: false }} />
      <Header title="Lịch sử mua hàng" />

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-5 pt-6">
        <VStack className="space-y-4 gap-4 mb-10">
          {mockOrders.map((order) => {
            const status = getStatusStyle(order.status);
            return (
              <Pressable 
                key={order.id}
                onPress={() => router.push(`/orders/order-detail?id=${order.id}` as any)}
                className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm active:opacity-90"
              >
                <HStack className="justify-between items-center mb-4">
                  <Box className="bg-zinc-900 dark:bg-yellow-500 px-3 py-1.5 rounded-xl">
                    <Text className="text-[10px] font-black text-white dark:text-zinc-900 uppercase tracking-tighter">
                      #{order.id}
                    </Text>
                  </Box>
                  <Box className={`${status.bg} px-3 py-1.5 rounded-xl flex-row items-center`}>
                    <Icon as={status.icon} size="xs" className={status.color} />
                    <Text className={`text-[10px] font-black ml-1.5 uppercase ${status.color}`}>
                      {status.label}
                    </Text>
                  </Box>
                </HStack>

                <VStack className="space-y-3 gap-3 mb-4">
                  <HStack className="items-center justify-between">
                    <HStack className="items-center space-x-2 gap-2">
                      <Icon as={Calendar} className="text-zinc-400 w-4 h-4" />
                      <Text className="text-sm text-zinc-500 font-medium">{order.date}</Text>
                    </HStack>
                    <Text className="text-xs text-zinc-400 font-medium">{order.itemsCount} sản phẩm</Text>
                  </HStack>

                  <HStack className="items-center justify-between">
                    <HStack className="items-center space-x-2 gap-2">
                      <Icon as={CreditCard} className="text-zinc-400 w-4 h-4" />
                      <Text className="text-sm text-zinc-500 font-medium">{order.paymentMethod}</Text>
                    </HStack>
                  </HStack>
                </VStack>

                <HStack className="justify-between items-center pt-4 border-t border-zinc-50 dark:border-zinc-800">
                  <VStack>
                    <Text className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">Tổng tiền</Text>
                    <Text className="text-lg font-black text-zinc-900 dark:text-white">
                      {formatPrice(order.total)}₫
                    </Text>
                  </VStack>
                  <Box className="w-10 h-10 rounded-full bg-zinc-50 dark:bg-zinc-800 items-center justify-center">
                    <Icon as={ChevronRight} className="text-zinc-400 w-5 h-5" />
                  </Box>
                </HStack>
              </Pressable>
            );
          })}
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MyOrdersScreen;
