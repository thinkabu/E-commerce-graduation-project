import React from 'react';
import { ScrollView, Image, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Input, InputField } from '@/components/ui/input';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { 
  Search, 
  Bell, 
  Trash2, 
  SlidersHorizontal,
  Smartphone,
  Laptop,
  Watch,
  Headphones,
  Monitor,
  Heart,
  Sparkles,
  ChevronRight
} from 'lucide-react-native';

const categories = [
  { id: '1', label: 'Điện thoại', icon: Smartphone },
  { id: '2', label: 'Laptop', icon: Laptop },
  { id: '3', label: 'Đồng hồ', icon: Watch },
  { id: '4', label: 'Tai nghe', icon: Headphones },
  { id: '5', label: 'Màn hình', icon: Monitor },
];

const banners = [
  { id: '1', image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=600&auto=format&fit=crop', title: 'Sale 50%', subtitle: 'Tech Week' },
  { id: '2', image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?q=80&w=600&auto=format&fit=crop', title: 'New Arrival', subtitle: 'Laptops' },
  { id: '3', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop', title: 'Free Ship', subtitle: 'Orders > $100' },
];

const popularOffers = [
  { id: '1', title: 'Monitor LED 4K 28"', cashback: '2%', image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=300&auto=format&fit=crop' },
  { id: '2', title: 'New balance 480 low', cashback: '8%', image: 'https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=300&auto=format&fit=crop' },
  { id: '3', title: 'Apple Watch Series 9', cashback: '5%', image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?q=80&w=300&auto=format&fit=crop' },
  { id: '4', title: 'Sony WH-1000XM5', cashback: '10%', image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=300&auto=format&fit=crop' },
];

const suggestedProducts = [
  { id: '1', title: 'iPhone 15 Pro Max', price: '$1199', image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=300&auto=format&fit=crop' },
  { id: '2', title: 'MacBook Pro M3', price: '$1599', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=300&auto=format&fit=crop' },
  { id: '3', title: 'Logitech MX Master 3S', price: '$99', image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=300&auto=format&fit=crop' },
  { id: '4', title: 'Keychron K2', price: '$89', image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=300&auto=format&fit=crop' },
];

const HomeScreen = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-zinc-50 dark:bg-zinc-950">
      {/* =========================================
          STICKY HEADER & SEARCH BAR
          (Nằm ngoài ScrollView để luôn cố định)
      ========================================= */}
      <Box className="bg-zinc-50 dark:bg-zinc-950 z-50 pt-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        
        {/* Header (Avatar & Icons) */}
        <Box className="px-5 mb-3">
          <HStack className="justify-between items-center">
            <HStack className="items-center space-x-3 gap-3">
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop' }} 
                className="w-11 h-11 rounded-full border-2 border-white dark:border-zinc-800"
              />
              <VStack>
                <Text className="text-lg font-bold text-zinc-900 dark:text-white leading-tight">
                  Wilson Junior
                </Text>
                <Text className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                  Premium
                </Text>
              </VStack>
            </HStack>
            
            <HStack className="space-x-3 gap-3">
              <Pressable className="w-10 h-10 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 items-center justify-center">
                <Icon as={Trash2} className="text-zinc-700 dark:text-zinc-300 w-5 h-5" />
              </Pressable>
              <Pressable className="w-10 h-10 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 items-center justify-center">
                <Icon as={Bell} className="text-zinc-700 dark:text-zinc-300 w-5 h-5" />
              </Pressable>
            </HStack>
          </HStack>
        </Box>

        {/* Search Bar */}
        <Box className="px-5 flex-row items-center space-x-3 gap-3">
          <Input variant="rounded" className="flex-1 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 h-12 px-2 flex-row items-center">
            <Icon as={Search} className="text-zinc-400 w-5 h-5 ml-2 mr-2" />
            <InputField placeholder="Tìm kiếm sản phẩm..." className="text-sm text-zinc-800 dark:text-white flex-1" />
          </Input>
          <Pressable className="w-12 h-12 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 items-center justify-center">
            <Icon as={SlidersHorizontal} className="text-zinc-700 dark:text-zinc-300 w-5 h-5" />
          </Pressable>
        </Box>
      </Box>

      {/* =========================================
          SCROLLABLE CONTENT
      ========================================= */}
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        
        {/* 1. Category Menu */}
        <Box className="px-5 py-6">
          <HStack className="justify-between">
            {categories.map((item) => (
              <VStack key={item.id} className="items-center space-y-2 gap-2">
                <Pressable className="w-14 h-14 rounded-full bg-white dark:bg-zinc-900 items-center justify-center shadow-sm elevation-1 active:bg-zinc-50 dark:active:bg-zinc-800">
                  <Icon as={item.icon} className="text-yellow-500 w-6 h-6" />
                </Pressable>
                <Text className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
                  {item.label}
                </Text>
              </VStack>
            ))}
          </HStack>
        </Box>

        {/* 2. Banners Slider */}
        <Box className="mb-8">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-5" snapToInterval={316} decelerationRate="fast">
            <HStack className="space-x-4 gap-4 pr-10">
              {banners.map((banner) => (
                <Box key={banner.id} className="w-[300px] h-40 rounded-3xl overflow-hidden relative shadow-md elevation-2 bg-zinc-900">
                  <Image source={{ uri: banner.image }} className="absolute w-full h-full object-cover opacity-60" />
                  <Box className="absolute inset-0 bg-black/20" />
                  <VStack className="absolute bottom-4 left-5">
                    <Text className="text-xs font-bold text-yellow-400 uppercase tracking-wider">{banner.subtitle}</Text>
                    <Text className="text-2xl font-extrabold text-white">{banner.title}</Text>
                  </VStack>
                </Box>
              ))}
            </HStack>
          </ScrollView>
        </Box>

        {/* 3. Most Popular Offer Section */}
        <Box className="px-5 mb-8">
          <HStack className="justify-between items-end mb-4">
            <Text className="text-xl font-bold text-zinc-900 dark:text-white">
              Sản phẩm bán chạy
            </Text>
            <Pressable>
              <HStack className="items-center space-x-1">
                <Text className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Xem tất cả</Text>
                <Icon as={ChevronRight} className="text-zinc-500 w-4 h-4" />
              </HStack>
            </Pressable>
          </HStack>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="overflow-visible pb-2">
            <HStack className="space-x-4 gap-4">
              {popularOffers.map((offer) => (
                <Pressable
                  key={offer.id}
                  onPress={() => router.push({ pathname: '/product/productdetail', params: { id: offer.id } })}
                  className="bg-white dark:bg-zinc-900 rounded-3xl p-3 w-40 border border-zinc-100 dark:border-zinc-800 shadow-sm elevation-1 active:opacity-90"
                >
                  <Box className="w-full h-32 bg-zinc-50 dark:bg-zinc-800 rounded-2xl mb-3 items-center justify-center relative">
                    <Box className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 dark:bg-zinc-900/80 items-center justify-center z-10">
                      <Icon as={Heart} className="text-zinc-400 w-4 h-4" />
                    </Box>
                    <Image 
                      source={{ uri: offer.image }}
                      className="w-full h-full rounded-2xl object-cover"
                    />
                  </Box>
                  <VStack className="space-y-1 gap-1 px-1">
                    <Text className="text-sm font-bold text-yellow-600 dark:text-yellow-500">
                      Hoàn {offer.cashback}
                    </Text>
                    <Text className="text-xs text-zinc-700 dark:text-zinc-300 font-medium leading-tight" numberOfLines={2}>
                      {offer.title}
                    </Text>
                  </VStack>
                </Pressable>
              ))}
            </HStack>
          </ScrollView>
        </Box>

        {/* 4. AI Suggested Products Grid */}
        <Box className="px-5 mb-10">
          <HStack className="items-center space-x-2 gap-2 mb-4">
            <Icon as={Sparkles} className="text-yellow-500 w-5 h-5" />
            <Text className="text-xl font-bold text-zinc-900 dark:text-white">
              Gợi ý cho bạn
            </Text>
          </HStack>

          {/* Grid Layout simulated using Flex Wrap */}
          <HStack className="flex-wrap justify-between">
            {suggestedProducts.map((product) => (
              <Pressable
                key={product.id}
                onPress={() => router.push({ pathname: '/product/productdetail', params: { id: product.id } })}
                className="w-[48%] bg-white dark:bg-zinc-900 rounded-3xl p-3 mb-4 border border-zinc-100 dark:border-zinc-800 shadow-sm elevation-1 active:opacity-90"
              >
                <Box className="w-full h-40 bg-zinc-50 dark:bg-zinc-800 rounded-2xl mb-3 relative">
                  <Box className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 dark:bg-zinc-900/80 items-center justify-center z-10">
                    <Icon as={Heart} className="text-zinc-400 w-4 h-4" />
                  </Box>
                  <Image 
                    source={{ uri: product.image }}
                    className="w-full h-full rounded-2xl object-cover"
                  />
                </Box>
                <VStack className="space-y-1 gap-1 px-1">
                  <Text className="text-sm text-zinc-800 dark:text-zinc-200 font-medium leading-tight" numberOfLines={2}>
                    {product.title}
                  </Text>
                  <Text className="text-base font-bold text-zinc-900 dark:text-white mt-1">
                    {product.price}
                  </Text>
                </VStack>
              </Pressable>
            ))}
          </HStack>
        </Box>

        {/* Bottom padding for tabs */}
        <Box className="h-10" />

      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
