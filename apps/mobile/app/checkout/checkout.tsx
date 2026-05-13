import React, { useState } from 'react';
import { ScrollView, SafeAreaView, Image, Modal, Dimensions, Animated, Easing } from 'react-native';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import Header from '@/components/Header';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Button, ButtonText } from '@/components/ui/button';
import { 
  ChevronLeft, 
  MapPin, 
  CreditCard, 
  ShieldCheck, 
  ChevronRight,
  Wallet,
  CheckCircle2,
  X
} from 'lucide-react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const CheckoutScreen = () => {
  const router = useRouter();
  const { mode, productId, quantity } = useLocalSearchParams();

  // Mock checkout data
  const checkoutData = {
    address: {
      name: 'Nguyễn Văn A',
      phone: '0376717480',
      address: '123 Đường 3/2, Phường 12, Quận 10, TP. Hồ Chí Minh'
    },
    items: [
      { id: '1', name: 'iPhone 15 Pro Max 256GB - Titan Tự Nhiên', price: 34990000, quantity: 1, image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=200&auto=format&fit=crop' }
    ],
    summary: {
      subtotal: 34990000,
      shipping: 30000,
      discount: 0,
      total: 35020000
    }
  };

  const [paymentMethod, setPaymentMethod] = useState('Blockchain');
  const [showSuccess, setShowSuccess] = useState(false);
  const successAnim = React.useRef(new Animated.Value(0)).current;

  const handlePlaceOrder = () => {
    setShowSuccess(true);
    Animated.spring(successAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7
    }).start();
  };

  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-zinc-50 dark:bg-zinc-950">
      <Stack.Screen options={{ headerShown: false }} />
      <Header title="Thanh toán" />

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-5 pt-6">
        
        {/* Shipping Address Section */}
        <VStack className="mb-8">
          <Text className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 ml-1">Địa chỉ nhận hàng</Text>
          <Pressable 
            onPress={() => router.push('/address/my-addresses')}
            className="bg-white dark:bg-zinc-900 p-5 rounded-[32px] border border-zinc-100 dark:border-zinc-800 shadow-sm flex-row items-center"
          >
            <Box className="w-12 h-12 rounded-2xl bg-yellow-100 dark:bg-yellow-900/30 items-center justify-center mr-4">
              <Icon as={MapPin} className="text-yellow-600 w-6 h-6" />
            </Box>
            <VStack className="flex-1">
              <Text className="text-sm font-black text-zinc-900 dark:text-white">{checkoutData.address.name} • {checkoutData.address.phone}</Text>
              <Text className="text-xs text-zinc-500 mt-0.5" numberOfLines={1}>{checkoutData.address.address}</Text>
            </VStack>
            <Icon as={ChevronRight} className="text-zinc-300 w-5 h-5 ml-2" />
          </Pressable>
        </VStack>

        {/* Order Items */}
        <VStack className="mb-8">
          <Text className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 ml-1">Sản phẩm của bạn</Text>
          {checkoutData.items.map((item) => (
            <Box key={item.id} className="bg-white dark:bg-zinc-900 p-4 rounded-[32px] border border-zinc-100 dark:border-zinc-800 shadow-sm mb-3">
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

        {/* Payment Methods */}
        <VStack className="mb-8">
          <Text className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 ml-1">Phương thức thanh toán</Text>
          <VStack className="space-y-3 gap-3">
            {[
              { id: 'Blockchain', label: 'Blockchain (USDT)', icon: Wallet, desc: 'An toàn, bảo mật cao' },
              { id: 'COD', label: 'Thanh toán khi nhận hàng', icon: CreditCard, desc: 'Nhận hàng rồi mới trả tiền' }
            ].map((method) => (
              <Pressable 
                key={method.id}
                onPress={() => setPaymentMethod(method.id)}
                className={`p-5 rounded-[32px] border-2 flex-row items-center ${
                  paymentMethod === method.id ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10' : 'border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900'
                }`}
              >
                <Box className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 ${
                  paymentMethod === method.id ? 'bg-yellow-500' : 'bg-zinc-100 dark:bg-zinc-800'
                }`}>
                  <Icon as={method.icon} className={paymentMethod === method.id ? 'text-zinc-900' : 'text-zinc-400'} size="md" />
                </Box>
                <VStack className="flex-1">
                  <Text className={`text-sm font-black ${paymentMethod === method.id ? 'text-zinc-900 dark:text-yellow-500' : 'text-zinc-500'}`}>{method.label}</Text>
                  <Text className="text-[10px] text-zinc-400">{method.desc}</Text>
                </VStack>
                {paymentMethod === method.id && <Icon as={CheckCircle2} className="text-yellow-600 w-6 h-6" />}
              </Pressable>
            ))}
          </VStack>
        </VStack>

        {/* Order Summary */}
        <Box className="bg-zinc-900 dark:bg-zinc-900 p-8 rounded-[40px] mb-32 shadow-xl">
          <VStack className="space-y-4 gap-4">
            <HStack className="justify-between">
              <Text className="text-zinc-400 text-sm">Tạm tính</Text>
              <Text className="text-white text-sm font-bold">{formatPrice(checkoutData.summary.subtotal)}₫</Text>
            </HStack>
            <HStack className="justify-between">
              <Text className="text-zinc-400 text-sm">Phí vận chuyển</Text>
              <Text className="text-white text-sm font-bold">+{formatPrice(checkoutData.summary.shipping)}₫</Text>
            </HStack>
            <Box className="h-px bg-zinc-800 my-1" />
            <HStack className="justify-between items-center">
              <Text className="text-white text-lg font-black uppercase tracking-wider">Tổng cộng</Text>
              <Text className="text-yellow-500 text-2xl font-black">{formatPrice(checkoutData.summary.total)}₫</Text>
            </HStack>
          </VStack>
        </Box>

      </ScrollView>

      {/* Place Order Button */}
      <Box className="absolute bottom-0 left-0 right-0 p-5 bg-white dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-800 pb-8">
        <Button 
          onPress={handlePlaceOrder}
          className="bg-yellow-500 h-16 rounded-[24px] shadow-xl active:opacity-90"
        >
          <ButtonText className="text-zinc-900 font-black text-lg uppercase tracking-wider">Đặt hàng ngay</ButtonText>
        </Button>
      </Box>

      {/* Success Modal */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <Box className="flex-1 bg-black/80 items-center justify-center px-8">
          <Animated.View 
            style={{ 
              transform: [{ scale: successAnim }],
              opacity: successAnim 
            }}
            className="bg-white dark:bg-zinc-900 w-full p-10 rounded-[48px] items-center"
          >
            <Box className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 items-center justify-center mb-6">
              <Icon as={CheckCircle2} className="text-green-500 w-12 h-12" />
            </Box>
            <Text className="text-2xl font-black text-zinc-900 dark:text-white text-center mb-2 uppercase tracking-tighter">Đặt hàng thành công!</Text>
            <Text className="text-sm text-zinc-500 text-center mb-8">Cảm ơn bạn đã tin tưởng Think hearT DIGITAL. Đơn hàng của bạn đang được xử lý.</Text>
            <Button 
              onPress={() => {
                setShowSuccess(false);
                router.replace('/(tabs)/home');
              }}
              className="bg-zinc-900 dark:bg-yellow-500 w-full h-14 rounded-2xl"
            >
              <ButtonText className="text-white dark:text-zinc-900 font-bold uppercase">Về trang chủ</ButtonText>
            </Button>
          </Animated.View>
        </Box>
      </Modal>

    </SafeAreaView>
  );
};

export default CheckoutScreen;
