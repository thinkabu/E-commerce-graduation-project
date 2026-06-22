import React, { useState } from "react";
import { SafeAreaView, ScrollView, Alert, Image } from "react-native";
import { useRouter, Stack, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { createReview } from "@/services/review.service";
import Header from "@/components/Header";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField } from "@/components/ui/input";
import { Button, ButtonText } from "@/components/ui/button";
import { Pressable } from "@/components/ui/pressable";
import { Icon } from "@/components/ui/icon";
import { Star, Send, Plus, X } from "lucide-react-native";

const WriteReviewScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { productId, orderId, productName, productImage } =
    useLocalSearchParams<{
      productId: string;
      orderId: string;
      productName: string;
      productImage: string;
    }>();

  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const ratingLabels = ["", "Rất tệ", "Tệ", "Bình thường", "Tốt", "Tuyệt vời"];

  const testImages = [
    "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=300",
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=300",
    "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=300",
  ];

  const handleAddImageUrl = () => {
    const trimmed = imageUrl.trim();
    if (!trimmed) return;
    if (images.includes(trimmed)) {
      Alert.alert("Lỗi", "Hình ảnh này đã được thêm");
      return;
    }
    setImages((prev) => [...prev, trimmed]);
    setImageUrl("");
  };

  const handleSelectTestImage = (url: string) => {
    if (images.includes(url)) {
      Alert.alert("Lỗi", "Hình ảnh này đã được thêm");
      return;
    }
    setImages((prev) => [...prev, url]);
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!user || !productId || !orderId) return;

    setLoading(true);
    try {
      await createReview(user._id, {
        productId,
        orderId,
        rating,
        title: title.trim() || undefined,
        comment: comment.trim() || undefined,
        images,
      });
      Alert.alert("Thành công", "Cảm ơn bạn đã đánh giá sản phẩm!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Gửi đánh giá thất bại";
      Alert.alert("Lỗi", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-zinc-50 dark:bg-zinc-950">
      <Stack.Screen options={{ headerShown: false }} />
      <Header title="Đánh giá sản phẩm" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20 }}
      >
        {/* Product Info */}
        <HStack className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-100 dark:border-zinc-800 mb-6 items-center space-x-4 gap-4 shadow-sm">
          {productImage && (
            <Image
              source={{ uri: productImage }}
              style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                backgroundColor: "#f4f4f5",
              }}
            />
          )}
          <Text
            className="flex-1 text-sm font-bold text-zinc-900 dark:text-white"
            numberOfLines={2}
          >
            {productName || "Sản phẩm"}
          </Text>
        </HStack>

        {/* Star Rating */}
        <VStack className="items-center mb-8">
          <Text className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-4">
            Chọn đánh giá của bạn
          </Text>
          <HStack className="space-x-3 gap-3 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable
                key={star}
                onPress={() => setRating(star)}
                className="p-1"
              >
                <Icon
                  as={Star}
                  className={`w-10 h-10 ${star <= rating ? "text-yellow-500 fill-yellow-500" : "text-zinc-200 dark:text-zinc-700"}`}
                />
              </Pressable>
            ))}
          </HStack>
          <Box className="bg-yellow-50 dark:bg-yellow-900/20 px-4 py-2 rounded-2xl">
            <Text className="text-sm font-bold text-yellow-700 dark:text-yellow-400">
              {ratingLabels[rating]}
            </Text>
          </Box>
        </VStack>

        {/* Title */}
        <VStack className="mb-5">
          <Text className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2 ml-1">
            Tiêu đề (tuỳ chọn)
          </Text>
          <Input className="h-14 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
            <InputField
              value={title}
              onChangeText={setTitle}
              placeholder="Ví dụ: Sản phẩm rất tốt!"
              maxLength={200}
              className="text-base text-zinc-900 dark:text-white px-4"
            />
          </Input>
        </VStack>

        {/* Comment */}
        <VStack className="mb-6">
          <Text className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2 ml-1">
            Nội dung đánh giá (tuỳ chọn)
          </Text>
          <Input
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm"
            style={{ height: 120 }}
          >
            <InputField
              value={comment}
              onChangeText={setComment}
              placeholder="Chia sẻ trải nghiệm của bạn..."
              maxLength={2000}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              className="text-base text-zinc-900 dark:text-white p-4"
              style={{ height: 110 }}
            />
          </Input>
        </VStack>

        {/* Product Images (New section) */}
        <VStack className="mb-8">
          <Text className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2 ml-1">
            Hình ảnh đánh giá (tối đa 3 ảnh, URL hoặc ảnh mẫu)
          </Text>

          {/* Added Images List */}
          {images.length > 0 && (
            <HStack className="gap-3 mb-4 flex-wrap">
              {images.map((img, idx) => (
                <Box key={idx} className="relative w-20 h-20 bg-zinc-100 rounded-2xl border border-zinc-200 overflow-hidden">
                  <Image source={{ uri: img }} className="w-full h-full object-cover" />
                  <Pressable
                    onPress={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500/80 items-center justify-center"
                  >
                    <Icon as={X} className="text-white w-3 h-3" />
                  </Pressable>
                </Box>
              ))}
            </HStack>
          )}

          {/* Add Image URL Row */}
          <HStack className="space-x-3 gap-3 mb-4 items-center">
            <Input className="flex-1 h-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
              <InputField
                value={imageUrl}
                onChangeText={setImageUrl}
                placeholder="Nhập đường dẫn hình ảnh (http...)"
                className="text-sm text-zinc-900 dark:text-white px-4"
              />
            </Input>
            <Pressable
              onPress={handleAddImageUrl}
              className="w-12 h-12 bg-yellow-400 active:bg-yellow-500 rounded-2xl items-center justify-center shadow-sm"
            >
              <Icon as={Plus} className="text-zinc-900 w-5 h-5" />
            </Pressable>
          </HStack>

          {/* Predefined Test Images */}
          <VStack className="bg-zinc-100/50 dark:bg-zinc-900/50 p-4 rounded-3xl border border-zinc-200/50 dark:border-zinc-800/50">
            <Text className="text-xs font-bold text-zinc-500 mb-3">
              Ấn nhanh để thêm ảnh mẫu thử nghiệm:
            </Text>
            <HStack className="space-x-4 gap-4">
              {testImages.map((img, idx) => (
                <Pressable
                  key={idx}
                  onPress={() => handleSelectTestImage(img)}
                  className="w-16 h-16 rounded-2xl border border-zinc-200 overflow-hidden active:opacity-75"
                >
                  <Image source={{ uri: img }} className="w-full h-full object-cover" />
                </Pressable>
              ))}
            </HStack>
          </VStack>
        </VStack>

        {/* Submit */}
        <Button
          onPress={handleSubmit}
          disabled={loading}
          className="w-full h-14 bg-yellow-400 rounded-2xl active:bg-yellow-500 shadow-sm"
        >
          <Icon as={Send} className="text-zinc-900 w-5 h-5 mr-2" />
          <ButtonText className="text-zinc-900 font-bold text-base">
            {loading ? "Đang gửi..." : "Gửi đánh giá"}
          </ButtonText>
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
};

export default WriteReviewScreen;
