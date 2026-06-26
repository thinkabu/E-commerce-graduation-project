import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter, Stack, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { createReview } from "@/services/review.service";
import api from "@/services/api";
import Header from "@/components/Header";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField } from "@/components/ui/input";
import { Button, ButtonText } from "@/components/ui/button";
import { Pressable } from "@/components/ui/pressable";
import { Icon } from "@/components/ui/icon";
import { Star, Send, ImagePlus, X } from "lucide-react-native";
import Toast from "@/components/Toast";

const MAX_IMAGES = 5;

const WriteReviewScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const {
    productId,
    orderId,
    productName,
    productImage,
    productIds,
    productNames,
    productImages,
    mode,
  } = useLocalSearchParams<{
    productId: string;
    orderId: string;
    productName: string;
    productImage: string;
    productIds: string;
    productNames: string;
    productImages: string;
    mode: string;
  }>();

  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "warning">(
    "error"
  );

  const showToast = (
    message: string,
    type: "success" | "error" | "warning" = "error"
  ) => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const ratingLabels = ["", "Rất tệ", "Tệ", "Bình thường", "Tốt", "Tuyệt vời"];

  /**
   * Chọn ảnh từ thư viện thiết bị và upload lên server để lấy URL
   */
  const handlePickImages = async () => {
    if (images.length >= MAX_IMAGES) {
      showToast(`Tối đa ${MAX_IMAGES} ảnh`, "warning");
      return;
    }

    // Xin quyền truy cập thư viện ảnh
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      showToast(
        "Ứng dụng cần quyền truy cập thư viện ảnh để tiếp tục",
        "warning"
      );
      return;
    }

    const remaining = MAX_IMAGES - images.length;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: remaining,
    });

    if (result.canceled || !result.assets?.length) return;

    setUploadingImages(true);
    try {
      const formData = new FormData();
      result.assets.forEach((asset) => {
        const filename = asset.uri.split("/").pop() || "photo.jpg";
        const ext = filename.split(".").pop()?.toLowerCase() || "jpg";
        const mimeType = ext === "png" ? "image/png" : "image/jpeg";
        formData.append("images", {
          uri: asset.uri,
          name: filename,
          type: mimeType,
        } as any);
      });

      const response = await api.post("/upload/images", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const uploadedUrls: string[] =
        response.data?.data?.urls ||
        response.data?.urls ||
        [];

      if (uploadedUrls.length > 0) {
        setImages((prev) => [...prev, ...uploadedUrls].slice(0, MAX_IMAGES));
        showToast(
          `Đã thêm ${uploadedUrls.length} ảnh thành công`,
          "success"
        );
      } else {
        showToast("Không thể tải ảnh lên, vui lòng thử lại", "error");
      }
    } catch (error: any) {
      showToast(
        error?.response?.data?.message || "Lỗi khi tải ảnh lên",
        "error"
      );
    } finally {
      setUploadingImages(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!user || !orderId) return;
    if (mode !== "all" && !productId) return;

    setLoading(true);
    try {
      if (mode === "all") {
        const idList = productIds?.split(",") || [];
        if (idList.length === 0) {
          showToast("Không tìm thấy danh sách sản phẩm", "error");
          setLoading(false);
          return;
        }

        await Promise.all(
          idList.map((pId) =>
            createReview(user._id, {
              productId: pId,
              orderId,
              rating,
              title: title.trim() || undefined,
              comment: comment.trim() || undefined,
              images,
            })
          )
        );
        showToast("Cảm ơn bạn đã đánh giá tất cả sản phẩm!", "success");
      } else {
        await createReview(user._id, {
          productId,
          orderId,
          rating,
          title: title.trim() || undefined,
          comment: comment.trim() || undefined,
          images,
        });
        showToast("Cảm ơn bạn đã đánh giá sản phẩm!", "success");
      }
      setTimeout(() => router.back(), 1500);
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Gửi đánh giá thất bại";
      showToast(msg, "error");
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
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      >
        {/* Product Info */}
        {mode === "all" ? (
          <VStack className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-100 dark:border-zinc-800 mb-6 shadow-sm space-y-3 gap-2">
            <Text className="text-xs font-bold text-zinc-500 uppercase">
              Đánh giá chung cho tất cả sản phẩm:
            </Text>
            {productNames?.split(";").map((name, idx) => {
              const imgs = productImages?.split(";");
              const img = imgs && imgs[idx];
              return (
                <HStack key={idx} className="items-center space-x-3 gap-3">
                  {img ? (
                    <Image
                      source={{ uri: img }}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        backgroundColor: "#f4f4f5",
                      }}
                    />
                  ) : null}
                  <Text
                    className="flex-1 text-xs font-bold text-zinc-700 dark:text-zinc-300"
                    numberOfLines={1}
                  >
                    {name}
                  </Text>
                </HStack>
              );
            })}
          </VStack>
        ) : (
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
        )}

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

        {/* Image Picker Section */}
        <VStack className="mb-8">
          <HStack className="justify-between items-center mb-3">
            <Text className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-1">
              Hình ảnh đánh giá ({images.length}/{MAX_IMAGES})
            </Text>
          </HStack>

          {/* Selected Images Grid */}
          <HStack className="gap-3 mb-4 flex-wrap">
            {images.map((img, idx) => (
              <Box
                key={idx}
                className="relative"
                style={{ width: 80, height: 80 }}
              >
                <Image
                  source={{ uri: img }}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 16,
                    backgroundColor: "#f4f4f5",
                  }}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  onPress={() => handleRemoveImage(idx)}
                  style={styles.removeBtn}
                >
                  <Icon as={X} className="text-white w-3 h-3" />
                </TouchableOpacity>
              </Box>
            ))}

            {/* Add Image Button */}
            {images.length < MAX_IMAGES && (
              <TouchableOpacity
                onPress={handlePickImages}
                disabled={uploadingImages}
                style={styles.addImageBtn}
              >
                {uploadingImages ? (
                  <ActivityIndicator color="#eab308" size="small" />
                ) : (
                  <>
                    <Icon as={ImagePlus} className="text-yellow-600 w-7 h-7" />
                    <Text style={styles.addImageText}>Thêm ảnh</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </HStack>

          <Text className="text-xs text-zinc-400 dark:text-zinc-600 ml-1">
            Ảnh được chọn từ thư viện máy và tải lên server
          </Text>
        </VStack>

        {/* Submit */}
        <Button
          onPress={handleSubmit}
          disabled={loading || uploadingImages}
          className="w-full h-14 bg-yellow-400 rounded-2xl active:bg-yellow-500 shadow-sm"
        >
          <Icon as={Send} className="text-zinc-900 w-5 h-5 mr-2" />
          <ButtonText className="text-zinc-900 font-bold text-base">
            {loading ? "Đang gửi..." : "Gửi đánh giá"}
          </ButtonText>
        </Button>
      </ScrollView>

      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={() => setToastVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  removeBtn: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(239,68,68,0.85)",
    alignItems: "center",
    justifyContent: "center",
  },
  addImageBtn: {
    width: 80,
    height: 80,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#fbbf24",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fefce8",
    gap: 4,
  },
  addImageText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#d97706",
    textAlign: "center",
  },
});

export default WriteReviewScreen;
