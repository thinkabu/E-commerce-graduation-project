import React from 'react';
import { ScrollView, Image, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Button, ButtonText } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { 
  Trash2, 
  Minus, 
  Plus, 
  ShoppingCart, 
  ChevronRight,
  Ticket
} from 'lucide-react-native';

const CartScreen = () => {
  const router = useRouter();
  const { cartItems, updateQuantity, removeFromCart, subtotal, total, shipping } = useCart();

  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <Box className="bg-white dark:bg-zinc-900 px-5 pt-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <HStack className="justify-between items-center">
          <Text className="text-2xl font-bold text-zinc-900 dark:text-white">Giỏ hàng</Text>
          <Box className="bg-yellow-400 px-3 py-1 rounded-full">
            <Text className="text-xs font-bold text-zinc-900">{cartItems.length} món</Text>
          </Box>
        </HStack>
      </Box>

      {cartItems.length > 0 ? (
        <>
          <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-5 pt-4">
            {cartItems.map((item) => (
              <Box 
                key={`${item.id}-${JSON.stringify(item.variants)}`} 
                className="bg-white dark:bg-zinc-900 rounded-3xl p-4 mb-4 border border-zinc-100 dark:border-zinc-800 shadow-sm"
              >
                <HStack className="space-x-4 gap-4">
                  <Image source={{ uri: item.image }} className="w-20 h-20 rounded-2xl bg-zinc-50 dark:bg-zinc-800" />
                  
                  <VStack className="flex-1 justify-between py-0.5">
                    <HStack className="justify-between items-start">
                      <VStack className="flex-1 mr-2">
                        <Text className="text-sm font-bold text-zinc-900 dark:text-white" numberOfLines={1}>
                          {item.name}
                        </Text>
                        {/* Variant Info */}
                        {item.variants && Object.entries(item.variants).length > 0 && (
                          <HStack className="flex-wrap mt-1">
                            {Object.entries(item.variants).map(([key, value], idx) => (
                              <Text key={key} className="text-[10px] text-zinc-500 mr-2">
                                {key}: <Text className="font-bold text-zinc-700 dark:text-zinc-300">{value}</Text>
                                {idx < Object.entries(item.variants!).length - 1 ? ' |' : ''}
                              </Text>
                            ))}
                          </HStack>
                        )}
                      </VStack>
                      <Pressable onPress={() => removeFromCart(item.id)}>
                        <Icon as={Trash2} className="text-red-500 w-4 h-4" />
                      </Pressable>
                    </HStack>
                    
                    <HStack className="justify-between items-end mt-2">
                      <Text className="text-base font-bold text-zinc-900 dark:text-white">
                        {formatPrice(item.price)}₫
                      </Text>
                      
                      <HStack className="items-center bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1 gap-2">
                        <Pressable 
                          onPress={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 rounded-lg bg-white dark:bg-zinc-700 items-center justify-center"
                        >
                          <Icon as={Minus} className="text-zinc-900 dark:text-white w-3 h-3" />
                        </Pressable>
                        <Text className="text-sm font-bold text-zinc-900 dark:text-white px-1">
                          {item.quantity}
                        </Text>
                        <Pressable 
                          onPress={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 rounded-lg bg-yellow-400 items-center justify-center"
                        >
                          <Icon as={Plus} className="text-zinc-900 w-3 h-3" />
                        </Pressable>
                      </HStack>
                    </HStack>
                  </VStack>
                </HStack>
              </Box>
            ))}
            <Box className="h-10" />
          </ScrollView>

          {/* --- STICKY FOOTER --- */}
          <Box className="bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 px-5 pt-4 pb-8 shadow-lg">
            <Pressable className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-4 mb-4 border border-zinc-100 dark:border-zinc-800 flex-row items-center justify-between">
              <HStack className="items-center space-x-3 gap-3">
                <Icon as={Ticket} className="text-yellow-500 w-5 h-5" />
                <Text className="text-sm font-medium text-zinc-900 dark:text-white">Nhập mã giảm giá</Text>
              </HStack>
              <Icon as={ChevronRight} className="text-zinc-400 w-5 h-5" />
            </Pressable>

            <VStack className="space-y-2 gap-2 mb-4">
              <HStack className="justify-between">
                <Text className="text-xs text-zinc-500">Tạm tính ({cartItems.length} món)</Text>
                <Text className="text-xs text-zinc-900 dark:text-white font-medium">{formatPrice(subtotal)}₫</Text>
              </HStack>
              <HStack className="justify-between">
                <Text className="text-xs text-zinc-500">Phí vận chuyển</Text>
                <Text className="text-xs text-zinc-900 dark:text-white font-medium">{formatPrice(shipping)}₫</Text>
              </HStack>
              <HStack className="justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800 mt-1">
                <Text className="text-base font-bold text-zinc-900 dark:text-white">Tổng cộng</Text>
                <Text className="text-lg font-bold text-yellow-600 dark:text-yellow-500">{formatPrice(total)}₫</Text>
              </HStack>
            </VStack>

            {/* Checkout Button */}
            <Button 
              onPress={() => router.push({ pathname: '/checkout/checkout' as any, params: { mode: 'cart' } })}
              className="bg-yellow-400 h-14 rounded-2xl active:opacity-90"
            >
              <ButtonText className="text-zinc-900 font-extrabold text-base">THANH TOÁN</ButtonText>
            </Button>
          </Box>
        </>
      ) : (
        <VStack className="flex-1 justify-center items-center px-10">
          <Box className="w-24 h-24 rounded-full bg-zinc-100 dark:bg-zinc-900 items-center justify-center mb-6">
            <Icon as={ShoppingCart} className="text-zinc-300 dark:text-zinc-700 w-12 h-12" />
          </Box>
          <Text className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Giỏ hàng trống</Text>
          <Text className="text-sm text-zinc-500 text-center mb-8">
            Có vẻ như bạn chưa thêm sản phẩm nào vào giỏ hàng.
          </Text>
          <Button 
            onPress={() => router.push('/home')}
            className="bg-zinc-900 dark:bg-zinc-100 px-8 h-12 rounded-full"
          >
            <ButtonText className="text-white dark:text-zinc-900 font-bold">Tiếp tục mua sắm</ButtonText>
          </Button>
        </VStack>
      )}
    </SafeAreaView>
  );
};

export default CartScreen;
