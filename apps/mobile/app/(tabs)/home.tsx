import React, { useState, useEffect } from 'react';
import { ScrollView, Image, SafeAreaView, ActivityIndicator } from 'react-native';
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
  ChevronRight,
  PackageSearch
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { getCategories, Category } from '@/services/category.service';
import { getProducts, Product } from '@/services/product.service';

// Banners giả lập (Vẫn giữ nguyên vì chưa có bảng Banners trong DB)

const banners = [
  { id: '1', image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=600&auto=format&fit=crop', title: 'Sale 50%', subtitle: 'Tech Week' },
  { id: '2', image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?q=80&w=600&auto=format&fit=crop', title: 'New Arrival', subtitle: 'Laptops' },
  { id: '3', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop', title: 'Free Ship', subtitle: 'Orders > $100' },
];

// Helper format price
const formatPrice = (price: number) => {
  return price.toLocaleString('vi-VN') + ' đ';
};

const HomeScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch categories (limit to 5 to show on top row)
        const cats = await getCategories();
        setCategories(cats.filter(c => c.isActive).slice(0, 5));

        // Fetch products
        const prodData = await getProducts({ limit: 10 });
        const prods = prodData.items;

        // Split products into popular (first 4) and suggested (rest)
        setPopularProducts(prods.slice(0, 4));
        setSuggestedProducts(prods.slice(4, 10));
      } catch (error) {
        console.error("Error fetching home data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
                source={{ uri: user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop' }} 
                className="w-11 h-11 rounded-full border-2 border-white dark:border-zinc-800"
              />
              <VStack>
                <Text className="text-lg font-bold text-zinc-900 dark:text-white leading-tight">
                  {user?.fullName || 'Người dùng'}
                </Text>
                <Text className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                  {user?.role === 'admin' ? 'Administrator' : 'Premium Member'}
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

        {/* Search Bar (Navigable) */}
        <Box className="px-5 flex-row items-center space-x-3 gap-3">
          <Pressable 
            onPress={() => router.push('/search/searchByKeyword')}
            className="flex-1 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 h-12 px-4 flex-row items-center rounded-2xl"
          >
            <Icon as={Search} className="text-zinc-400 w-5 h-5 mr-2" />
            <Text className="text-sm text-zinc-400 flex-1">Tìm kiếm sản phẩm...</Text>
          </Pressable>
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
          {loading ? (
            <Box className="h-20 justify-center items-center">
              <ActivityIndicator color="#eab308" />
            </Box>
          ) : (
            <HStack className="justify-between">
              {categories.map((item) => (
                <VStack key={item._id} className="items-center space-y-2 gap-2">
                  <Pressable className="w-14 h-14 rounded-full bg-white dark:bg-zinc-900 items-center justify-center shadow-sm elevation-1 active:bg-zinc-50 dark:active:bg-zinc-800 overflow-hidden">
                    {item.image ? (
                      <Image source={{ uri: item.image }} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <Icon as={PackageSearch} className="text-zinc-400 w-6 h-6" />
                    )}
                  </Pressable>
                  <Text className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300 w-16 text-center" numberOfLines={1}>
                    {item.name}
                  </Text>
                </VStack>
              ))}
              {/* "Tất cả" Button */}
              <VStack className="items-center space-y-2 gap-2">
                <Pressable className="w-14 h-14 rounded-full bg-white dark:bg-zinc-900 items-center justify-center shadow-sm elevation-1 active:bg-zinc-50 dark:active:bg-zinc-800">
                  <Icon as={ChevronRight} className="text-yellow-500 w-6 h-6" />
                </Pressable>
                <Text className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
                  Tất cả
                </Text>
              </VStack>
            </HStack>
          )}
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
              {loading ? (
                <Box className="w-40 h-40 justify-center items-center">
                  <ActivityIndicator color="#eab308" />
                </Box>
              ) : popularProducts.map((product) => {
                const finalPrice = product.basePrice * (1 - (product.discountPercentage || 0) / 100);
                const displayImage = product.images?.[0] || 'https://via.placeholder.com/300';
                
                return (
                  <Pressable
                    key={product._id}
                    onPress={() => router.push({ pathname: '/product/productdetail', params: { id: product._id } })}
                    className="bg-white dark:bg-zinc-900 rounded-3xl p-3 w-40 border border-zinc-100 dark:border-zinc-800 shadow-sm elevation-1 active:opacity-90"
                  >
                    <Box className="w-full h-32 bg-zinc-50 dark:bg-zinc-800 rounded-2xl mb-3 items-center justify-center relative overflow-hidden">
                      <Box className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 dark:bg-zinc-900/80 items-center justify-center z-10">
                        <Icon as={Heart} className="text-zinc-400 w-4 h-4" />
                      </Box>
                      {product.discountPercentage > 0 && (
                        <Box className="absolute top-2 left-2 bg-yellow-500 rounded-md px-1.5 py-0.5 z-10">
                          <Text className="text-[10px] font-bold text-white">-{product.discountPercentage}%</Text>
                        </Box>
                      )}
                      <Image 
                        source={{ uri: displayImage }}
                        className="w-full h-full object-cover"
                      />
                    </Box>
                    <VStack className="space-y-1 gap-1 px-1">
                      <Text className="text-sm font-bold text-yellow-600 dark:text-yellow-500">
                        {formatPrice(finalPrice)}
                      </Text>
                      <Text className="text-xs text-zinc-700 dark:text-zinc-300 font-medium leading-tight" numberOfLines={2}>
                        {product.name}
                      </Text>
                    </VStack>
                  </Pressable>
                );
              })}
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
          {loading ? (
            <Box className="h-40 justify-center items-center">
              <ActivityIndicator color="#eab308" />
            </Box>
          ) : (
            <HStack className="flex-wrap justify-between">
              {suggestedProducts.map((product) => {
                const finalPrice = product.basePrice * (1 - (product.discountPercentage || 0) / 100);
                const displayImage = product.images?.[0] || 'https://via.placeholder.com/300';
                
                return (
                  <Pressable
                    key={product._id}
                    onPress={() => router.push({ pathname: '/product/productdetail', params: { id: product._id } })}
                    className="w-[48%] bg-white dark:bg-zinc-900 rounded-3xl p-3 mb-4 border border-zinc-100 dark:border-zinc-800 shadow-sm elevation-1 active:opacity-90"
                  >
                    <Box className="w-full h-40 bg-zinc-50 dark:bg-zinc-800 rounded-2xl mb-3 relative overflow-hidden">
                      <Box className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 dark:bg-zinc-900/80 items-center justify-center z-10">
                        <Icon as={Heart} className="text-zinc-400 w-4 h-4" />
                      </Box>
                      {product.discountPercentage > 0 && (
                        <Box className="absolute top-2 left-2 bg-yellow-500 rounded-md px-1.5 py-0.5 z-10">
                          <Text className="text-[10px] font-bold text-white">-{product.discountPercentage}%</Text>
                        </Box>
                      )}
                      <Image 
                        source={{ uri: displayImage }}
                        className="w-full h-full object-cover"
                      />
                    </Box>
                    <VStack className="space-y-1 gap-1 px-1">
                      <Text className="text-sm text-zinc-800 dark:text-zinc-200 font-medium leading-tight" numberOfLines={2}>
                        {product.name}
                      </Text>
                      <Text className="text-base font-bold text-zinc-900 dark:text-white mt-1">
                        {formatPrice(finalPrice)}
                      </Text>
                    </VStack>
                  </Pressable>
                );
              })}
            </HStack>
          )}
        </Box>

        {/* Bottom padding for tabs */}
        <Box className="h-10" />

      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
