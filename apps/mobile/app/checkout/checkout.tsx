import React, { useState, useEffect } from 'react';
import { ScrollView, Image, ActivityIndicator, Alert, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Button, ButtonText } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useAddress } from '@/contexts/AddressContext';
import { usePayment } from '@/contexts/PaymentContext';
import { getProductById, Product, createOrder } from '@/Service/callApi';
import { 
  ChevronLeft, 
  MapPin, 
  CreditCard, 
  Wallet, 
  Truck, 
  ChevronRight,
  Bitcoin,
  Check,
  Ticket,
  Percent,
  X,
  Package
} from 'lucide-react-native';

interface CheckoutItem {
  product: Partial<Product>;
  quantity: number;
  price: number;
  variants?: Record<string, string>;
}

const CheckoutScreen = () => {
  const router = useRouter();
  const { mode, productId, quantity } = useLocalSearchParams();
  const { cartItems, clearCart, subtotal: cartSubtotal, shipping: cartShipping, total: cartTotal } = useCart();
  
  // These might be empty shells, so we handle undefined
  const auth = useAuth() as any;
  const address = useAddress() as any;
  const payment = usePayment() as any;

  const [loading, setLoading] = useState(true);
  const [checkoutItems, setCheckoutItems] = useState<CheckoutItem[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'Blockchain'>('COD');

  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  useEffect(() => {
    loadCheckoutData();
  }, [mode, productId]);

  const loadCheckoutData = async () => {
    try {
      setLoading(true);
      if (mode === 'cart') {
        if (cartItems && cartItems.length > 0) {
          setCheckoutItems(
            cartItems.map((item) => ({
              product: { _id: item.productId, name: item.name, images: [item.image] },
              quantity: item.quantity,
              price: item.price,
              variants: item.variants
            }))
          );
        }
      } else if (mode === 'single' && productId) {
        const product = await getProductById(productId as string);
        setCheckoutItems([
          {
            product,
            quantity: quantity ? parseInt(quantity as string) : 1,
            price: product.basePrice,
          },
        ]);
      }
    } catch (error) {
      console.error("Error loading checkout data:", error);
      Alert.alert("Lỗi", "Không thể tải thông tin đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    // Mock coupon logic
    if (couponCode.toUpperCase() === 'TECHSHOP50') {
      const discount = 50000;
      setAppliedCoupon({ code: 'TECHSHOP50', value: discount });
      setCouponDiscount(discount);
      setCouponCode("");
      Alert.alert("Thành công", "Đã áp dụng mã giảm giá 50.000₫");
    } else {
      Alert.alert("Lỗi", "Mã giảm giá không hợp lệ hoặc đã hết hạn");
    }
  };

  // Price calculations
  const itemsSubtotal = mode === 'single' 
    ? checkoutItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    : cartSubtotal;

  const shippingFee = itemsSubtotal > 5000000 ? 0 : 30000;
  const grandTotal = itemsSubtotal + shippingFee - couponDiscount;

  const handleConfirmOrder = async () => {
    try {
      setLoading(true);
      // Mock order creation
      const orderData = {
        items: checkoutItems,
        total: grandTotal,
        paymentMethod
      };
      const order = await createOrder(auth?.token || "mock-token", orderData);
      
      if (mode === 'cart') {
        clearCart();
      }

      router.push({
        pathname: '/checkout/payment-result' as any,
        params: { status: 'success', orderId: order._id }
      });
    } catch (error: any) {
      Alert.alert("Lỗi", error.message || "Không thể tạo đơn hàng.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && checkoutItems.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-zinc-950">
        <ActivityIndicator size="large" color="#eab308" />
        <Text className="mt-4 text-zinc-500 dark:text-zinc-400">Đang tải thông tin đơn hàng...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-zinc-50 dark:bg-zinc-950">
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <Box className="bg-white dark:bg-zinc-900 px-5 pt-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <HStack className="items-center">
          <Pressable onPress={() => router.back()} className="mr-4 w-10 h-10 items-center justify-center rounded-full bg-zinc-50 dark:bg-zinc-800">
            <Icon as={ChevronLeft} className="text-zinc-900 dark:text-white" />
          </Pressable>
          <Text className="text-xl font-black text-zinc-900 dark:text-white">Thanh toán</Text>
        </HStack>
      </Box>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-5 pt-6">
        {/* 1. Shipping Address */}
        <VStack className="mb-8">
          <Text className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 ml-1">Địa chỉ nhận hàng</Text>
          <Pressable className="bg-white dark:bg-zinc-900 p-5 rounded-[32px] border border-zinc-100 dark:border-zinc-800 shadow-sm flex-row items-center">
            <Box className="w-12 h-12 rounded-2xl bg-yellow-100 dark:bg-yellow-900/30 items-center justify-center mr-4">
              <Icon as={MapPin} className="text-yellow-600 w-6 h-6" />
            </Box>
            <VStack className="flex-1">
              <Text className="text-base font-bold text-zinc-900 dark:text-white">Nguyễn Văn A • 090 123 4567</Text>
              <Text className="text-sm text-zinc-500" numberOfLines={1}>123 Đường ABC, Quận 1, TP. Hồ Chí Minh</Text>
            </VStack>
            <Icon as={ChevronRight} className="text-zinc-400 w-5 h-5 ml-2" />
          </Pressable>
        </VStack>

        {/* 2. Order Items */}
        <VStack className="mb-8">
          <HStack className="justify-between items-center mb-3 ml-1">
            <Text className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Sản phẩm</Text>
            <Text className="text-xs font-bold text-yellow-600">{checkoutItems.length} món</Text>
          </HStack>
          <Box className="bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-100 dark:border-zinc-800 overflow-hidden shadow-sm">
            {checkoutItems.map((item, index) => (
              <HStack 
                key={`${item.product._id}-${index}`} 
                className={`p-4 items-center ${index < checkoutItems.length - 1 ? 'border-b border-zinc-50 dark:border-zinc-800' : ''}`}
              >
                <Image source={{ uri: item.product.images?.[0] }} className="w-16 h-16 rounded-2xl mr-4 bg-zinc-50 dark:bg-zinc-800" />
                <VStack className="flex-1">
                  <Text className="text-sm font-bold text-zinc-900 dark:text-white" numberOfLines={1}>{item.product.name}</Text>
                  <Text className="text-[10px] text-zinc-400 mt-0.5">
                    {item.variants ? Object.values(item.variants).join(' | ') : 'Tiêu chuẩn'} • SL: {item.quantity}
                  </Text>
                  <Text className="text-sm font-black text-zinc-900 dark:text-white mt-1">{formatPrice(item.price * item.quantity)}₫</Text>
                </VStack>
              </HStack>
            ))}
          </Box>
        </VStack>

        {/* 3. Coupon Section */}
        <VStack className="mb-8">
          <Text className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 ml-1">Mã giảm giá</Text>
          {appliedCoupon ? (
            <HStack className="bg-green-50 dark:bg-green-900/10 p-4 rounded-2xl border border-green-100 dark:border-green-900/30 items-center justify-between">
              <HStack className="items-center gap-3">
                <Box className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 items-center justify-center">
                  <Icon as={Ticket} className="text-green-600 w-5 h-5" />
                </Box>
                <VStack>
                  <Text className="text-sm font-bold text-green-700 dark:text-green-500">{appliedCoupon.code}</Text>
                  <Text className="text-xs text-green-600">Tiết kiệm {formatPrice(appliedCoupon.value)}₫</Text>
                </VStack>
              </HStack>
              <Pressable onPress={() => { setAppliedCoupon(null); setCouponDiscount(0); }}>
                <Icon as={X} className="text-red-500 w-5 h-5" />
              </Pressable>
            </HStack>
          ) : (
            <HStack className="gap-3">
              <Box className="flex-1 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 px-4 h-14 justify-center">
                <TextInput 
                  placeholder="Nhập mã ưu đãi..." 
                  placeholderTextColor="#a1a1aa"
                  value={couponCode}
                  onChangeText={setCouponCode}
                  className="text-zinc-900 dark:text-white font-medium"
                />
              </Box>
              <Pressable 
                onPress={handleApplyCoupon}
                className="bg-zinc-900 dark:bg-zinc-100 px-6 h-14 rounded-2xl items-center justify-center active:opacity-90 shadow-sm"
              >
                <Text className="text-white dark:text-zinc-900 font-bold">Áp dụng</Text>
              </Pressable>
            </HStack>
          )}
        </VStack>

        {/* 4. Payment Methods */}
        <VStack className="mb-10">
          <Text className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 ml-1">Phương thức thanh toán</Text>
          <VStack className="space-y-3 gap-3">
            {/* COD */}
            <Pressable 
              onPress={() => setPaymentMethod('COD')}
              className={`p-5 rounded-[24px] border-2 flex-row items-center ${paymentMethod === 'COD' ? 'border-yellow-500 bg-yellow-50/50 dark:bg-yellow-900/10' : 'border-white dark:border-zinc-900 bg-white dark:bg-zinc-900 shadow-sm'}`}
            >
              <Box className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 items-center justify-center mr-4">
                <Icon as={CreditCard} className="text-zinc-700 dark:text-zinc-300 w-6 h-6" />
              </Box>
              <VStack className="flex-1">
                <Text className="text-base font-bold text-zinc-900 dark:text-white">Khi nhận hàng (COD)</Text>
                <Text className="text-xs text-zinc-500">Thanh toán bằng tiền mặt</Text>
              </VStack>
              {paymentMethod === 'COD' && <Icon as={Check} className="text-yellow-600 w-6 h-6" />}
            </Pressable>

            {/* Crypto */}
            <Pressable 
              onPress={() => setPaymentMethod('Blockchain')}
              className={`p-5 rounded-[24px] border-2 flex-row items-center ${paymentMethod === 'Blockchain' ? 'border-yellow-500 bg-yellow-50/50 dark:bg-yellow-900/10' : 'border-white dark:border-zinc-900 bg-white dark:bg-zinc-900 shadow-sm'}`}
            >
              <Box className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 items-center justify-center mr-4">
                <Icon as={Bitcoin} className="text-zinc-700 dark:text-zinc-300 w-6 h-6" />
              </Box>
              <VStack className="flex-1">
                <Text className="text-base font-bold text-zinc-900 dark:text-white">Crypto Wallet</Text>
                <Text className="text-xs text-zinc-500">Thanh toán qua Blockchain</Text>
              </VStack>
              {paymentMethod === 'Blockchain' && <Icon as={Check} className="text-yellow-600 w-6 h-6" />}
            </Pressable>
          </VStack>
        </VStack>

        <Box className="h-20" />
      </ScrollView>

      {/* --- FOOTER ACTIONS --- */}
      <Box className="bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 px-5 pt-5 shadow-2xl">
        <VStack className="mb-5 space-y-2.5 gap-2.5">
          <HStack className="justify-between items-center">
            <Text className="text-sm text-zinc-500">Tổng tiền hàng</Text>
            <Text className="text-sm font-bold text-zinc-900 dark:text-white">{formatPrice(itemsSubtotal)}₫</Text>
          </HStack>
          <HStack className="justify-between items-center">
            <Text className="text-sm text-zinc-500">Phí vận chuyển</Text>
            <Text className="text-sm font-bold text-zinc-900 dark:text-white">{shippingFee === 0 ? 'Miễn phí' : `${formatPrice(shippingFee)}₫`}</Text>
          </HStack>
          {couponDiscount > 0 && (
            <HStack className="justify-between items-center">
              <Text className="text-sm text-green-600">Giảm giá mã ưu đãi</Text>
              <Text className="text-sm font-bold text-green-600">-{formatPrice(couponDiscount)}₫</Text>
            </HStack>
          )}
          <Box className="h-px bg-zinc-100 dark:bg-zinc-800 mt-2" />
          <HStack className="justify-between items-center pt-2">
            <VStack>
              <Text className="text-xs text-zinc-400 font-bold uppercase tracking-tighter">Tổng thanh toán</Text>
              <Text className="text-2xl font-black text-yellow-600 dark:text-yellow-500">{formatPrice(grandTotal)}₫</Text>
            </VStack>
            <Button 
              onPress={handleConfirmOrder}
              disabled={loading}
              className="bg-zinc-900 dark:bg-zinc-100 h-16 px-8 rounded-3xl active:opacity-90 shadow-lg"
            >
              {loading ? (
                <ActivityIndicator color="#eab308" />
              ) : (
                <ButtonText className="text-white dark:text-zinc-900 font-black text-base uppercase">
                  Đặt hàng
                </ButtonText>
              )}
            </Button>
          </HStack>
        </VStack>
      </Box>
    </SafeAreaView>
  );
};

export default CheckoutScreen;
