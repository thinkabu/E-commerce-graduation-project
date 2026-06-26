import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  ScrollView,
  Image,
  ActivityIndicator,
  View,
  RefreshControl,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Input, InputField } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { Pressable } from "@/components/ui/pressable";
import {
  Search,
  Bell,
  SlidersHorizontal,
  Heart,
  Sparkles,
  ChevronRight,
  PackageSearch,
  ArrowUp,
} from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";
import AvatarInitials from "@/components/AvatarInitials";
import { useNotification } from "@/contexts/NotificationContext";
import { getCategories, Category } from "@/services/category.service";
import { getProducts, Product } from "@/services/product.service";
import { getUserRecommendations, logRecommendationClick } from "@/services/recommendation.service";
import { getWishlist } from "@/services/wishlist.service";
import { getBanners, Banner } from "@/services/banner.service";

// Helper format price
const formatPrice = (price: number) => {
  return price.toLocaleString("vi-VN") + " đ";
};

const HomeScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { unreadCount, refreshUnreadCount } = useNotification();

  const scrollViewRef = useRef<ScrollView>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);
  const [recSessionId, setRecSessionId] = useState<string>("");
  const [wishlistedIds, setWishlistedIds] = useState<Set<string>>(new Set());
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination for suggested products
  const [suggestedPage, setSuggestedPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchWishlist = async () => {
    if (!user?._id) {
      setWishlistedIds(new Set());
      return;
    }
    try {
      const wishlist = await getWishlist(user._id, 1, 100);
      if (wishlist && wishlist.items) {
        const ids = new Set<string>(
          wishlist.items
            .map((item: any) => {
              if (!item.productId) return "";
              return typeof item.productId === "string" ? item.productId : item.productId._id;
            })
            .filter(Boolean)
        );
        setWishlistedIds(ids);
      }
    } catch (err) {
      console.error("Error fetching wishlist in home:", err);
    }
  };

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // Fetch wishlist
      await fetchWishlist();

      // Fetch categories
      const cats = await getCategories();
      setCategories(cats.filter((c) => c.isActive).slice(0, 5));

      // Fetch popular products (limit to 15)
      const popData = await getProducts({ limit: 15 });
      setPopularProducts(popData.items);

      // Fetch AI Suggested products cá nhân hóa
      const recData = await getUserRecommendations(user?._id || "guest");
      setRecSessionId(recData.sessionId || "");
      const recProducts = (recData.recommendations || [])
        .map((r: any) => r.product)
        .filter(Boolean);
      
      setSuggestedProducts(recProducts);
      setHasMore(false); // AI suggestions trả về Top-N, không cần phân trang tiếp

      // Fetch banners from DB
      const bannerData = await getBanners();
      setBanners(bannerData);
    } catch (error) {
      console.error("Error fetching home data:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setSuggestedPage(1);
    setHasMore(true);
    await fetchInitialData();
    await refreshUnreadCount();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      // Tải ngay khi vào màn hình
      refreshUnreadCount();
      fetchWishlist();

      // Polling tự động làm mới unreadCount mỗi 30 giây khi đang ở trang chủ
      const interval = setInterval(() => {
        refreshUnreadCount();
      }, 30000);

      return () => clearInterval(interval);
    }, [refreshUnreadCount, user?._id]),
  );

  const loadMoreSuggested = async () => {
    if (loadingMore || !hasMore || loading) return;
    setLoadingMore(true);

    try {
      const nextPage = suggestedPage + 1;
      const sugData = await getProducts({ limit: 20, page: nextPage });

      if (sugData.items.length > 0) {
        setSuggestedProducts((prev) => [...prev, ...sugData.items]);
        setSuggestedPage(nextPage);
      }

      if (sugData.items.length < 20) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching more suggested products:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 100;

    // Tải thêm sản phẩm khi vuốt xuống cuối trang
    if (
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom
    ) {
      loadMoreSuggested();
    }

    // Hiển thị nút "Cuộn lên đầu trang" khi cuộn qua 400px
    if (contentOffset.y > 400) {
      setShowScrollTop(true);
    } else {
      setShowScrollTop(false);
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1 }}
      className="bg-zinc-50 dark:bg-zinc-950"
      edges={["top", "left", "right"]}
    >
      {/* =========================================
          STICKY HEADER & SEARCH BAR
          (Nằm ngoài ScrollView để luôn cố định)
      ========================================= */}
      <Box className="bg-zinc-50 dark:bg-zinc-950 z-50 pt-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        {/* Header (Avatar & Icons) */}
        <Box className="px-5 mb-3">
          <HStack className="justify-between items-center">
            <HStack className="items-center space-x-3 gap-3">
              <AvatarInitials
                name={user?.fullName || "Người dùng"}
                avatarUrl={user?.avatar}
                size={44}
                borderWidth={2}
                borderColor="#ffffff"
              />
              <VStack>
                <Text className="text-xl font-bold text-zinc-900 dark:text-white leading-tight">
                  {user?.fullName || "Người dùng"}
                </Text>
              </VStack>
            </HStack>

            <HStack className="space-x-3 gap-3">
              <Pressable
                onPress={() => {
                  refreshUnreadCount();
                  router.push("/notifications" as any);
                }}
                className="w-10 h-10 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 items-center justify-center"
              >
                <Icon
                  as={Bell}
                  className="text-zinc-700 dark:text-zinc-300 w-5 h-5"
                />
                {unreadCount > 0 && (
                  <View
                    style={{
                      position: "absolute",
                      top: -2,
                      right: -2,
                      backgroundColor: "#ef4444",
                      borderRadius: 10,
                      minWidth: 16,
                      height: 16,
                      alignItems: "center",
                      justifyContent: "center",
                      paddingHorizontal: 3,
                    }}
                  >
                    <Text
                      style={{
                        color: "white",
                        fontSize: 9,
                        fontWeight: "bold",
                      }}
                    >
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </Text>
                  </View>
                )}
              </Pressable>
            </HStack>
          </HStack>
        </Box>

        {/* Search Bar (Navigable) */}
        <Box className="px-5 flex-row items-center space-x-3 gap-3">
          <Pressable
            onPress={() => router.push("/search/searchByKeyword")}
            className="flex-1 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 h-12 px-4 flex-row items-center rounded-2xl"
          >
            <Icon as={Search} className="text-zinc-400 w-5 h-5 mr-2" />
            <Text className="text-sm text-zinc-400 flex-1">
              Tìm kiếm sản phẩm...
            </Text>
          </Pressable>
          <Pressable className="w-12 h-12 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 items-center justify-center">
            <Icon
              as={SlidersHorizontal}
              className="text-zinc-700 dark:text-zinc-300 w-5 h-5"
            />
          </Pressable>
        </Box>
      </Box>

      {/* =========================================
          SCROLLABLE CONTENT
      ========================================= */}
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        className="flex-1"
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#eab308"
            colors={["#eab308"]}
          />
        }
      >
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
                  <Pressable
                    onPress={() =>
                      router.push({
                        pathname: "/category/productFollCate",
                        params: { id: item._id, name: item.name },
                      })
                    }
                    className="w-14 h-14 rounded-full bg-white dark:bg-zinc-900 items-center justify-center shadow-sm elevation-1 active:bg-zinc-50 dark:active:bg-zinc-800 overflow-hidden"
                  >
                    {item.image ? (
                      <Image
                        source={{ uri: item.image }}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <Icon
                        as={PackageSearch}
                        className="text-zinc-400 w-6 h-6"
                      />
                    )}
                  </Pressable>
                  <Text
                    className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300 w-16 text-center"
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                </VStack>
              ))}
              {/* "Tất cả" Button */}
              <VStack className="items-center space-y-2 gap-2">
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: "/category/productFollCate",
                      params: { name: "Tất cả" },
                    })
                  }
                  className="w-14 h-14 rounded-full bg-white dark:bg-zinc-900 items-center justify-center shadow-sm elevation-1 active:bg-zinc-50 dark:active:bg-zinc-800"
                >
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
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="pl-5"
            snapToInterval={316}
            decelerationRate="fast"
          >
            <HStack className="space-x-4 gap-4 pr-10">
              {banners.map((banner) => (
                <Box
                  key={banner._id}
                  className="w-[300px] h-40 rounded-3xl overflow-hidden relative shadow-md elevation-2 bg-zinc-900"
                >
                  <Image
                    source={{ uri: banner.image }}
                    className="absolute w-full h-full object-cover opacity-60"
                  />
                  <Box className="absolute inset-0 bg-black/20" />
                  <VStack className="absolute bottom-4 left-5">
                    <Text className="text-xs font-bold text-yellow-400 uppercase tracking-wider">
                      {banner.subtitle}
                    </Text>
                    <Text className="text-2xl font-extrabold text-white">
                      {banner.title}
                    </Text>
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
                <Text className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Xem tất cả
                </Text>
                <Icon as={ChevronRight} className="text-zinc-500 w-4 h-4" />
              </HStack>
            </Pressable>
          </HStack>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="overflow-visible pb-2"
          >
            <HStack className="space-x-4 gap-4">
              {loading ? (
                <Box className="w-40 h-40 justify-center items-center">
                  <ActivityIndicator color="#eab308" />
                </Box>
              ) : (
                popularProducts.map((product) => {
                  const finalPrice =
                    product.basePrice *
                    (1 - (product.discountPercentage || 0) / 100);
                  const displayImage =
                    product.images?.[0] || "https://via.placeholder.com/300";

                  return (
                    <Pressable
                      key={product._id}
                      onPress={() =>
                        router.push({
                          pathname: "/product/productdetail",
                          params: { id: product._id },
                        })
                      }
                      className="bg-white dark:bg-zinc-900 rounded-3xl p-3 w-40 border border-zinc-100 dark:border-zinc-800 shadow-sm elevation-1 active:opacity-90"
                    >
                      <Box className="w-full h-32 bg-zinc-50 dark:bg-zinc-800 rounded-2xl mb-3 items-center justify-center relative overflow-hidden">
                        <Box className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 dark:bg-zinc-900/80 items-center justify-center z-10">
                          <Icon
                            as={Heart}
                            className={`${
                              wishlistedIds.has(product._id)
                                ? "text-red-500 fill-red-500"
                                : "text-zinc-400"
                            } w-4 h-4`}
                          />
                        </Box>
                        {product.discountPercentage > 0 && (
                          <Box className="absolute top-2 left-2 bg-yellow-500 rounded-md px-1.5 py-0.5 z-10">
                            <Text className="text-[10px] font-bold text-white">
                              -{product.discountPercentage}%
                            </Text>
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
                        <Text
                          className="text-xs text-zinc-700 dark:text-zinc-300 font-medium leading-tight"
                          numberOfLines={2}
                        >
                          {product.name}
                        </Text>
                      </VStack>
                    </Pressable>
                  );
                })
              )}
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
                const finalPrice =
                  product.basePrice *
                  (1 - (product.discountPercentage || 0) / 100);
                const displayImage =
                  product.images?.[0] || "https://via.placeholder.com/300";

                return (
                  <Pressable
                    key={product._id}
                    onPress={() => {
                      if (recSessionId) {
                        logRecommendationClick(recSessionId, product._id);
                      }
                      router.push({
                        pathname: "/product/productdetail",
                        params: { id: product._id },
                      });
                    }}
                    className="w-[48%] bg-white dark:bg-zinc-900 rounded-3xl p-3 mb-4 border border-zinc-100 dark:border-zinc-800 shadow-sm elevation-1 active:opacity-90"
                  >
                    <Box className="w-full h-40 bg-zinc-50 dark:bg-zinc-800 rounded-2xl mb-3 relative overflow-hidden">
                      <Box className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 dark:bg-zinc-900/80 items-center justify-center z-10">
                        <Icon
                          as={Heart}
                          className={`${
                            wishlistedIds.has(product._id)
                              ? "text-red-500 fill-red-500"
                              : "text-zinc-400"
                          } w-4 h-4`}
                        />
                      </Box>
                      {product.discountPercentage > 0 && (
                        <Box className="absolute top-2 left-2 bg-yellow-500 rounded-md px-1.5 py-0.5 z-10">
                          <Text className="text-[10px] font-bold text-white">
                            -{product.discountPercentage}%
                          </Text>
                        </Box>
                      )}
                      <Image
                        source={{ uri: displayImage }}
                        className="w-full h-full object-cover"
                      />
                    </Box>
                    <VStack className="space-y-1 gap-1 px-1">
                      <Text
                        className="text-sm text-zinc-800 dark:text-zinc-200 font-medium leading-tight"
                        numberOfLines={2}
                      >
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

          {loadingMore && (
            <Box className="h-20 justify-center items-center mt-4">
              <ActivityIndicator color="#eab308" />
              <Text className="text-zinc-500 text-xs mt-2">
                Đang tải thêm...
              </Text>
            </Box>
          )}
        </Box>

        {/* Bottom padding for tabs */}
        <Box className="h-10" />
      </ScrollView>

      {/* Nút cuộn lên đầu trang */}
      {showScrollTop && (
        <Pressable
          onPress={scrollToTop}
          className="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-yellow-500 items-center justify-center shadow-lg active:scale-95 z-50 flex"
          style={{
            elevation: 5,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
          }}
        >
          <Icon as={ArrowUp} className="text-zinc-900 w-7 h-7 font-bold" />
        </Pressable>
      )}
    </SafeAreaView>
  );
};

export default HomeScreen;
