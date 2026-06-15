import React, { useState } from "react";
import { SafeAreaView, ScrollView, Alert } from "react-native";
import { useRouter, Stack } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { changePassword } from "@/services/user.service";
import Header from "@/components/Header";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { Button, ButtonText } from "@/components/ui/button";
import { Pressable } from "@/components/ui/pressable";
import { Lock, Eye, EyeOff, ShieldCheck } from "lucide-react-native";

const ChangePasswordScreen = () => {
  const router = useRouter();
  const { user } = useAuth();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Lỗi", "Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    setLoading(true);
    try {
      await changePassword(user!._id, { oldPassword, newPassword });
      Alert.alert(
        "Thành công",
        "Đổi mật khẩu thành công. Vui lòng đăng nhập lại.",
        [{ text: "OK", onPress: () => router.replace("/login" as any) }],
      );
    } catch (error: any) {
      Alert.alert(
        "Lỗi",
        error?.response?.data?.message || "Đổi mật khẩu thất bại",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-zinc-50 dark:bg-zinc-950">
      <Stack.Screen options={{ headerShown: false }} />
      <Header title="Đổi mật khẩu" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20 }}
      >
        <VStack className="items-center mb-8 mt-4">
          <Box className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/20 rounded-full items-center justify-center mb-4">
            <Icon as={ShieldCheck} className="text-yellow-600 w-10 h-10" />
          </Box>
          <Text className="text-center text-zinc-500 text-sm px-4">
            Đổi mật khẩu thường xuyên giúp bảo vệ tài khoản của bạn an toàn hơn.
          </Text>
        </VStack>

        <VStack className="space-y-5 gap-5">
          {/* Old Password */}
          <Box>
            <Text className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2 ml-1">
              Mật khẩu hiện tại
            </Text>
            <Input className="h-14 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm focus:border-yellow-400">
              <InputSlot className="pl-4 pr-2">
                <InputIcon as={Lock} className="text-zinc-500 w-5 h-5" />
              </InputSlot>
              <InputField
                value={oldPassword}
                onChangeText={setOldPassword}
                placeholder="Nhập mật khẩu hiện tại"
                secureTextEntry={!showOld}
                className="text-base text-zinc-900 dark:text-white"
              />
              <InputSlot className="pr-4" onPress={() => setShowOld(!showOld)}>
                <InputIcon
                  as={showOld ? EyeOff : Eye}
                  className="text-zinc-400 w-5 h-5"
                />
              </InputSlot>
            </Input>
          </Box>

          {/* New Password */}
          <Box>
            <Text className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2 ml-1">
              Mật khẩu mới
            </Text>
            <Input className="h-14 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm focus:border-yellow-400">
              <InputSlot className="pl-4 pr-2">
                <InputIcon as={Lock} className="text-zinc-500 w-5 h-5" />
              </InputSlot>
              <InputField
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Nhập mật khẩu mới"
                secureTextEntry={!showNew}
                className="text-base text-zinc-900 dark:text-white"
              />
              <InputSlot className="pr-4" onPress={() => setShowNew(!showNew)}>
                <InputIcon
                  as={showNew ? EyeOff : Eye}
                  className="text-zinc-400 w-5 h-5"
                />
              </InputSlot>
            </Input>
          </Box>

          {/* Confirm Password */}
          <Box>
            <Text className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2 ml-1">
              Xác nhận mật khẩu mới
            </Text>
            <Input className="h-14 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm focus:border-yellow-400">
              <InputSlot className="pl-4 pr-2">
                <InputIcon as={Lock} className="text-zinc-500 w-5 h-5" />
              </InputSlot>
              <InputField
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Nhập lại mật khẩu mới"
                secureTextEntry={!showConfirm}
                className="text-base text-zinc-900 dark:text-white"
              />
              <InputSlot
                className="pr-4"
                onPress={() => setShowConfirm(!showConfirm)}
              >
                <InputIcon
                  as={showConfirm ? EyeOff : Eye}
                  className="text-zinc-400 w-5 h-5"
                />
              </InputSlot>
            </Input>
          </Box>

          <Button
            onPress={handleSave}
            disabled={loading}
            className="w-full h-14 bg-yellow-400 rounded-2xl active:bg-yellow-500 mt-6 shadow-sm"
          >
            <ButtonText className="text-zinc-900 font-bold text-base">
              {loading ? "Đang xử lý..." : "Xác nhận đổi"}
            </ButtonText>
          </Button>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
};

// Workaround for Gluestack icon import issue in standard React Native
import { Icon } from "@/components/ui/icon";

export default ChangePasswordScreen;
