import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  View,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter, Stack, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { requestOrderReturn } from "@/services/order.service";
import api from "@/services/api";
import Header from "@/components/Header";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField } from "@/components/ui/input";
import { Button, ButtonText } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Camera, Video, ImagePlus, X, AlertCircle } from "lucide-react-native";
import Toast from "@/components/Toast";
import { Image } from "react-native";

const MAX_IMAGES = 5;
const RETURN_REASONS = [
  "Sản phẩm bị lỗi, không hoạt động",
  "Giao sai sản phẩm / sai mẫu mã",
  "Sản phẩm khác biệt so với mô tả",
  "Hộp/bao bì bị bể vỡ khi vận chuyển",
  "Lý do khác",
];

const ReturnOrderScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();

  const [selectedReason, setSelectedReason] = useState<string>("");
  const [problem, setProblem] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "warning">("error");

  const showToast = (message: string, type: "success" | "error" | "warning" = "error") => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  /**
   * Chọn ảnh từ thư viện thiết bị và upload lên server
   */
  const handlePickImages = async () => {
    if (images.length >= MAX_IMAGES) {
      showToast(`Tối đa ${MAX_IMAGES} ảnh`, "warning");
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      showToast("Ứng dụng cần quyền truy cập thư viện ảnh để tiếp tục", "warning");
      return;
    }

    const remaining = MAX_IMAGES - images.length;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      quality: 0.7,
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

      const uploadedUrls: string[] = response.data?.data?.urls || response.data?.urls || [];

      if (uploadedUrls.length > 0) {
        setImages((prev) => [...prev, ...uploadedUrls].slice(0, MAX_IMAGES));
        showToast(`Đã thêm ${uploadedUrls.length} ảnh`, "success");
      } else {
        showToast("Không thể tải ảnh lên, vui lòng thử lại", "error");
      }
    } catch (error: any) {
      showToast(error?.response?.data?.message || "Lỗi khi tải ảnh lên", "error");
    } finally {
      setUploadingImages(false);
    }
  };

  /**
   * Chọn video từ thư viện thiết bị và upload lên server
   */
  const handlePickVideo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      showToast("Ứng dụng cần quyền truy cập thư viện để tiếp tục", "warning");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["videos"],
      allowsMultipleSelection: false,
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.length) return;

    setUploadingVideo(true);
    try {
      const asset = result.assets[0];
      const filename = asset.uri.split("/").pop() || "video.mp4";
      const ext = filename.split(".").pop()?.toLowerCase() || "mp4";
      const mimeType = `video/${ext}`;

      const formData = new FormData();
      formData.append("video", {
        uri: asset.uri,
        name: filename,
        type: mimeType,
      } as any);

      const response = await api.post("/upload/video", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const uploadedUrl: string = response.data?.url || response.data?.urls?.[0];

      if (uploadedUrl) {
        setVideoUrl(uploadedUrl);
        showToast("Tải lên video thành công", "success");
      } else {
        showToast("Không thể tải video lên, vui lòng thử lại", "error");
      }
    } catch (error: any) {
      showToast(error?.response?.data?.message || "Lỗi khi tải video lên (Tối đa 20MB)", "error");
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveVideo = () => {
    setVideoUrl(null);
  };

  const handleSubmit = async () => {
    if (!user || !orderId) return;

    if (!selectedReason) {
      Alert.alert("Thiếu thông tin", "Vui lòng chọn lý do trả hàng.");
      return;
    }

    if (!problem.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng mô tả chi tiết vấn đề của đơn hàng.");
      return;
    }

    if (images.length === 0) {
      Alert.alert("Thiếu bằng chứng", "Bắt buộc chụp ít nhất 1 ảnh làm bằng chứng trả hàng.");
      return;
    }

    if (!videoUrl) {
      Alert.alert("Thiếu bằng chứng", "Bắt buộc quay video mở hộp/chi tiết đơn hàng làm bằng chứng.");
      return;
    }

    setLoading(true);
    try {
      await requestOrderReturn(orderId, user._id, {
        reason: selectedReason,
        problem: problem.trim(),
        images,
        videos: [videoUrl],
      });
      showToast("Gửi yêu cầu trả hàng thành công!", "success");
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Gửi yêu cầu thất bại";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-zinc-50 dark:bg-zinc-950">
      <Stack.Screen options={{ headerShown: false }} />
      <Header title="Trả hàng / Hoàn tiền" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      >
        {/* Hướng dẫn */}
        <Box className="bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-3xl border border-yellow-100 dark:border-yellow-900/20 mb-6 flex-row items-start space-x-3 gap-2">
          <Icon as={AlertCircle} className="text-yellow-600 w-5 h-5 mt-0.5" />
          <Text className="flex-1 text-xs text-yellow-800 dark:text-yellow-400 leading-relaxed font-medium">
            Theo quy định, yêu cầu trả hàng cần cung cấp đầy đủ thông tin mô tả cùng hình ảnh & video thực tế khi khui hàng làm bằng chứng đối chiếu.
          </Text>
        </Box>

        {/* Lý do trả hàng */}
        <VStack className="mb-5">
          <Text className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-3 ml-1">
            Chọn lý do trả hàng <Text className="text-red-500">*</Text>
          </Text>
          <VStack className="space-y-2 gap-2">
            {RETURN_REASONS.map((reason) => {
              const isSelected = selectedReason === reason;
              return (
                <TouchableOpacity
                  key={reason}
                  onPress={() => setSelectedReason(reason)}
                  className={`p-4 rounded-2xl border-2 flex-row justify-between items-center ${
                    isSelected
                      ? "border-yellow-500 bg-yellow-50/50 dark:bg-yellow-900/10"
                      : "border-zinc-100 bg-white dark:bg-zinc-900 dark:border-zinc-800"
                  }`}
                >
                  <Text className={`text-sm ${isSelected ? "font-bold text-yellow-700 dark:text-yellow-500" : "text-zinc-600 dark:text-zinc-400"}`}>
                    {reason}
                  </Text>
                  {isSelected && (
                    <Box className="w-4 h-4 rounded-full bg-yellow-500 items-center justify-center">
                      <Box className="w-2 h-2 rounded-full bg-white" />
                    </Box>
                  )}
                </TouchableOpacity>
              );
            })}
          </VStack>
        </VStack>

        {/* Mô tả chi tiết vấn đề */}
        <VStack className="mb-6">
          <Text className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2 ml-1">
            Mô tả chi tiết vấn đề <Text className="text-red-500">*</Text>
          </Text>
          <Input
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm"
            style={{ height: 120 }}
          >
            <InputField
              value={problem}
              onChangeText={setProblem}
              placeholder="Vui lòng cung cấp thêm chi tiết về lỗi sản phẩm, giao sai sản phẩm thế nào..."
              maxLength={1000}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              className="text-sm text-zinc-900 dark:text-white p-4"
              style={{ height: 110 }}
            />
          </Input>
        </VStack>

        {/* Hình ảnh chứng cứ */}
        <VStack className="mb-6">
          <Text className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-3 ml-1">
            Hình ảnh sản phẩm nhận được ({images.length}/{MAX_IMAGES}) <Text className="text-red-500">*</Text>
          </Text>
          <HStack className="gap-3 flex-wrap">
            {images.map((img, idx) => (
              <Box key={idx} className="relative" style={{ width: 80, height: 80 }}>
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

            {images.length < MAX_IMAGES && (
              <TouchableOpacity
                onPress={handlePickImages}
                disabled={uploadingImages}
                style={styles.mediaBtn}
              >
                {uploadingImages ? (
                  <ActivityIndicator color="#eab308" size="small" />
                ) : (
                  <>
                    <Icon as={Camera} className="text-yellow-600 w-6 h-6" />
                    <Text style={styles.mediaText}>Chụp ảnh</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </HStack>
        </VStack>

        {/* Video chứng cứ */}
        <VStack className="mb-8">
          <Text className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-3 ml-1">
            Video khui hàng / kiểm tra lỗi (1 video) <Text className="text-red-500">*</Text>
          </Text>
          <HStack className="gap-3">
            {videoUrl ? (
              <Box className="relative bg-zinc-200 dark:bg-zinc-800 rounded-2xl items-center justify-center p-3" style={{ width: 120, height: 80 }}>
                <Icon as={Video} className="text-zinc-500 w-8 h-8 mb-1" />
                <Text className="text-[10px] text-zinc-600 dark:text-zinc-400 font-bold">Video đã chọn</Text>
                <TouchableOpacity
                  onPress={handleRemoveVideo}
                  style={styles.removeBtn}
                >
                  <Icon as={X} className="text-white w-3 h-3" />
                </TouchableOpacity>
              </Box>
            ) : (
              <TouchableOpacity
                onPress={handlePickVideo}
                disabled={uploadingVideo}
                style={[styles.mediaBtn, { width: 120 }]}
              >
                {uploadingVideo ? (
                  <ActivityIndicator color="#eab308" size="small" />
                ) : (
                  <>
                    <Icon as={Video} className="text-yellow-600 w-6 h-6" />
                    <Text style={styles.mediaText}>Quay video đơn hàng</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </HStack>
        </VStack>

        {/* Nút gửi */}
        <Button
          onPress={handleSubmit}
          disabled={loading || uploadingImages || uploadingVideo}
          className="w-full h-14 bg-red-500 rounded-2xl active:bg-red-600 shadow-sm"
        >
          <ButtonText className="text-white font-extrabold text-base">
            {loading ? "Đang xử lý..." : "YÊU CẦU TRẢ HÀNG"}
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
  mediaBtn: {
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
  mediaText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#d97706",
    textAlign: "center",
  },
});

export default ReturnOrderScreen;
