import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, Image, View, Alert, Modal, Dimensions, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  ChevronLeft, 
  Share2, 
  Heart, 
  Star, 
  ShoppingCart, 
  ChevronRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  MessageCircle,
  Minus,
  Plus,
  X
} from 'lucide-react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const mockProduct = {
  id: '1',
  name: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
  category: "Audio",
  manufacturer: "Sony",
  price: 8500000,
  originalPrice: 10500000,
  discount: 19,
  rating: 4.8,
  reviewsCount: 124,
  description: "The WH-1000XM5 headphones rewrite the rules for distraction-free listening. Two processors control eight microphones for unprecedented noise cancellation and exceptional call quality.",
  images: [
    "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1583394838336-acd977730f8a?q=80&w=600&auto=format&fit=crop"
  ],
  specs: [
    { key: "Driver Unit", value: "30mm" },
    { key: "Frequency Response", value: "4Hz - 40,000Hz" },
    { key: "Battery Life", value: "Up to 30 hours" },
    { key: "Bluetooth", value: "Version 5.2" }
  ],
  variants: {
    colors: [
      { id: 'c1', name: 'Midnight Blue', hex: '#191970' },
      { id: 'c2', name: 'Silver', hex: '#C0C0C0' },
      { id: 'c3', name: 'Black', hex: '#000000' }
    ],
    capacities: ['256GB', '512GB']
  },
  reviews: [
    {
      id: 'r1',
      user: 'Nguyễn Văn A',
      avatar: 'https://i.pravatar.cc/150?u=a',
      rating: 5,
      date: '2024-03-15',
      comment: 'Âm thanh tuyệt vời, chống ồn cực tốt. Rất đáng đồng tiền bát gạo!'
    },
    {
      id: 'r2',
      user: 'Trần Thị B',
      avatar: 'https://i.pravatar.cc/150?u=b',
      rating: 4,
      date: '2024-03-10',
      comment: 'Tai nghe đeo rất êm, tuy nhiên thiết kế hơi to so với mình.'
    }
  ],
  relatedProducts: [
    { id: 'p2', name: 'Apple Watch S9', price: 9500000, image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?q=80&w=300&auto=format&fit=crop' },
    { id: 'p3', name: 'iPhone 15 Pro', price: 32500000, image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=300&auto=format&fit=crop' },
    { id: 'p4', name: 'MacBook Pro M3', price: 45900000, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=300&auto=format&fit=crop' },
    { id: 'p5', name: 'iPad Pro M2', price: 21900000, image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=300&auto=format&fit=crop' }
  ]
};

const ProductDetailScreen = () => {
  const router = useRouter();
  const { addToCart } = useCart();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedColor, setSelectedColor] = useState(mockProduct.variants.colors[0]);
  const [selectedCapacity, setSelectedCapacity] = useState(mockProduct.variants.capacities[0]);
  const [quantity, setQuantity] = useState(1);
  const [showSheet, setShowSheet] = useState(false);
  const [actionType, setActionType] = useState<'cart' | 'buy'>('cart');

  // Animation values
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (showSheet) {
      Animated.timing(animValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }).start();
    } else {
      Animated.timing(animValue, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
        easing: Easing.in(Easing.cubic),
      }).start();
    }
  }, [showSheet]);

  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const openSheet = (type: 'cart' | 'buy') => {
    setActionType(type);
    setShowSheet(true);
  };

  const handleConfirmAction = () => {
    const variants = {
      "Màu sắc": selectedColor.name,
      "Dung lượng": selectedCapacity
    };
    
    setShowSheet(false);
    
    if (actionType === 'buy') {
      router.push({
        pathname: '/checkout/checkout' as any,
        params: { mode: 'single', productId: mockProduct.id, quantity: quantity.toString() }
      });
    } else {
      addToCart(mockProduct, quantity, variants);
    }
  };

  const backdropOpacity = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const sheetTranslateY = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [SCREEN_HEIGHT * 0.8, 0],
  });

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-zinc-50 dark:bg-zinc-950">
      {/* --- STICKY HEADER --- */}
      <Box className="bg-zinc-50 dark:bg-zinc-950 z-50 pt-4 pb-2 px-5 border-b border-zinc-200 dark:border-zinc-800">
        <HStack className="justify-between items-center">
          <Pressable 
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 items-center justify-center"
          >
            <Icon as={ChevronLeft} className="text-zinc-900 dark:text-white w-6 h-6" />
          </Pressable>
          <Text className="text-lg font-bold text-zinc-900 dark:text-white">Chi tiết sản phẩm</Text>
          <HStack className="space-x-3 gap-3">
            <Pressable className="w-10 h-10 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 items-center justify-center">
              <Icon as={Share2} className="text-zinc-700 dark:text-zinc-300 w-5 h-5" />
            </Pressable>
          </HStack>
        </HStack>
      </Box>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* 1. Image Gallery */}
        <Box className="bg-white dark:bg-zinc-900 relative">
          <ScrollView 
            horizontal 
            pagingEnabled 
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const newIndex = Math.round(e.nativeEvent.contentOffset.x / Dimensions.get('window').width);
              setActiveImageIndex(newIndex);
            }}
          >
            {mockProduct.images.map((img, index) => (
              <Box key={index} style={{ width: Dimensions.get('window').width }} className="p-5 items-center">
                <Image 
                  source={{ uri: img }}
                  className="w-full h-80 rounded-3xl object-contain"
                />
              </Box>
            ))}
          </ScrollView>
          
          {/* Pagination Dots */}
          <HStack className="absolute bottom-28 left-0 right-0 justify-center space-x-2 gap-2">
            {mockProduct.images.map((_, index) => (
              <Box 
                key={index} 
                className={`w-2 h-2 rounded-full ${
                  activeImageIndex === index ? 'bg-yellow-500 w-5' : 'bg-zinc-300 dark:bg-zinc-700'
                }`}
              />
            ))}
          </HStack>

          <Pressable 
            onPress={() => setIsFavorite(!isFavorite)}
            className="absolute top-8 right-8 z-10 w-12 h-12 rounded-full bg-white/80 dark:bg-zinc-800/80 items-center justify-center shadow-lg"
          >
            <Icon 
              as={Heart} 
              className={`${isFavorite ? 'text-red-500 fill-red-500' : 'text-zinc-400'} w-6 h-6`} 
            />
          </Pressable>

          <HStack className="px-5 pb-5 space-x-3 gap-3">
            {mockProduct.images.map((img, index) => (
              <Pressable 
                key={index}
                onPress={() => setActiveImageIndex(index)}
                className={`w-16 h-16 rounded-xl border-2 overflow-hidden ${
                  activeImageIndex === index ? 'border-yellow-500' : 'border-zinc-100 dark:border-zinc-800'
                }`}
              >
                <Image source={{ uri: img }} className="w-full h-full object-cover" />
              </Pressable>
            ))}
          </HStack>
        </Box>

        {/* 2. Product Info */}
        <Box className="px-5 py-6 bg-white dark:bg-zinc-900 mt-2">
          <HStack className="items-center space-x-2 gap-2 mb-2">
            <Box className="bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full">
              <Text className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                {mockProduct.category}
              </Text>
            </Box>
            <Text className="text-zinc-400">•</Text>
            <Text className="text-xs text-zinc-500 font-medium">{mockProduct.manufacturer}</Text>
          </HStack>

          <Text className="text-2xl font-bold text-zinc-900 dark:text-white leading-tight mb-4">
            {mockProduct.name}
          </Text>

          <HStack className="items-center space-x-2 gap-2 mb-4">
            <HStack className="items-center">
              {[...Array(5)].map((_, i) => (
                <Icon 
                  key={i} 
                  as={Star} 
                  className={`w-4 h-4 ${i < Math.floor(mockProduct.rating) ? 'text-yellow-500 fill-yellow-500' : 'text-zinc-200 dark:text-zinc-700'}`} 
                />
              ))}
            </HStack>
            <Text className="text-sm font-bold text-zinc-900 dark:text-white">{mockProduct.rating}</Text>
            <Text className="text-xs text-zinc-500">({mockProduct.reviewsCount} reviews)</Text>
          </HStack>

          <VStack className="space-y-1">
            <HStack className="items-center space-x-3 gap-3">
              <Text className="text-3xl font-extrabold text-zinc-900 dark:text-white">
                {formatPrice(mockProduct.price)}₫
              </Text>
              <Box className="bg-red-500 px-2 py-1 rounded-lg">
                <Text className="text-xs font-bold text-white">-{mockProduct.discount}%</Text>
              </Box>
            </HStack>
            <Text className="text-sm text-zinc-400 line-through">
              {formatPrice(mockProduct.originalPrice)}₫
            </Text>
          </VStack>
        </Box>

        {/* 2.1 Variants Visible on Page */}
        <Box className="px-5 py-6 bg-white dark:bg-zinc-900 mt-2">
          <Text className="text-base font-bold text-zinc-900 dark:text-white mb-4">Màu sắc</Text>
          <HStack className="flex-wrap gap-3 mb-6">
            {mockProduct.variants.colors.map((color) => (
              <Pressable 
                key={color.id}
                onPress={() => setSelectedColor(color)}
                className={`flex-row items-center px-4 py-2 rounded-2xl border-2 ${
                  selectedColor.id === color.id ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10' : 'border-zinc-100 dark:border-zinc-800'
                }`}
              >
                <Box className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: color.hex }} />
                <Text className={`text-xs font-bold ${selectedColor.id === color.id ? 'text-zinc-900 dark:text-yellow-500' : 'text-zinc-500'}`}>
                  {color.name}
                </Text>
              </Pressable>
            ))}
          </HStack>

          <Text className="text-base font-bold text-zinc-900 dark:text-white mb-4">Dung lượng</Text>
          <HStack className="flex-wrap gap-3">
            {mockProduct.variants.capacities.map((capacity) => (
              <Pressable 
                key={capacity}
                onPress={() => setSelectedCapacity(capacity)}
                className={`px-6 py-2 rounded-2xl border-2 ${
                  selectedCapacity === capacity ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10' : 'border-zinc-100 dark:border-zinc-800'
                }`}
              >
                <Text className={`text-xs font-bold ${selectedCapacity === capacity ? 'text-zinc-900 dark:text-yellow-500' : 'text-zinc-500'}`}>
                  {capacity}
                </Text>
              </Pressable>
            ))}
          </HStack>
        </Box>

        {/* 3. Features / Trust Badges */}
        <Box className="px-5 py-4 bg-zinc-50 dark:bg-zinc-950 flex-row justify-between border-y border-zinc-100 dark:border-zinc-900">
          <VStack className="items-center flex-1">
            <Icon as={Truck} className="text-yellow-500 w-5 h-5 mb-1" />
            <Text className="text-[10px] text-zinc-500 text-center">Free Delivery</Text>
          </VStack>
          <VStack className="items-center flex-1 border-x border-zinc-200 dark:border-zinc-800">
            <Icon as={ShieldCheck} className="text-yellow-500 w-5 h-5 mb-1" />
            <Text className="text-[10px] text-zinc-500 text-center">1 Year Warranty</Text>
          </VStack>
          <VStack className="items-center flex-1">
            <Icon as={RotateCcw} className="text-yellow-500 w-5 h-5 mb-1" />
            <Text className="text-[10px] text-zinc-500 text-center">7 Days Return</Text>
          </VStack>
        </Box>

        {/* 4. Description */}
        <Box className="px-5 py-6 bg-white dark:bg-zinc-900 mt-2">
          <Text className="text-lg font-bold text-zinc-900 dark:text-white mb-3">Mô tả sản phẩm</Text>
          <Text className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {mockProduct.description}
          </Text>
        </Box>

        {/* 5. Specifications */}
        <Box className="px-5 py-6 bg-white dark:bg-zinc-900 mt-2">
          <Text className="text-lg font-bold text-zinc-900 dark:text-white mb-4">Thông số kỹ thuật</Text>
          {mockProduct.specs.map((spec, index) => (
            <HStack key={index} className="py-3 border-b border-zinc-100 dark:border-zinc-800 justify-between">
              <Text className="text-sm text-zinc-500">{spec.key}</Text>
              <Text className="text-sm font-semibold text-zinc-900 dark:text-white">{spec.value}</Text>
            </HStack>
          ))}
        </Box>

        {/* 6. Customer Reviews */}
        <Box className="px-5 py-6 bg-white dark:bg-zinc-900 mt-2">
          <HStack className="justify-between items-center mb-6">
            <VStack>
              <Text className="text-lg font-bold text-zinc-900 dark:text-white">Đánh giá từ khách hàng</Text>
              <Text className="text-xs text-zinc-500">Dựa trên {mockProduct.reviewsCount} nhận xét</Text>
            </VStack>
            <Pressable>
              <Text className="text-sm font-bold text-yellow-600 dark:text-yellow-500">Xem tất cả</Text>
            </Pressable>
          </HStack>

          {mockProduct.reviews.map((review) => (
            <Box key={review.id} className="mb-6 p-4 rounded-3xl bg-zinc-50 dark:bg-zinc-800/50">
              <HStack className="justify-between items-start mb-3">
                <HStack className="space-x-3 gap-3">
                  <Image source={{ uri: review.avatar }} className="w-10 h-10 rounded-full" />
                  <VStack>
                    <Text className="text-sm font-bold text-zinc-900 dark:text-white">{review.user}</Text>
                    <Text className="text-[10px] text-zinc-400">{review.date}</Text>
                  </VStack>
                </HStack>
                <HStack>
                  {[...Array(5)].map((_, i) => (
                    <Icon 
                      key={i} 
                      as={Star} 
                      className={`w-3 h-3 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-zinc-200 dark:text-zinc-700'}`} 
                    />
                  ))}
                </HStack>
              </HStack>
              <Text className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {review.comment}
              </Text>
            </Box>
          ))}
        </Box>

        {/* 7. Related Products (GRID LAYOUT) */}
        <Box className="px-5 py-8 bg-white dark:bg-zinc-900 mt-2">
          <Text className="text-lg font-bold text-zinc-900 dark:text-white mb-6">Sản phẩm liên quan</Text>
          <HStack className="flex-wrap justify-between">
            {mockProduct.relatedProducts.map((product) => (
              <Pressable 
                key={product.id}
                className="w-[48%] bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-3xl border border-zinc-100 dark:border-zinc-800 mb-4 shadow-sm"
              >
                <Box className="w-full h-32 rounded-2xl bg-white dark:bg-zinc-800 mb-3 items-center justify-center overflow-hidden">
                  <Image source={{ uri: product.image }} className="w-full h-full object-cover" />
                </Box>
                <Text className="text-xs font-bold text-zinc-900 dark:text-white mb-1" numberOfLines={1}>{product.name}</Text>
                <Text className="text-sm font-extrabold text-yellow-600 dark:text-yellow-500">{formatPrice(product.price)}₫</Text>
              </Pressable>
            ))}
          </HStack>
        </Box>

        <Box className="h-20" />
      </ScrollView>

      {/* --- FOOTER ACTIONS --- */}
      <Box className="absolute bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 px-5 py-4 pb-8">
        <HStack className="space-x-4 gap-4">
          <Pressable 
            onPress={() => openSheet('cart')}
            className="w-14 h-14 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 items-center justify-center active:bg-zinc-100 dark:active:bg-zinc-700"
          >
            <Icon as={ShoppingCart} className="text-zinc-700 dark:text-zinc-300 w-6 h-6" />
          </Pressable>
          <Button 
            onPress={() => openSheet('buy')}
            className="flex-1 bg-yellow-500 h-14 rounded-2xl active:opacity-90"
          >
            <ButtonText className="text-zinc-900 font-extrabold text-base uppercase">Mua ngay</ButtonText>
          </Button>
        </HStack>
      </Box>

      {/* --- BOTTOM SHEET MODAL (CUSTOM ANIMATION) --- */}
      <Modal
        animationType="none"
        transparent={true}
        visible={showSheet}
        onRequestClose={() => setShowSheet(false)}
      >
        <Box className="flex-1 justify-end">
          {/* Animated Backdrop */}
          <Animated.View 
            style={{ opacity: backdropOpacity }}
            className="absolute inset-0 bg-black/60"
          >
            <Pressable className="flex-1" onPress={() => setShowSheet(false)} />
          </Animated.View>
          
          {/* Animated Sheet */}
          <Animated.View 
            style={{ transform: [{ translateY: sheetTranslateY }] }}
            className="bg-white dark:bg-zinc-900 rounded-t-[40px] px-6 pt-8 pb-10 shadow-2xl"
          >
            {/* Header with Product Preview */}
            <HStack className="space-x-4 gap-4 mb-8">
              <Box className="w-24 h-24 bg-zinc-50 dark:bg-zinc-800 rounded-3xl overflow-hidden border border-zinc-100 dark:border-zinc-800">
                <Image source={{ uri: mockProduct.images[0] }} className="w-full h-full object-cover" />
              </Box>
              <VStack className="flex-1 justify-center">
                <HStack className="items-center space-x-2 gap-2">
                  <Text className="text-2xl font-extrabold text-zinc-900 dark:text-white">{formatPrice(mockProduct.price)}₫</Text>
                  <Box className="bg-red-500 px-1.5 py-0.5 rounded-lg">
                    <Text className="text-[10px] font-bold text-white">-{mockProduct.discount}%</Text>
                  </Box>
                </HStack>
                <Text className="text-sm text-zinc-400 line-through mb-1">{formatPrice(mockProduct.originalPrice)}₫</Text>
                <Text className="text-xs text-zinc-500">Kho: 45 sản phẩm</Text>
              </VStack>
              <Pressable 
                onPress={() => setShowSheet(false)}
                className="w-10 h-10 rounded-full bg-zinc-50 dark:bg-zinc-800 items-center justify-center"
              >
                <Icon as={X} className="text-zinc-500 w-5 h-5" />
              </Pressable>
            </HStack>

            <ScrollView showsVerticalScrollIndicator={false} className="max-h-[400px]">
              {/* Variant 1: Colors */}
              <Text className="text-sm font-bold text-zinc-900 dark:text-white mb-3">Màu sắc</Text>
              <HStack className="flex-wrap gap-3 mb-6">
                {mockProduct.variants.colors.map((color) => (
                  <Pressable 
                    key={color.id}
                    onPress={() => setSelectedColor(color)}
                    className={`flex-row items-center px-4 py-2.5 rounded-2xl border-2 ${
                      selectedColor.id === color.id ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10' : 'border-zinc-100 dark:border-zinc-800'
                    }`}
                  >
                    <Box className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: color.hex }} />
                    <Text className={`text-xs font-bold ${selectedColor.id === color.id ? 'text-zinc-900 dark:text-yellow-500' : 'text-zinc-500'}`}>
                      {color.name}
                    </Text>
                  </Pressable>
                ))}
              </HStack>

              {/* Variant 2: Capacities */}
              <Text className="text-sm font-bold text-zinc-900 dark:text-white mb-3">Dung lượng</Text>
              <HStack className="flex-wrap gap-3 mb-6">
                {mockProduct.variants.capacities.map((capacity) => (
                  <Pressable 
                    key={capacity}
                    onPress={() => setSelectedCapacity(capacity)}
                    className={`px-6 py-2.5 rounded-2xl border-2 ${
                      selectedCapacity === capacity ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10' : 'border-zinc-100 dark:border-zinc-800'
                    }`}
                  >
                    <Text className={`text-xs font-bold ${selectedCapacity === capacity ? 'text-zinc-900 dark:text-yellow-500' : 'text-zinc-500'}`}>
                      {capacity}
                    </Text>
                  </Pressable>
                ))}
              </HStack>

              {/* Quantity Selector */}
              <HStack className="justify-between items-center mb-10">
                <Text className="text-sm font-bold text-zinc-900 dark:text-white">Số lượng</Text>
                <HStack className="items-center bg-zinc-100 dark:bg-zinc-800 rounded-2xl p-1 gap-4">
                  <Pressable 
                    onPress={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-700 items-center justify-center shadow-sm"
                  >
                    <Icon as={Minus} className="text-zinc-900 dark:text-white w-4 h-4" />
                  </Pressable>
                  <Text className="text-lg font-bold text-zinc-900 dark:text-white px-2">
                    {quantity}
                  </Text>
                  <Pressable 
                    onPress={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-xl bg-yellow-400 items-center justify-center shadow-sm"
                  >
                    <Icon as={Plus} className="text-zinc-900 w-4 h-4" />
                  </Pressable>
                </HStack>
              </HStack>
            </ScrollView>

            {/* Confirm Button */}
            <Button 
              onPress={handleConfirmAction}
              className="bg-yellow-500 h-16 rounded-3xl active:opacity-90"
            >
              <ButtonText className="text-zinc-900 font-extrabold text-lg uppercase">
                {actionType === 'cart' ? 'Thêm vào giỏ hàng' : 'Xác nhận Mua ngay'}
              </ButtonText>
            </Button>
          </Animated.View>
        </Box>
      </Modal>
    </SafeAreaView>
  );
};

export default ProductDetailScreen;
