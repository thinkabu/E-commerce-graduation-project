import React, { useState } from "react";
import {
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { useRouter, Stack } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { updateProfile } from "@/services/user.service";
import api from "@/services/api";
import Header from "@/components/Header";
import AvatarInitials from "@/components/AvatarInitials";
import Toast from "@/components/Toast";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { Button, ButtonText } from "@/components/ui/button";
import { User, Phone, Mail, Camera } from "lucide-react-native";

const EditProfileScreen = () => {
  const router = useRouter();
  const { user, updateUser } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "warning">("error");

  const showToast = (msg: string, type: "success" | "error" | "warning" = "error") => {
    setToastMessage(msg);
    setToastType(type);
    setToastVisible(true);
  };

  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      showToast("Cần quyền truy cập thư viện ảnh", "warning");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.length) return;

    setUploadingAvatar(true);
    try {
      const asset = result.assets[0];
      const filename = asset.uri.split("/").pop() || "avatar.jpg";
      const ext = filename.split(".").pop()?.toLowerCase() || "jpg";
      const mimeType = ext === "png" ? "image/png" : "image/jpeg";

      const formData = new FormData();
      formData.append("images", {
        uri: asset.uri,
        name: filename,
        type: mimeType,
      } as any);

      const response = await api.post("/upload/images", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const uploadedUrls: string[] =
        response.data?.data?.urls ||
        response.data?.urls ||
        [];

      if (uploadedUrls[0]) {
        setAvatar(uploadedUrls[0]);
        showToast("Ảnh đại diện đã được cập nhật", "success");
      } else {
        showToast("Không thể tải ảnh lên, vui lòng thử lại", "error");
      }
    } catch (error: any) {
      showToast(
        error?.response?.data?.message || "Lỗi khi tải ảnh lên",
        "error"
      );
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    if (!fullName.trim() || !phone.trim()) {
      showToast("Vui lòng nhập đầy đủ họ tên và số điện thoại", "warning");
      return;
    }

    setLoading(true);
    try {
      const updatedUser = await updateProfile(user!._id, {
        fullName,
        phone,
        avatar,
      });
      await updateUser(updatedUser);
      showToast("Cập nhật thông tin thành công", "success");
      setTimeout(() => router.back(), 1000);
    } catch (error: any) {
      showToast(error?.response?.data?.message || "Cập nhật thất bại", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-zinc-50 dark:bg-zinc-950">
      <Stack.Screen options={{ headerShown: false }} />
      <Header title="Chỉnh sửa hồ sơ" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      >
        <VStack className="space-y-6 gap-6">
          {/* Avatar Picker */}
          <Box className="items-center mb-2">
            <TouchableOpacity
              onPress={handlePickAvatar}
              disabled={uploadingAvatar}
              style={styles.avatarWrapper}
              activeOpacity={0.8}
            >
              <AvatarInitials
                name={fullName || user?.fullName || ""}
                avatarUrl={avatar}
                size={96}
                borderWidth={3}
                borderColor="#facc15"
              />
              <Box style={styles.cameraOverlay}>
                {uploadingAvatar ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Camera size={18} color="#fff" />
                )}
              </Box>
            </TouchableOpacity>
            <Text className="text-xs text-zinc-400 font-medium mt-2">
              Nhấn để thay ảnh đại diện
            </Text>
          </Box>

          {/* Email (disabled) */}
          <Box>
            <Text className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2 ml-1">
              Email (Không thể thay đổi)
            </Text>
            <Input
              className="h-14 bg-zinc-100 dark:bg-zinc-900 border-0 rounded-2xl opacity-60 pointer-events-none"
              isDisabled={true}
            >
              <InputSlot className="pl-4 pr-2">
                <InputIcon as={Mail} className="text-zinc-500 w-5 h-5" />
              </InputSlot>
              <InputField
                value={user?.email || ""}
                className="text-base text-zinc-900 dark:text-white"
                editable={false}
              />
            </Input>
          </Box>

          {/* Họ và tên */}
          <Box>
            <Text className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2 ml-1">
              Họ và tên
            </Text>
            <Input className="h-14 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm focus:border-yellow-400">
              <InputSlot className="pl-4 pr-2">
                <InputIcon as={User} className="text-zinc-500 w-5 h-5" />
              </InputSlot>
              <InputField
                value={fullName}
                onChangeText={setFullName}
                placeholder="Nhập họ và tên"
                className="text-base text-zinc-900 dark:text-white"
              />
            </Input>
          </Box>

          {/* Số điện thoại */}
          <Box>
            <Text className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2 ml-1">
              Số điện thoại
            </Text>
            <Input className="h-14 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm focus:border-yellow-400">
              <InputSlot className="pl-4 pr-2">
                <InputIcon as={Phone} className="text-zinc-500 w-5 h-5" />
              </InputSlot>
              <InputField
                value={phone}
                onChangeText={setPhone}
                placeholder="Nhập số điện thoại"
                keyboardType="phone-pad"
                className="text-base text-zinc-900 dark:text-white"
              />
            </Input>
          </Box>

          <Button
            onPress={handleSave}
            disabled={loading}
            className="w-full h-14 bg-yellow-400 rounded-2xl active:bg-yellow-500 mt-4 shadow-sm"
          >
            <ButtonText className="text-zinc-900 font-bold text-base">
              {loading ? "Đang lưu..." : "Lưu thay đổi"}
            </ButtonText>
          </Button>
        </VStack>
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
  avatarWrapper: {
    position: "relative",
    width: 96,
    height: 96,
  },
  cameraOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#18181b",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
});

export default EditProfileScreen;
