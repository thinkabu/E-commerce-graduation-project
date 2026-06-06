import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  View,
  Image,
} from 'react-native';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import Header from '@/components/Header';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Button, ButtonText } from '@/components/ui/button';
import { Clock, CheckCircle2, Package, XCircle, MapPin, CreditCard, Receipt, Star } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { getOrderById, type Order } from '@/services/order.service';

const formatPrice = (price: number) => price.toLocaleString('vi-VN') + '₫';

const formatDate = (dateString: string) => {
  const d = new Date(dateString);
  return d.toLocaleDateString('vi-VN') + ' ' + d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'PENDING':
      return { label: 'Chờ xử lý', icon: Clock, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30', desc: 'Đơn hàng đang chờ được xác nhận.' };
    case 'PROCESSING':
      return { label: 'Đang chuẩn bị', icon: Package, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30', desc: 'Người bán đang chuẩn bị hàng.' };
    case 'SHIPPING':
      return { label: 'Đang giao', icon: Package, color: 'text-indigo-500', bg: 'bg-indigo-100 dark:bg-indigo-900/30', desc: 'Đơn hàng đang trên đường giao đến bạn.' };
    case 'DELIVERED':
      return { label: 'Hoàn thành', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30', desc: 'Đơn hàng đã được giao thành công.' };
    case 'CANCELLED':
      return { label: 'Đã hủy', icon: XCircle, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30', desc: 'Đơn hàng đã bị hủy.' };
    default:
      return { label: status, icon: Clock, color: 'text-zinc-500', bg: 'bg-zinc-100 dark:bg-zinc-800', desc: '' };
  }
};

const SectionLabel = ({ label }: { label: string }) => (
  <Text className="text-[11px] font-black text-zinc-400 uppercase tracking-widest mb-3 ml-1">
    {label}
  </Text>
);

const OrderDetailScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !user) return;
    const fetchOrder = async () => {
      try {
        const data = await getOrderById(id, user._id);
        setOrder(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1 }} className="bg-zinc-50 dark:bg-zinc-950">
        <Stack.Screen options={{ headerShown: false }} />
        <Header title="Chi tiết đơn hàng" />
        <Box className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#EAB308" />
        </Box>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={{ flex: 1 }} className="bg-zinc-50 dark:bg-zinc-950">
        <Stack.Screen options={{ headerShown: false }} />
        <Header title="Chi tiết đơn hàng" />
        <Box className="flex-1 items-center justify-center p-8">
          <Text className="text-zinc-500 text-center font-bold">Không tìm thấy đơn hàng</Text>
        </Box>
      </SafeAreaView>
    );
  }

  const statusConf = getStatusConfig(order.orderStatus);

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-zinc-50 dark:bg-zinc-950">
      <Stack.Screen options={{ headerShown: false }} />
      <Header title="Chi tiết đơn hàng" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 }}
      >
        {/* Status Header */}
        <VStack className={`mb-7 p-5 rounded-3xl ${statusConf.bg} border border-transparent`}>
           <HStack className="items-center space-x-3 gap-3 mb-2">
              <Icon as={statusConf.icon} className={`${statusConf.color} w-6 h-6`} />
              <Text className={`text-lg font-black uppercase ${statusConf.color}`}>
                 {statusConf.label}
              </Text>
           </HStack>
           <Text className={`text-xs font-medium ${statusConf.color} opacity-80 leading-relaxed`}>
              {statusConf.desc}
           </Text>
        </VStack>

        {/* Order Info */}
        <VStack className="mb-7 bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
           <HStack className="justify-between items-center mb-3">
              <Text className="text-xs text-zinc-500">Mã đơn hàng</Text>
              <Text className="text-sm font-black text-zinc-900 dark:text-white uppercase">{order.orderId}</Text>
           </HStack>
           <HStack className="justify-between items-center mb-3">
              <Text className="text-xs text-zinc-500">Ngày đặt</Text>
              <Text className="text-sm font-bold text-zinc-900 dark:text-zinc-300">{formatDate(order.createdAt)}</Text>
           </HStack>
           <HStack className="justify-between items-center">
              <Text className="text-xs text-zinc-500">Phương thức TT</Text>
              <Text className="text-sm font-bold text-zinc-900 dark:text-zinc-300">{order.paymentMethod} • {order.paymentStatus}</Text>
           </HStack>
        </VStack>

        {/* Shipping Address */}
        <VStack className="mb-7">
          <SectionLabel label="Địa chỉ nhận hàng" />
          <Box className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm p-5">
            <HStack className="items-start space-x-4 gap-4">
              <Box className="w-10 h-10 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 items-center justify-center mt-1">
                <Icon as={MapPin} className="text-yellow-600 w-5 h-5" />
              </Box>
              <VStack className="flex-1 space-y-1 gap-1">
                <Text className="text-sm font-black text-zinc-900 dark:text-white">
                  {order.shippingAddressSnapshot.fullName}
                </Text>
                <Text className="text-xs text-zinc-500">{order.shippingAddressSnapshot.phone}</Text>
                <Text className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mt-1">
                  {order.shippingAddressSnapshot.street}, {order.shippingAddressSnapshot.ward}, {order.shippingAddressSnapshot.district}, {order.shippingAddressSnapshot.province}
                </Text>
                {order.shippingAddressSnapshot.note && (
                  <Text className="text-xs text-zinc-400 italic mt-1">Ghi chú: {order.shippingAddressSnapshot.note}</Text>
                )}
              </VStack>
            </HStack>
          </Box>
        </VStack>

        {/* Order Items */}
        <VStack className="mb-7">
          <SectionLabel label="Sản phẩm" />
          <VStack className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden">
             {order.items.map((item, index) => (
                <React.Fragment key={index}>
                  <HStack className="p-4 items-center space-x-4 gap-4">
                    <Image
                      source={{ uri: item.productSnapshot.image }}
                      style={{ width: 64, height: 64, borderRadius: 12, backgroundColor: '#f4f4f5' }}
                    />
                    <VStack className="flex-1 space-y-1 gap-1">
                      <Text className="text-sm font-bold text-zinc-900 dark:text-white leading-snug" numberOfLines={2}>
                        {item.productSnapshot.name}
                      </Text>
                      {item.productSnapshot.variantName && (
                        <Text className="text-[11px] text-zinc-500 font-medium">
                           Phân loại: {item.productSnapshot.variantName}
                        </Text>
                      )}
                      <HStack className="justify-between items-center mt-1">
                        <Text className="text-sm font-black text-yellow-600">
                          {formatPrice(item.unitPrice)}
                        </Text>
                        <Text className="text-xs font-black text-zinc-500">
                          x{item.quantity}
                        </Text>
                      </HStack>
                    </VStack>
                  </HStack>
                  {index < order.items.length - 1 && (
                    <Box className="h-px bg-zinc-50 dark:bg-zinc-800 mx-4" />
                  )}
                </React.Fragment>
             ))}
          </VStack>
        </VStack>

        {/* Payment Summary */}
        <VStack className="mb-7 bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
           <HStack className="items-center space-x-2 gap-2 mb-4">
              <Icon as={Receipt} className="text-zinc-800 dark:text-zinc-200 w-5 h-5" />
              <Text className="text-sm font-black text-zinc-900 dark:text-white uppercase">Thanh toán</Text>
           </HStack>

           <VStack className="space-y-3 gap-3 mb-4">
              <HStack className="justify-between">
                <Text className="text-xs text-zinc-500">Tổng tiền hàng</Text>
                <Text className="text-xs font-bold text-zinc-700 dark:text-zinc-300">{formatPrice(order.subtotal)}</Text>
              </HStack>
              <HStack className="justify-between">
                <Text className="text-xs text-zinc-500">Phí vận chuyển</Text>
                <Text className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  {order.shippingFee === 0 ? 'Miễn phí' : formatPrice(order.shippingFee)}
                </Text>
              </HStack>
              {order.discount > 0 && (
                <HStack className="justify-between">
                  <Text className="text-xs text-zinc-500">Giảm giá</Text>
                  <Text className="text-xs font-bold text-green-600">-{formatPrice(order.discount)}</Text>
                </HStack>
              )}
           </VStack>

           <Box className="h-px bg-zinc-100 dark:bg-zinc-800 mb-4" />

           <HStack className="justify-between items-center">
             <Text className="text-sm font-black text-zinc-900 dark:text-white uppercase">Thành tiền</Text>
             <Text className="text-xl font-black text-yellow-600">{formatPrice(order.totalAmount)}</Text>
           </HStack>
        </VStack>

         {/* Review Button (only for DELIVERED orders) */}
         {order.orderStatus === 'DELIVERED' && (
           <VStack className="mb-7">
             <SectionLabel label="Đánh giá sản phẩm" />
             <VStack className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden">
               {order.items.map((item, index) => (
                 <Pressable
                   key={index}
                   onPress={() => router.push({
                     pathname: '/profile/write-review' as any,
                     params: {
                       productId: item.productId as any,
                       orderId: (order as any)._id,
                       productName: item.productSnapshot.name,
                       productImage: item.productSnapshot.image,
                     }
                   })}
                   className={`flex-row items-center p-4 active:bg-zinc-50 dark:active:bg-zinc-800 ${index < order.items.length - 1 ? 'border-b border-zinc-50 dark:border-zinc-800' : ''}`}
                 >
                   <Image
                     source={{ uri: item.productSnapshot.image }}
                     style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: '#f4f4f5' }}
                   />
                   <VStack className="flex-1 ml-3">
                     <Text className="text-sm font-bold text-zinc-900 dark:text-white" numberOfLines={1}>
                       {item.productSnapshot.name}
                     </Text>
                     <HStack className="items-center space-x-1 gap-1 mt-1">
                       {[1,2,3,4,5].map(s => (
                         <Icon key={s} as={Star} className="w-3 h-3 text-zinc-200 dark:text-zinc-700" />
                       ))}
                       <Text className="text-[10px] text-zinc-400 ml-1">Chưa đánh giá</Text>
                     </HStack>
                   </VStack>
                   <Box className="bg-yellow-400 px-3 py-2 rounded-xl">
                     <Text className="text-xs font-bold text-zinc-900">Đánh giá</Text>
                   </Box>
                 </Pressable>
               ))}
             </VStack>
           </VStack>
         )}

      </ScrollView>
    </SafeAreaView>
  );
};

export default OrderDetailScreen;
