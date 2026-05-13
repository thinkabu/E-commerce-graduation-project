import React from 'react';
import { ScrollView, SafeAreaView, Image } from 'react-native';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import Header from '@/components/Header';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { 
  ChevronLeft, 
  MapPin, 
  Phone, 
  User, 
  CreditCard, 
  Package, 
  Clock, 
  CheckCircle2,
  Truck,
  ShieldCheck,
  Copy
} from 'lucide-react-native';

const OrderDetailScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const mockOrder = {
    id: id || 'ORD-772910',
    date: '02/05/2026 14:30',
    status: 'Processing',
    items: [
      { id: '1', name: 'iPhone 15 Pro Max 256GB - Titan Tự Nhiên', price: 34990000, quantity: 1, image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=200&auto=format&fit=crop' },
      { id: '2', name: 'Ốp lưng Silicone Case with MagSafe', price: 1450000, quantity: 1, image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=200&auto=format&fit=crop' }
    ],
    address: {
      name: 'Nguyễn Văn A',
      phone: '0376717480',
      address: '123 Đường 3/2, Phường 12, Quận 10, TP. Hồ Chí Minh'
    },
    payment: {
      method: 'Blockchain (USDT)',
      subtotal: 36440000,
      shipping: 30000,
      discount: 500000,
      total: 35970000
    },
    timeline: [
      { title: 'Đã đặt hàng', time: '02/05/2026 14:30', completed: true },
      { title: 'Đang chuẩn bị hàng', time: '02/05/2026 15:45', completed: true },
      { title: 'Đang vận chuyển', time: '--', completed: false },
      { title: 'Giao hàng thành công', time: '--', completed: false }
    ]
  };

  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-zinc-50 dark:bg-zinc-950">
      <Stack.Screen options={{ headerShown: false }} />
      <Header title="Chi tiết đơn hàng" />

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        
        {/* Order Status Banner */}
        <Box className="bg-yellow-500 p-8 rounded-b-[40px] items-center justify-center">
          <Icon as={Clock} className="text-zinc-900 size-12 mb-3" />
          <Text className="text-2xl font-black text-zinc-900 uppercase tracking-tighter">Đang xử lý</Text>
          <Text className="text-sm text-zinc-900/60 font-medium mt-1">Dự kiến giao hàng: 05/05/2026</Text>
        </Box>

        <VStack className="px-5 -mt-6 space-y-6 gap-6 pb-20">
          
          {/* Order Info Card */}
          <Box className="bg-white dark:bg-zinc-900 p-5 rounded-3xl shadow-sm border border-zinc-100 dark:border-zinc-800">
            <HStack className="justify-between items-center pb-4 border-b border-zinc-50 dark:border-zinc-800 mb-4">
              <VStack>
                <Text className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">Mã đơn hàng</Text>
                <HStack className="items-center space-x-2 gap-2">
                  <Text className="text-base font-black text-zinc-900 dark:text-white uppercase">#{mockOrder.id}</Text>
                  <Pressable><Icon as={Copy} size="xs" className="text-zinc-300" /></Pressable>
                </HStack>
              </VStack>
              <VStack className="items-end">
                <Text className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">Ngày đặt</Text>
                <Text className="text-sm font-bold text-zinc-700 dark:text-zinc-300">{mockOrder.date}</Text>
              </VStack>
            </HStack>

            {/* Timeline Mini */}
            <VStack className="space-y-4 gap-4">
              {mockOrder.timeline.map((step, index) => (
                <HStack key={index} className="items-start space-x-3 gap-3">
                  <VStack className="items-center">
                    <Box className={`w-5 h-5 rounded-full items-center justify-center ${step.completed ? 'bg-yellow-500' : 'bg-zinc-100 dark:bg-zinc-800'}`}>
                      <Box className={`w-2 h-2 rounded-full ${step.completed ? 'bg-zinc-900' : 'bg-zinc-300'}`} />
                    </Box>
                    {index < mockOrder.timeline.length - 1 && (
                      <Box className={`w-0.5 h-6 ${step.completed ? 'bg-yellow-500' : 'bg-zinc-100 dark:bg-zinc-800'}`} />
                    )}
                  </VStack>
                  <VStack className="flex-1 -mt-0.5">
                    <Text className={`text-sm font-bold ${step.completed ? 'text-zinc-900 dark:text-white' : 'text-zinc-400'}`}>
                      {step.title}
                    </Text>
                    {step.time !== '--' && (
                      <Text className="text-xs text-zinc-500">{step.time}</Text>
                    )}
                  </VStack>
                </HStack>
              ))}
            </VStack>
          </Box>

          {/* Shipping Address */}
          <VStack className="space-y-3 gap-3">
            <Text className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">Địa chỉ nhận hàng</Text>
            <Box className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-100 dark:border-zinc-800">
              <HStack className="items-center space-x-3 gap-3 mb-3">
                <Box className="w-10 h-10 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 items-center justify-center">
                  <Icon as={MapPin} className="text-yellow-600 size-5" />
                </Box>
                <VStack>
                  <Text className="text-base font-black text-zinc-900 dark:text-white">{mockOrder.address.name}</Text>
                  <Text className="text-sm text-zinc-500 font-medium">{mockOrder.address.phone}</Text>
                </VStack>
              </HStack>
              <Text className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {mockOrder.address.address}
              </Text>
            </Box>
          </VStack>

          {/* Items List */}
          <VStack className="space-y-3 gap-3">
            <Text className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">Sản phẩm ({mockOrder.items.length})</Text>
            {mockOrder.items.map((item) => (
              <Box key={item.id} className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-100 dark:border-zinc-800">
                <HStack className="space-x-4 gap-4">
                  <Image source={{ uri: item.image }} className="w-20 h-20 rounded-2xl bg-zinc-50" />
                  <VStack className="flex-1 justify-center space-y-1 gap-1">
                    <Text className="text-sm font-bold text-zinc-900 dark:text-white" numberOfLines={2}>{item.name}</Text>
                    <HStack className="justify-between items-center">
                      <Text className="text-sm font-black text-yellow-600">{formatPrice(item.price)}₫</Text>
                      <Text className="text-xs text-zinc-400 font-bold">x{item.quantity}</Text>
                    </HStack>
                  </VStack>
                </HStack>
              </Box>
            ))}
          </VStack>

          {/* Payment Summary */}
          <VStack className="space-y-3 gap-3">
            <Text className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">Tổng kết thanh toán</Text>
            <Box className="bg-zinc-900 dark:bg-zinc-900 p-6 rounded-3xl">
              <VStack className="space-y-3 gap-3">
                <HStack className="justify-between">
                  <Text className="text-zinc-400 text-sm">Phương thức</Text>
                  <Text className="text-white text-sm font-bold">{mockOrder.payment.method}</Text>
                </HStack>
                <HStack className="justify-between">
                  <Text className="text-zinc-400 text-sm">Tạm tính</Text>
                  <Text className="text-white text-sm font-bold">{formatPrice(mockOrder.payment.subtotal)}₫</Text>
                </HStack>
                <HStack className="justify-between">
                  <Text className="text-zinc-400 text-sm">Phí vận chuyển</Text>
                  <Text className="text-white text-sm font-bold">+{formatPrice(mockOrder.payment.shipping)}₫</Text>
                </HStack>
                <HStack className="justify-between">
                  <Text className="text-zinc-400 text-sm">Giảm giá</Text>
                  <Text className="text-green-400 text-sm font-bold">-{formatPrice(mockOrder.payment.discount)}₫</Text>
                </HStack>
                <Box className="h-px bg-zinc-800 my-2" />
                <HStack className="justify-between items-center">
                  <Text className="text-white text-base font-black uppercase tracking-wider">Tổng cộng</Text>
                  <Text className="text-yellow-500 text-xl font-black">{formatPrice(mockOrder.payment.total)}₫</Text>
                </HStack>
              </VStack>
            </Box>
          </VStack>

        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
};

export default OrderDetailScreen;
