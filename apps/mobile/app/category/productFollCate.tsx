import React, { useState } from "react";
import {
  ScrollView,
  SafeAreaView,
  Dimensions,
  Image,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useRouter, Stack, useLocalSearchParams } from "expo-router";
import Header from "@/components/Header";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Icon } from "@/components/ui/icon";
import { Pressable } from "@/components/ui/pressable";
import { SlidersHorizontal, Star, LayoutGrid, List } from "lucide-react-native";

import { getProducts, Product } from "@/services/product.service";
import { getCategories, Category } from "@/services/category.service";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const CategoryProductsScreen = () => {
  const router = useRouter();
  const { name = "Danh mục", id } = useLocalSearchParams<{
    name: string;
    id: string;
  }>();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategoryId, setSelectedCategoryId] = useState<
    string | undefined
  >(id === "all" || !id ? undefined : id);

  const filterChips = ["Tất cả", "Giá thấp", "Giá cao", "Bán chạy", "Mới nhất"];
  const [activeFilter, setActiveFilter] = useState("Tất cả");

  React.useEffect(() => {
    const fetchCats = async () => {
      try {
        const cats = await getCategories();
        setCategories(cats.filter((c) => c.isActive));
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCats();
  }, []);

  React.useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Construct params based on filters
        const params: any = {
          categoryId: selectedCategoryId,
          limit: 30,
        };

        // Handle sorting/filtering
        if (activeFilter === "Giá thấp") {
          params.sort = "basePrice";
          params.order = "asc";
        } else if (activeFilter === "Giá cao") {
          params.sort = "basePrice";
          params.order = "desc";
        } else if (activeFilter === "Bán chạy") {
          params.sort = "soldCount";
          params.order = "desc";
        }

        const data = await getProducts(params);
        setProducts(data.items);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [selectedCategoryId, activeFilter]);

  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-zinc-50 dark:bg-zinc-950">
      <Stack.Screen options={{ headerShown: false }} />
      <Header title={name as string} />

      <VStack className="flex-1">
        {/* Categories Bar */}
        {categories.length > 0 && (
          <Box className="bg-white dark:bg-zinc-950 pt-3">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="px-5"
              contentContainerStyle={{ gap: 12, paddingBottom: 10 }}
            >
              <Pressable
                onPress={() => setSelectedCategoryId(undefined)}
                className={`px-4 py-2 rounded-xl border ${
                  !selectedCategoryId
                    ? "bg-yellow-500 border-yellow-500"
                    : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    !selectedCategoryId
                      ? "text-zinc-900"
                      : "text-zinc-600 dark:text-zinc-400"
                  }`}
                >
                  Tất cả danh mục
                </Text>
              </Pressable>

              {categories.map((cat) => (
                <Pressable
                  key={cat._id}
                  onPress={() => setSelectedCategoryId(cat._id)}
                  className={`px-4 py-2 rounded-xl border flex-row items-center space-x-2 gap-2 ${
                    selectedCategoryId === cat._id
                      ? "bg-yellow-500 border-yellow-500"
                      : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                  }`}
                >
                  {cat.image && (
                    <Image
                      source={{ uri: cat.image }}
                      className="w-4 h-4 rounded-full"
                    />
                  )}
                  <Text
                    className={`text-xs font-bold ${
                      selectedCategoryId === cat._id
                        ? "text-zinc-900"
                        : "text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    {cat.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </Box>
        )}

        {/* Filter Chips Bar */}
        <Box className="bg-white dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-900">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="px-5 py-3"
            contentContainerStyle={{ gap: 12 }}
          >
            {filterChips.map((chip) => (
              <Pressable
                key={chip}
                onPress={() => setActiveFilter(chip)}
                className={`px-4 py-2 rounded-full border ${
                  activeFilter === chip
                    ? "bg-zinc-900 dark:bg-zinc-100 border-zinc-900 dark:border-zinc-100"
                    : "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    activeFilter === chip
                      ? "text-white dark:text-zinc-900"
                      : "text-zinc-500"
                  }`}
                >
                  {chip}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </Box>

        {/* List Controls */}
        <HStack className="px-5 py-4 justify-between items-center">
          <Text className="text-sm font-bold text-zinc-500">
            {products.length} sản phẩm
          </Text>
          <HStack className="space-x-2 gap-2">
            <Pressable
              onPress={() => setViewMode("grid")}
              className={`p-2 rounded-xl ${viewMode === "grid" ? "bg-zinc-200 dark:bg-zinc-800" : ""}`}
            >
              <Icon
                as={LayoutGrid}
                className={
                  viewMode === "grid"
                    ? "text-zinc-900 dark:text-white"
                    : "text-zinc-400"
                }
                size="sm"
              />
            </Pressable>
            <Pressable
              onPress={() => setViewMode("list")}
              className={`p-2 rounded-xl ${viewMode === "list" ? "bg-zinc-200 dark:bg-zinc-800" : ""}`}
            >
              <Icon
                as={List}
                className={
                  viewMode === "list"
                    ? "text-zinc-900 dark:text-white"
                    : "text-zinc-400"
                }
                size="sm"
              />
            </Pressable>
            <Box className="w-px h-4 bg-zinc-200 dark:bg-zinc-800 mx-1" />
            <Pressable className="flex-row items-center space-x-2 gap-2 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <Icon
                as={SlidersHorizontal}
                className="text-zinc-900 dark:text-white"
                size="xs"
              />
              <Text className="text-xs font-black uppercase tracking-tighter text-zinc-900 dark:text-white">
                Lọc
              </Text>
            </Pressable>
          </HStack>
        </HStack>

        {/* Product List */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1 px-5"
        >
          {loading ? (
            <Box className="flex-1 justify-center items-center py-20">
              <ActivityIndicator color="#EAB308" size="large" />
            </Box>
          ) : products.length > 0 ? (
            viewMode === "grid" ? (
              <HStack className="flex-wrap justify-between pb-10">
                {products.map((product) => (
                  <Pressable
                    key={product._id}
                    onPress={() =>
                      router.push({
                        pathname: "/product/productdetail",
                        params: { id: product._id },
                      })
                    }
                    className="w-[48%] bg-white dark:bg-zinc-900 p-3 rounded-[32px] border border-zinc-100 dark:border-zinc-800 mb-4 shadow-sm"
                  >
                    <Box className="w-full h-36 rounded-2xl bg-zinc-50 dark:bg-zinc-800 mb-3 items-center justify-center overflow-hidden">
                      <Image
                        source={{
                          uri:
                            product.images?.[0] ||
                            "https://via.placeholder.com/300",
                        }}
                        className="w-full h-full object-cover"
                      />
                    </Box>
                    <VStack className="px-1">
                      <Text
                        className="text-xs font-bold text-zinc-900 dark:text-white mb-1"
                        numberOfLines={1}
                      >
                        {product.name}
                      </Text>
                      <HStack className="items-center space-x-1 gap-1 mb-2">
                        <Icon
                          as={Star}
                          className="text-yellow-500 fill-yellow-500 w-3 h-3"
                        />
                        <Text className="text-[10px] font-bold text-zinc-500">
                          {product.averageRating || 0}
                        </Text>
                      </HStack>
                      <Text className="text-sm font-black text-yellow-600 dark:text-yellow-500">
                        {formatPrice(product.basePrice)}₫
                      </Text>
                    </VStack>
                  </Pressable>
                ))}
              </HStack>
            ) : (
              <VStack className="space-y-4 gap-4 pb-10">
                {products.map((product) => (
                  <Pressable
                    key={product._id}
                    onPress={() =>
                      router.push({
                        pathname: "/product/productdetail",
                        params: { id: product._id },
                      })
                    }
                    className="bg-white dark:bg-zinc-900 p-4 rounded-[32px] border border-zinc-100 dark:border-zinc-800 shadow-sm"
                  >
                    <HStack className="space-x-4 gap-4">
                      <Image
                        source={{
                          uri:
                            product.images?.[0] ||
                            "https://via.placeholder.com/300",
                        }}
                        className="w-24 h-24 rounded-2xl bg-zinc-50 dark:bg-zinc-800"
                      />
                      <VStack className="flex-1 justify-center space-y-1 gap-1">
                        <Text
                          className="text-sm font-bold text-zinc-900 dark:text-white"
                          numberOfLines={2}
                        >
                          {product.name}
                        </Text>
                        <HStack className="items-center space-x-1 gap-1 mb-1">
                          <Icon
                            as={Star}
                            className="text-yellow-500 fill-yellow-500 w-3 h-3"
                          />
                          <Text className="text-[10px] font-bold text-zinc-500">
                            {product.averageRating || 0}
                          </Text>
                        </HStack>
                        <Text className="text-base font-black text-yellow-600 dark:text-yellow-500">
                          {formatPrice(product.basePrice)}₫
                        </Text>
                      </VStack>
                    </HStack>
                  </Pressable>
                ))}
              </VStack>
            )
          ) : (
            <VStack className="flex-1 justify-center items-center py-20">
              <Text className="text-zinc-400 font-medium">
                Không có sản phẩm nào trong danh mục này
              </Text>
            </VStack>
          )}
        </ScrollView>
      </VStack>
    </SafeAreaView>
  );
};

export default CategoryProductsScreen;
