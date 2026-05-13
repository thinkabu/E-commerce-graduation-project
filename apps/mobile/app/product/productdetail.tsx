import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ScrollView, Image, View, Alert, Modal, Dimensions, Animated, Easing, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Header from '@/components/Header';
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
import { getProductById } from '@/services/product.service';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const mockReviews = [
  {
    id: 'r1',
    user: 'Nguyễn Văn A',
    avatar: 'https://i.pravatar.cc/150?u=a',
    rating: 5,
    date: '2024-03-15',
    comment: 'Sản phẩm chất lượng, đóng gói cẩn thận. Rất đáng đồng tiền bát gạo!'
  },
  {
    id: 'r2',
    user: 'Trần Thị B',
    avatar: 'https://i.pravatar.cc/150?u=b',
    rating: 4,
    date: '2024-03-10',
    comment: 'Dùng rất thích, nhân viên tư vấn nhiệt tình.'
  }
];

const mockRelatedProducts = [
  { id: 'p2', name: 'Apple Watch S9', price: 9500000, image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?q=80&w=300&auto=format&fit=crop' },
  { id: 'p3', name: 'iPhone 15 Pro', price: 32500000, image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=300&auto=format&fit=crop' },
  { id: 'p4', name: 'MacBook Pro M3', price: 45900000, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=300&auto=format&fit=crop' },
  { id: 'p5', name: 'iPad Pro M2', price: 21900000, image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=300&auto=format&fit=crop' }
];

const ProductDetailScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showSheet, setShowSheet] = useState(false);
  const [actionType, setActionType] = useState<'cart' | 'buy'>('cart');

  // Dynamic variants state
  const [variantOptions, setVariantOptions] = useState<Record<string, string[]>>({});
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [matchingVariant, setMatchingVariant] = useState<any>(null);

  // Animation values
  const animValue = useRef(new Animated.Value(0)).current;

  // 1. Fetch Product Data
  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const data = await getProductById(id);
        if (data) {
          setProduct(data);
          
          // Build variant options dynamically
          if (data.variants && data.variants.length > 0) {
            const options: Record<string, string[]> = {};
            data.variants.forEach((v: any) => {
              v.attributes?.forEach((attr: any) => {
                if (!options[attr.name]) options[attr.name] = [];
                if (!options[attr.name].includes(attr.value)) {
                  options[attr.name].push(attr.value);
                }
              });
            });
            setVariantOptions(options);

            // Select default attributes (first available option for each)
            const initialSelection: Record<string, string> = {};
            Object.keys(options).forEach(key => {
              initialSelection[key] = options[key][0];
            });
            setSelectedAttributes(initialSelection);
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // 2. Find matching variant when selectedAttributes change
  useEffect(() => {
    if (!product || !product.variants || product.variants.length === 0) return;
    
    const match = product.variants.find((v: any) => {
      return v.attributes?.every((attr: any) => 
        selectedAttributes[attr.name] === attr.value
      );
    });
    setMatchingVariant(match || null);
  }, [selectedAttributes, product]);

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
    if (!product) return;
    
    setShowSheet(false);
    
    // Prepare item to add to cart
    const itemToAdd = matchingVariant ? {
      ...product, // keep base properties
      id: product._id, // map _id to id for cart context
      variantId: matchingVariant._id,
      price: matchingVariant.price,
      discount: matchingVariant.discountPercentage,
      images: matchingVariant.images?.length > 0 ? matchingVariant.images : product.images,
    } : {
      ...product,
      id: product._id,
      price: product.basePrice,
      discount: product.discountPercentage,
    };

    if (actionType === 'buy') {
      router.push({
        pathname: '/checkout/checkout' as any,
        params: { 
          mode: 'single', 
          productId: itemToAdd.id, 
          variantId: matchingVariant?._id, 
          quantity: quantity.toString() 
        }
      });
    } else {
      addToCart(itemToAdd, quantity, selectedAttributes);
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
      <Header 
        title="Chi tiết sản phẩm" 
        rightAction={
          <Pressable className="w-10 h-10 rounded-full bg-zinc-50 dark:bg-zinc-900 items-center justify-center">
            <Icon as={Share2} className="text-zinc-700 dark:text-zinc-300" size="sm" />
          </Pressable>
        }
      />

      {loading || !product ? (
        <Box className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#eab308" />
        </Box>
      ) : (
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
              {(product.images?.length > 0 ? product.images : ['https://via.placeholder.com/600']).map((img: string, index: number) => (
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
              {(product.images?.length > 0 ? product.images : ['https://via.placeholder.com/600']).map((_: any, index: number) => (
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
              {(product.images?.length > 0 ? product.images : ['https://via.placeholder.com/600']).map((img: string, index: number) => (
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
                  {product.categoryId?.name || 'Sản phẩm'}
                </Text>
              </Box>
              <Text className="text-zinc-400">•</Text>
              <Text className="text-xs text-zinc-500 font-medium">{product.manufacturer}</Text>
            </HStack>

            <Text className="text-2xl font-bold text-zinc-900 dark:text-white leading-tight mb-4">
              {product.name}
            </Text>

            <HStack className="items-center space-x-2 gap-2 mb-4">
              <HStack className="items-center">
                {[...Array(5)].map((_, i) => (
                  <Icon 
                    key={i} 
                    as={Star} 
                    className={`w-4 h-4 ${i < Math.floor(product.averageRating || 0) ? 'text-yellow-500 fill-yellow-500' : 'text-zinc-200 dark:text-zinc-700'}`} 
                  />
                ))}
              </HStack>
              <Text className="text-sm font-bold text-zinc-900 dark:text-white">{product.averageRating || 0}</Text>
              <Text className="text-xs text-zinc-500">({product.reviewCount || 0} reviews)</Text>
            </HStack>

            <VStack className="space-y-1">
              <HStack className="items-center space-x-3 gap-3">
                <Text className="text-3xl font-extrabold text-zinc-900 dark:text-white">
                  {formatPrice(product.finalPrice || product.basePrice)}₫
                </Text>
                {product.discountPercentage > 0 && (
                  <Box className="bg-red-500 px-2 py-1 rounded-lg">
                    <Text className="text-xs font-bold text-white">-{product.discountPercentage}%</Text>
                  </Box>
                )}
              </HStack>
              {product.discountPercentage > 0 && (
                <Text className="text-sm text-zinc-400 line-through">
                  {formatPrice(product.basePrice)}₫
                </Text>
              )}
            </VStack>
          </Box>

          {/* 2.1 Variants Visible on Page */}
          {Object.keys(variantOptions).length > 0 && (
            <Box className="px-5 py-6 bg-white dark:bg-zinc-900 mt-2">
              {Object.entries(variantOptions).map(([attrName, attrValues]) => (
                <Box key={attrName} className="mb-4">
                  <Text className="text-base font-bold text-zinc-900 dark:text-white mb-4">{attrName}</Text>
                  <HStack className="flex-wrap gap-3">
                    {attrValues.map((val) => {
                      const isSelected = selectedAttributes[attrName] === val;
                      return (
                        <Pressable 
                          key={val}
                          onPress={() => setSelectedAttributes(prev => ({ ...prev, [attrName]: val }))}
                          className={`px-6 py-2 rounded-2xl border-2 ${
                            isSelected ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10' : 'border-zinc-100 dark:border-zinc-800'
                          }`}
                        >
                          <Text className={`text-xs font-bold ${isSelected ? 'text-zinc-900 dark:text-yellow-500' : 'text-zinc-500'}`}>
                            {val}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </HStack>
                </Box>
              ))}
            </Box>
          )}

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
            {product.description || 'Chưa có mô tả.'}
          </Text>
        </Box>

        {/* 5. Specifications */}
        {product.specifications && Object.keys(product.specifications).length > 0 && (
          <Box className="px-5 py-6 bg-white dark:bg-zinc-900 mt-2">
            <Text className="text-lg font-bold text-zinc-900 dark:text-white mb-4">Thông số kỹ thuật</Text>
            {Object.entries(product.specifications).map(([key, value]) => (
              <HStack key={key} className="py-3 border-b border-zinc-100 dark:border-zinc-800 justify-between">
                <Text className="text-sm text-zinc-500 flex-1 pr-4">{key}</Text>
                <Text className="text-sm font-semibold text-zinc-900 dark:text-white flex-1 text-right">{value as string}</Text>
              </HStack>
            ))}
          </Box>
        )}

        {/* 6. Customer Reviews */}
        <Box className="px-5 py-6 bg-white dark:bg-zinc-900 mt-2">
          <HStack className="justify-between items-center mb-6">
            <VStack>
              <Text className="text-lg font-bold text-zinc-900 dark:text-white">Đánh giá từ khách hàng</Text>
              <Text className="text-xs text-zinc-500">Dựa trên {product.reviewCount || 0} nhận xét</Text>
            </VStack>
            <Pressable>
              <Text className="text-sm font-bold text-yellow-600 dark:text-yellow-500">Xem tất cả</Text>
            </Pressable>
          </HStack>

          {mockReviews.map((review) => (
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
            {mockRelatedProducts.map((p) => (
              <Pressable 
                key={p.id}
                className="w-[48%] bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-3xl border border-zinc-100 dark:border-zinc-800 mb-4 shadow-sm"
              >
                <Box className="w-full h-32 rounded-2xl bg-white dark:bg-zinc-800 mb-3 items-center justify-center overflow-hidden">
                  <Image source={{ uri: p.image }} className="w-full h-full object-cover" />
                </Box>
                <Text className="text-xs font-bold text-zinc-900 dark:text-white mb-1" numberOfLines={1}>{p.name}</Text>
                <Text className="text-sm font-extrabold text-yellow-600 dark:text-yellow-500">{formatPrice(p.price)}₫</Text>
              </Pressable>
            ))}
          </HStack>
        </Box>

        <Box className="h-20" />
      </ScrollView>
      )}

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
            {product && (
              <>
                {/* Header with Product Preview */}
                <HStack className="space-x-4 gap-4 mb-8">
                  <Box className="w-24 h-24 bg-zinc-50 dark:bg-zinc-800 rounded-3xl overflow-hidden border border-zinc-100 dark:border-zinc-800">
                    <Image 
                      source={{ uri: (matchingVariant?.images?.length > 0 ? matchingVariant.images[0] : product.images?.[0]) || 'https://via.placeholder.com/600' }} 
                      className="w-full h-full object-cover" 
                    />
                  </Box>
                  <VStack className="flex-1 justify-center">
                    <HStack className="items-center space-x-2 gap-2">
                      <Text className="text-2xl font-extrabold text-zinc-900 dark:text-white">
                        {formatPrice(matchingVariant?.finalPrice || product.finalPrice || product.basePrice)}₫
                      </Text>
                      {(matchingVariant?.discountPercentage || product.discountPercentage) > 0 && (
                        <Box className="bg-red-500 px-1.5 py-0.5 rounded-lg">
                          <Text className="text-[10px] font-bold text-white">
                            -{(matchingVariant?.discountPercentage || product.discountPercentage)}%
                          </Text>
                        </Box>
                      )}
                    </HStack>
                    {(matchingVariant?.discountPercentage || product.discountPercentage) > 0 && (
                      <Text className="text-sm text-zinc-400 line-through mb-1">
                        {formatPrice(matchingVariant?.price || product.basePrice)}₫
                      </Text>
                    )}
                    <Text className="text-xs text-zinc-500">
                      Kho: {matchingVariant ? matchingVariant.stockQuantity : product.stockQuantity || 0} sản phẩm
                    </Text>
                  </VStack>
                  <Pressable 
                    onPress={() => setShowSheet(false)}
                    className="w-10 h-10 rounded-full bg-zinc-50 dark:bg-zinc-800 items-center justify-center"
                  >
                    <Icon as={X} className="text-zinc-500 w-5 h-5" />
                  </Pressable>
                </HStack>

                <ScrollView showsVerticalScrollIndicator={false} className="max-h-[400px]">
                  {Object.keys(variantOptions).length > 0 && Object.entries(variantOptions).map(([attrName, attrValues]) => (
                    <Box key={attrName} className="mb-4">
                      <Text className="text-sm font-bold text-zinc-900 dark:text-white mb-3">{attrName}</Text>
                      <HStack className="flex-wrap gap-3 mb-2">
                        {attrValues.map((val) => {
                          const isSelected = selectedAttributes[attrName] === val;
                          return (
                            <Pressable 
                              key={val}
                              onPress={() => setSelectedAttributes(prev => ({ ...prev, [attrName]: val }))}
                              className={`flex-row items-center px-4 py-2.5 rounded-2xl border-2 ${
                                isSelected ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10' : 'border-zinc-100 dark:border-zinc-800'
                              }`}
                            >
                              <Text className={`text-xs font-bold ${isSelected ? 'text-zinc-900 dark:text-yellow-500' : 'text-zinc-500'}`}>
                                {val}
                              </Text>
                            </Pressable>
                          );
                        })}
                      </HStack>
                    </Box>
                  ))}

                  {/* Quantity Selector */}
                  <HStack className="justify-between items-center mb-10 mt-4">
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
                        onPress={() => {
                          const maxStock = matchingVariant ? matchingVariant.stockQuantity : product.stockQuantity || 0;
                          if (quantity < maxStock) {
                            setQuantity(quantity + 1);
                          } else {
                            Alert.alert('Thông báo', 'Số lượng vượt quá số lượng trong kho.');
                          }
                        }}
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
              </>
            )}
          </Animated.View>
        </Box>
      </Modal>
    </SafeAreaView>
  );
};

export default ProductDetailScreen;
