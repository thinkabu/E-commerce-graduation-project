import React, { useState, useCallback } from 'react';
import {
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  View,
} from 'react-native';
import { useRouter, Stack, useFocusEffect } from 'expo-router';
import Header from '@/components/Header';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { ShoppingBag, ChevronRight, Package, Clock, CheckCircle2, XCircle } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { getUserOrders, type Order } from '@/services/order.service';

const formatPrice = (price: number) => price.toLocaleString('vi-VN') + '₫';

const formatDate = (dateString: string) => {
  const d = new Date(dateString);
  return d.toLocaleDateString('vi-VN') + ' ' + d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'PENDING':
      return { label: 'Chờ xử lý', icon: Clock, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30' };
    case 'PROCESSING':
      return { label: 'Đang chuẩn bị', icon: Package, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' };
    case 'SHIPPING':
      return { label: 'Đang giao', icon: Package, color: 'text-indigo-500', bg: 'bg-indigo-100 dark:bg-indigo-900/30' };
    case 'DELIVERED':
      return { label: 'Hoàn thành', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' };
    case 'CANCELLED':
      return { label: 'Đã hủy', icon: XCircle, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' };
    default:
      return { label: status, icon: Clock, color: 'text-zinc-500', bg: 'bg-zinc-100 dark:bg-zinc-800' };
  }
};

const OrderHistoryScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    if (!user) return;
    try {
      const data = await getUserOrders(user._id);
      setOrders(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1 }} className="bg-zinc-50 dark:bg-zinc-950">
        <Stack.Screen options={{ headerShown: false }} />
        <Header title="Lịch sử đơn hàng" />
        <Box className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#EAB308" />
        </Box>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-zinc-50 dark:bg-zinc-950">
      <Stack.Screen options={{ headerShown: false }} />
      <Header title="Lịch sử đơn hàng" />

      {orders.length === 0 ? (
        <VStack className="flex-1 items-center justify-center p-8 space-y-4 gap-4">
          <Box className="w-24 h-24 rounded-full bg-zinc-100 dark:bg-zinc-900 items-center justify-center">
            <Icon as={ShoppingBag} className="text-zinc-400 w-10 h-10" />
          </Box>
          <Text className="text-zinc-500 text-center text-sm font-medium">
            Bạn chưa có đơn hàng nào
          </Text>
        </VStack>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <VStack className="space-y-4 gap-4">
            {orders.map((order) => {
              const statusConf = getStatusConfig(order.orderStatus);
              
              return (
                <Pressable
                  key={order._id}
                  onPress={() => router.push({ pathname: '/profile/order-detail', params: { id: order._id } } as any)}
                  className="bg-white dark:bg-zinc-900 p-5 rounded-3xl shadow-sm border border-zinc-100 dark:border-zinc-800"
                >
                  <HStack className="justify-between items-start mb-3">
                    <VStack>
                      <Text className="text-sm font-black text-zinc-900 dark:text-white uppercase">
                        {order.orderId}
                      </Text>
                      <Text className="text-[11px] text-zinc-400 mt-0.5">
                        {formatDate(order.createdAt)}
                      </Text>
                    </VStack>
                    <Box className={`${statusConf.bg} px-2.5 py-1 rounded-lg flex-row items-center space-x-1.5 gap-1.5`}>
                      <Icon as={statusConf.icon} className={`${statusConf.color} w-3 h-3`} />
                      <Text className={`text-[10px] font-black uppercase ${statusConf.color}`}>
                        {statusConf.label}
                      </Text>
                    </Box>
                  </HStack>

                  <Box className="h-px bg-zinc-100 dark:bg-zinc-800 my-3" />

                  <HStack className="justify-between items-center mb-1">
                    <Text className="text-xs text-zinc-500">Số lượng SP:</Text>
                    <Text className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                      {order.items.reduce((acc, i) => acc + i.quantity, 0)}
                    </Text>
                  </HStack>
                  <HStack className="justify-between items-center">
                    <Text className="text-xs text-zinc-500">Tổng thanh toán:</Text>
                    <Text className="text-base font-black text-yellow-600">
                      {formatPrice(order.totalAmount)}
                    </Text>
                  </HStack>

                  <HStack className="justify-between items-center mt-4">
                    <Text className="text-[10px] font-black text-zinc-400 tracking-wider">
                       {order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' : order.paymentMethod} • {order.paymentStatus}
                    </Text>
                    <HStack className="items-center space-x-1">
                      <Text className="text-xs font-bold text-yellow-600">Chi tiết</Text>
                      <Icon as={ChevronRight} className="text-yellow-600 w-4 h-4" />
                    </HStack>
                  </HStack>
                </Pressable>
              );
            })}
          </VStack>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default OrderHistoryScreen;
