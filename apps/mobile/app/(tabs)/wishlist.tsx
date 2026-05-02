import React, { useState } from 'react';
import { ScrollView, Image, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Button, ButtonText } from '@/components/ui/button';
import { 
  Heart, 
  ShoppingCart, 
  Search,
  Sparkles
} from 'lucide-react-native';

const mockWishlistItems = [
  {
    id: '1',
    name: 'iPhone 15 Pro Max',
    price: 32500000,
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=300&auto=format&fit=crop',
  },
  {
    id: '2',
    name: 'MacBook Pro M3',
    price: 45900000,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=300&auto=format&fit=crop',
  },
  {
    id: '3',
    name: 'Logitech MX Master 3S',
    price: 2500000,
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=300&auto=format&fit=crop',
  },
];

const WishlistScreen = () => {
  const router = useRouter();
  const [items, setItems] = useState(mockWishlistItems);

  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const toggleWishlist = (id: string) => {
    setItems(items.filter(item => item.id !== id));
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

      {items.length > 0 ? (
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-5 pt-6">
          <HStack className="flex-wrap justify-between">
            {items.map((item) => (
              <Box
                key={item.id}
                className="w-[48%] bg-white dark:bg-zinc-900 rounded-3xl p-3 mb-5 border border-zinc-100 dark:border-zinc-800 shadow-sm elevation-1"
              >
                <Box className="w-full h-40 bg-zinc-50 dark:bg-zinc-800 rounded-2xl mb-3 relative overflow-hidden">
                  <Pressable 
                    onPress={() => toggleWishlist(item.id)}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 dark:bg-zinc-900/80 items-center justify-center z-10"
                  >
                    <Icon as={Heart} className="text-red-500 fill-red-500 w-4 h-4" />
                  </Pressable>
                  <Image 
                    source={{ uri: item.image }}
                    className="w-full h-full object-cover"
                  />
                </Box>
                
                <VStack className="space-y-1 gap-1 px-1">
                  <Text className="text-xs text-zinc-800 dark:text-zinc-200 font-medium leading-tight h-8" numberOfLines={2}>
                    {item.name}
                  </Text>
                  <HStack className="justify-between items-center mt-2">
                    <Text className="text-sm font-bold text-zinc-900 dark:text-white">
                      {formatPrice(item.price)}₫
                    </Text>
                    <Pressable className="w-8 h-8 rounded-full bg-yellow-400 items-center justify-center">
                      <Icon as={ShoppingCart} className="text-zinc-900 w-4 h-4" />
                    </Pressable>
                  </HStack>
                </VStack>
              </Box>
            ))}
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
