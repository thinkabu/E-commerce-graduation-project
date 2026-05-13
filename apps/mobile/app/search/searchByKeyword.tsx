import React, { useState } from 'react';
import { ScrollView, SafeAreaView, Dimensions, Image } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Input, InputField, InputSlot, InputIcon } from '@/components/ui/input';
import { 
  Search, 
  SlidersHorizontal, 
  X, 
  Clock, 
  TrendingUp, 
  Star,
  ChevronRight,
  Smartphone,
  Laptop,
  Headphones,
  Gamepad2,
  Trash2
} from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SearchScreen = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const recentSearches = ['iPhone 15 Pro', 'Sony Headphones', 'MacBook M3'];
  
  const suggestedCategories = [
    { id: '1', name: 'Điện thoại', icon: Smartphone, color: 'bg-blue-50 dark:bg-blue-900/20', iconColor: 'text-blue-500' },
    { id: '2', name: 'Máy tính', icon: Laptop, color: 'bg-purple-50 dark:bg-purple-900/20', iconColor: 'text-purple-500' },
    { id: '3', name: 'Âm thanh', icon: Headphones, color: 'bg-orange-50 dark:bg-orange-900/20', iconColor: 'text-orange-500' },
    { id: '4', name: 'Gaming', icon: Gamepad2, color: 'bg-red-50 dark:bg-red-900/20', iconColor: 'text-red-500' },
  ];

  const suggestedProducts = [
    { id: 'p1', name: 'Apple Watch Series 9', price: 9500000, image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?q=80&w=300&auto=format&fit=crop' },
    { id: 'p2', name: 'iPad Pro M2', price: 21900000, image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=300&auto=format&fit=crop' },
  ];

  const mockResults = [
    { id: '1', name: "Sony WH-1000XM5", price: 8500000, rating: 4.8, image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=300&auto=format&fit=crop' },
    { id: '2', name: "iPhone 15 Pro Max", price: 34990000, rating: 4.9, image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=300&auto=format&fit=crop' },
    { id: '3', name: "MacBook Pro M3", price: 45900000, rating: 4.7, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=300&auto=format&fit=crop' },
    { id: '4', name: "Apple Watch Ultra 2", price: 21900000, rating: 4.8, image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?q=80&w=300&auto=format&fit=crop' },
  ];

  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    setIsSearching(text.length > 0);
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-zinc-50 dark:bg-zinc-950">
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Search Header */}
      <Box className="bg-white dark:bg-zinc-950 px-5 pt-2 pb-4 border-b border-zinc-100 dark:border-zinc-900 shadow-sm">
        <HStack className="items-center space-x-3 gap-3">
          <Input className="flex-1 h-12 rounded-2xl border-none bg-zinc-100 dark:bg-zinc-900 px-2">
            <InputSlot className="pl-3">
              <InputIcon as={Search} className="text-zinc-400" />
            </InputSlot>
            <InputField 
              placeholder="Bạn đang tìm sản phẩm gì?"
              value={searchQuery}
              onChangeText={handleSearch}
              autoFocus
              className="text-zinc-900 dark:text-white font-bold"
            />
            {searchQuery.length > 0 && (
              <InputSlot className="pr-3" onPress={() => handleSearch('')}>
                <Box className="bg-zinc-200 dark:bg-zinc-800 rounded-full p-1">
                  <Icon as={X} className="text-zinc-500 w-3 h-3" />
                </Box>
              </InputSlot>
            )}
          </Input>
          <Pressable onPress={() => router.back()}>
            <Text className="text-sm font-black text-yellow-600 dark:text-yellow-500 uppercase tracking-tighter">Hủy</Text>
          </Pressable>
        </HStack>
      </Box>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {!isSearching ? (
          <VStack className="p-5 space-y-8 gap-8">
            
            {/* 1. Recent Searches */}
            <VStack className="space-y-4 gap-4">
              <HStack className="justify-between items-center">
                <HStack className="items-center space-x-2 gap-2">
                  <Icon as={Clock} className="text-zinc-400 w-4 h-4" />
                  <Text className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-widest">Tìm kiếm gần đây</Text>
                </HStack>
                <Pressable><Icon as={Trash2} size="sm" className="text-zinc-300" /></Pressable>
              </HStack>
              <HStack className="flex-wrap gap-2">
                {recentSearches.map((item, index) => (
                  <Pressable 
                    key={index} 
                    onPress={() => handleSearch(item)}
                    className="px-4 py-2 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm"
                  >
                    <Text className="text-xs font-bold text-zinc-600 dark:text-zinc-400">{item}</Text>
                  </Pressable>
                ))}
              </HStack>
            </VStack>

            {/* 2. Suggested Categories */}
            <VStack className="space-y-4 gap-4">
              <HStack className="items-center space-x-2 gap-2">
                <Icon as={TrendingUp} className="text-yellow-500 w-4 h-4" />
                <Text className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-widest">Gợi ý danh mục</Text>
              </HStack>
              <HStack className="justify-between">
                {suggestedCategories.map((item) => (
                  <Pressable 
                    key={item.id} 
                    onPress={() => router.push(`/category/productFollCate?name=${item.name}` as any)}
                    className="items-center space-y-2 gap-2"
                  >
                    <Box className={`w-16 h-16 rounded-3xl items-center justify-center shadow-sm ${item.color}`}>
                      <Icon as={item.icon} className={item.iconColor} size="md" />
                    </Box>
                    <Text className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">{item.name}</Text>
                  </Pressable>
                ))}
              </HStack>
            </VStack>

            {/* 3. Popular Recommendations */}
            <VStack className="space-y-4 gap-4">
              <Text className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-widest">Gợi ý cho bạn</Text>
              {suggestedProducts.map((item) => (
                <Pressable 
                  key={item.id}
                  onPress={() => router.push(`/product/productdetail?id=${item.id}` as any)}
                  className="bg-white dark:bg-zinc-900 p-4 rounded-[32px] border border-zinc-100 dark:border-zinc-800 shadow-sm"
                >
                  <HStack className="space-x-4 gap-4">
                    <Image source={{ uri: item.image }} className="w-16 h-16 rounded-2xl bg-zinc-50 dark:bg-zinc-800" />
                    <VStack className="flex-1 justify-center">
                      <Text className="text-sm font-bold text-zinc-900 dark:text-white" numberOfLines={1}>{item.name}</Text>
                      <Text className="text-sm font-black text-yellow-600 mt-1">{formatPrice(item.price)}₫</Text>
                    </VStack>
                    <Icon as={ChevronRight} className="text-zinc-200 self-center" />
                  </HStack>
                </Pressable>
              ))}
            </VStack>
          </VStack>
        ) : (
          <VStack className="p-5 space-y-6 gap-6">
            {/* Filter & Results Summary */}
            <HStack className="justify-between items-center">
              <Text className="text-xs font-bold text-zinc-400">Kết quả tìm kiếm cho "{searchQuery}"</Text>
              <Pressable className="flex-row items-center space-x-2 gap-2 bg-zinc-900 dark:bg-yellow-500 px-4 py-2 rounded-xl">
                <Icon as={SlidersHorizontal} className="text-white dark:text-zinc-900 w-4 h-4" />
                <Text className="text-[10px] font-black text-white dark:text-zinc-900 uppercase">Lọc</Text>
              </Pressable>
            </HStack>

            {/* Grid Results */}
            <HStack className="flex-wrap justify-between pb-10">
              {mockResults.map((product) => (
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
          </VStack>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default SearchScreen;
