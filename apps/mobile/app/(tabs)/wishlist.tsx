import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, Image, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Button, ButtonText } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { getWishlist, toggleWishlist } from '@/services/wishlist.service';
import { 
  Heart, 
  ShoppingCart, 
  Search,
  Sparkles,
  ChevronRight
} from 'lucide-react-native';

const WishlistScreen = () => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const data = await getWishlist(user._id);
      if (data && data.items) {
        setItems(data.items);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch when screen is focused
  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) {
        fetchWishlist();
      } else {
        setItems([]);
      }
    }, [isAuthenticated, user?._id])
  );

  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleRemove = async (productId: string) => {
    if (!user?._id) return;
    try {
      // Optimistic update
      setItems(prev => prev.filter(item => item.productId?._id !== productId));
      await toggleWishlist(user._id, productId);
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      fetchWishlist(); // Revert
    }
  };

  const handleAddToCart = (item: any) => {
    const product = item.productId;
    if (!product) return;
    
    // Nếu sản phẩm không có biến thể, thêm thẳng vào giỏ
    addToCart(product, 1);
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <Box className="bg-white dark:bg-zinc-900 px-5 pt-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <HStack className="justify-between items-center">
          <Text className="text-2xl font-bold text-zinc-900 dark:text-white">Yêu thích</Text>
          <Pressable className="w-10 h-10 rounded-full border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 items-center justify-center">
            <Icon as={Search} className="text-zinc-500 w-5 h-5" />
          </Pressable>
        </HStack>
      </Box>

      {!isAuthenticated ? (
        <VStack className="flex-1 justify-center items-center px-10">
          <Box className="w-24 h-24 rounded-full bg-zinc-100 dark:bg-zinc-900 items-center justify-center mb-6">
            <Icon as={Heart} className="text-zinc-300 dark:text-zinc-700 w-12 h-12" />
          </Box>
          <Text className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Chưa đăng nhập</Text>
          <Text className="text-sm text-zinc-500 text-center mb-8">
            Vui lòng đăng nhập để xem danh sách sản phẩm yêu thích của bạn.
          </Text>
          <Button 
            onPress={() => router.push('/profile')}
            className="bg-yellow-400 px-8 h-12 rounded-full"
          >
            <ButtonText className="text-zinc-900 font-bold">Đăng nhập ngay</ButtonText>
          </Button>
        </VStack>
      ) : loading ? (
        <Box className="flex-1 justify-center items-center">
          <ActivityIndicator color="#eab308" size="large" />
        </Box>
      ) : items.length > 0 ? (
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-5 pt-6">
          <HStack className="flex-wrap justify-between">
            {items.map((item) => {
              const product = item.productId;
              if (!product) return null;
              
              const finalPrice = product.basePrice * (1 - (product.discountPercentage || 0) / 100);
              const displayImage = product.images?.[0] || 'https://via.placeholder.com/300';

              return (
                <Pressable
                  key={item._id}
                  onPress={() => router.push({ pathname: '/product/productdetail', params: { id: product._id } })}
                  className="w-[48%] bg-white dark:bg-zinc-900 rounded-3xl p-3 mb-5 border border-zinc-100 dark:border-zinc-800 shadow-sm elevation-1"
                >
                  <Box className="w-full h-40 bg-zinc-50 dark:bg-zinc-800 rounded-2xl mb-3 relative overflow-hidden">
                    <Pressable 
                      onPress={() => handleRemove(product._id)}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 dark:bg-zinc-900/80 items-center justify-center z-10"
                    >
                      <Icon as={Heart} className="text-red-500 fill-red-500 w-4 h-4" />
                    </Pressable>
                    <Image 
                      source={{ uri: displayImage }}
                      className="w-full h-full object-cover"
                    />
                  </Box>
                  
                  <VStack className="space-y-1 gap-1 px-1">
                    <Text className="text-xs text-zinc-800 dark:text-zinc-200 font-medium leading-tight h-8" numberOfLines={2}>
                      {product.name}
                    </Text>
                    <HStack className="justify-between items-center mt-2">
                      <Text className="text-sm font-bold text-zinc-900 dark:text-white">
                        {formatPrice(finalPrice)}₫
                      </Text>
                      <Pressable 
                        onPress={() => handleAddToCart(item)}
                        className="w-8 h-8 rounded-full bg-yellow-400 items-center justify-center"
                      >
                        <Icon as={ShoppingCart} className="text-zinc-900 w-4 h-4" />
                      </Pressable>
                    </HStack>
                  </VStack>
                </Pressable>
              );
            })}
          </HStack>
          
          <Box className="h-20" />
        </ScrollView>
      ) : (
        <VStack className="flex-1 justify-center items-center px-10">
          <Box className="w-24 h-24 rounded-full bg-zinc-100 dark:bg-zinc-900 items-center justify-center mb-6">
            <Icon as={Sparkles} className="text-zinc-300 dark:text-zinc-700 w-12 h-12" />
          </Box>
          <Text className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Danh sách trống</Text>
          <Text className="text-sm text-zinc-500 text-center mb-8">
            Hãy thêm những sản phẩm bạn yêu thích vào đây để theo dõi giá và khuyến mãi nhé!
          </Text>
          <Button 
            onPress={() => router.push('/home')}
            className="bg-yellow-400 px-8 h-12 rounded-full"
          >
            <ButtonText className="text-zinc-900 font-bold">Khám phá ngay</ButtonText>
          </Button>
        </VStack>
      )}
    </SafeAreaView>
  );
};

export default WishlistScreen;
