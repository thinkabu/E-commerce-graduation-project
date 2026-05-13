import React, { useState } from 'react';
import { ScrollView, SafeAreaView, Dimensions, Image, FlatList } from 'react-native';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import Header from '@/components/Header';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { 
  SlidersHorizontal, 
  Star,
  LayoutGrid,
  List
} from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CategoryProductsScreen = () => {
  const router = useRouter();
  const { name = 'Danh mục' } = useLocalSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filterChips = ['Tất cả', 'Giá thấp', 'Giá cao', 'Bán chạy', 'Mới nhất'];
  const [activeFilter, setActiveFilter] = useState('Tất cả');

  const mockProducts = [
    { id: '1', name: "Sony WH-1000XM5", price: 8500000, rating: 4.8, image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=300&auto=format&fit=crop', category: 'Audio' },
    { id: '2', name: "iPhone 15 Pro Max", price: 34990000, rating: 4.9, image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=300&auto=format&fit=crop', category: 'Smartphone' },
    { id: '3', name: "MacBook Pro M3", price: 45900000, rating: 4.7, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=300&auto=format&fit=crop', category: 'Laptop' },
    { id: '4', name: "Apple Watch Ultra 2", price: 21900000, rating: 4.8, image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?q=80&w=300&auto=format&fit=crop', category: 'Watch' },
    { id: '5', name: "iPad Air M2", price: 15900000, rating: 4.6, image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=300&auto=format&fit=crop', category: 'Tablet' },
    { id: '6', name: "Keychron K2 V2", price: 2500000, rating: 4.9, image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?q=80&w=300&auto=format&fit=crop', category: 'Accessories' },
  ];

  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-zinc-50 dark:bg-zinc-950">
      <Stack.Screen options={{ headerShown: false }} />
      <Header title={name as string} />

      <VStack className="flex-1">
        {/* Filter Chips Bar */}
        <Box className="bg-white dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-900">
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            className="px-5 py-4"
            contentContainerStyle={{ gap: 12 }}
          >
            {filterChips.map((chip) => (
              <Pressable 
                key={chip}
                onPress={() => setActiveFilter(chip)}
                className={`px-5 py-2.5 rounded-2xl border ${
                  activeFilter === chip 
                    ? 'bg-zinc-900 dark:bg-yellow-500 border-zinc-900 dark:border-yellow-500' 
                    : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800'
                }`}
              >
                <Text className={`text-xs font-bold ${
                  activeFilter === chip ? 'text-white dark:text-zinc-900' : 'text-zinc-500'
                }`}>
                  {chip}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </Box>

        {/* List Controls */}
        <HStack className="px-5 py-4 justify-between items-center">
          <Text className="text-sm font-bold text-zinc-500">{mockProducts.length} sản phẩm</Text>
          <HStack className="space-x-2 gap-2">
            <Pressable 
              onPress={() => setViewMode('grid')}
              className={`p-2 rounded-xl ${viewMode === 'grid' ? 'bg-zinc-200 dark:bg-zinc-800' : ''}`}
            >
              <Icon as={LayoutGrid} className={viewMode === 'grid' ? 'text-zinc-900 dark:text-white' : 'text-zinc-400'} size="sm" />
            </Pressable>
            <Pressable 
              onPress={() => setViewMode('list')}
              className={`p-2 rounded-xl ${viewMode === 'list' ? 'bg-zinc-200 dark:bg-zinc-800' : ''}`}
            >
              <Icon as={List} className={viewMode === 'list' ? 'text-zinc-900 dark:text-white' : 'text-zinc-400'} size="sm" />
            </Pressable>
            <Box className="w-px h-4 bg-zinc-200 dark:bg-zinc-800 mx-1" />
            <Pressable className="flex-row items-center space-x-2 gap-2 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <Icon as={SlidersHorizontal} className="text-zinc-900 dark:text-white" size="xs" />
              <Text className="text-xs font-black uppercase tracking-tighter text-zinc-900 dark:text-white">Lọc</Text>
            </Pressable>
          </HStack>
        </HStack>

        {/* Product List */}
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-5">
          {viewMode === 'grid' ? (
            <HStack className="flex-wrap justify-between pb-10">
              {mockProducts.map((product) => (
                <Pressable 
                  key={product.id}
                  onPress={() => router.push(`/product/productdetail?id=${product.id}` as any)}
                  className="w-[48%] bg-white dark:bg-zinc-900 p-3 rounded-[32px] border border-zinc-100 dark:border-zinc-800 mb-4 shadow-sm"
                >
                  <Box className="w-full h-36 rounded-2xl bg-zinc-50 dark:bg-zinc-800 mb-3 items-center justify-center overflow-hidden">
                    <Image source={{ uri: product.image }} className="w-full h-full object-cover" />
                  </Box>
                  <VStack className="px-1">
                    <Text className="text-xs font-bold text-zinc-900 dark:text-white mb-1" numberOfLines={1}>{product.name}</Text>
                    <HStack className="items-center space-x-1 gap-1 mb-2">
                      <Icon as={Star} className="text-yellow-500 fill-yellow-500 w-3 h-3" />
                      <Text className="text-[10px] font-bold text-zinc-500">{product.rating}</Text>
                    </HStack>
                    <Text className="text-sm font-black text-yellow-600 dark:text-yellow-500">{formatPrice(product.price)}₫</Text>
                  </VStack>
                </Pressable>
              ))}
            </HStack>
          ) : (
            <VStack className="space-y-4 gap-4 pb-10">
              {mockProducts.map((product) => (
                <Pressable 
                  key={product.id}
                  onPress={() => router.push(`/product/productdetail?id=${product.id}` as any)}
                  className="bg-white dark:bg-zinc-900 p-4 rounded-[32px] border border-zinc-100 dark:border-zinc-800 shadow-sm"
                >
                  <HStack className="space-x-4 gap-4">
                    <Image source={{ uri: product.image }} className="w-24 h-24 rounded-2xl bg-zinc-50 dark:bg-zinc-800" />
                    <VStack className="flex-1 justify-center space-y-1 gap-1">
                      <Text className="text-sm font-bold text-zinc-900 dark:text-white" numberOfLines={2}>{product.name}</Text>
                      <HStack className="items-center space-x-1 gap-1 mb-1">
                        <Icon as={Star} className="text-yellow-500 fill-yellow-500 w-3 h-3" />
                        <Text className="text-[10px] font-bold text-zinc-500">{product.rating}</Text>
                      </HStack>
                      <Text className="text-base font-black text-yellow-600 dark:text-yellow-500">{formatPrice(product.price)}₫</Text>
                    </VStack>
                  </HStack>
                </Pressable>
              ))}
            </VStack>
          )}
        </ScrollView>
      </VStack>
    </SafeAreaView>
  );
};

export default CategoryProductsScreen;
