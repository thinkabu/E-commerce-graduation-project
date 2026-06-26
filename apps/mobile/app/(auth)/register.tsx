import React, { useState, useEffect } from "react";
import {
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack } from "expo-router";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { Button, ButtonText } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Pressable } from "@/components/ui/pressable";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Zap,
  ArrowLeft,
  CheckCircle2,
  Smartphone,
} from "lucide-react-native";
import api from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import Toast from "@/components/Toast";

export default function RegisterScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Inline field errors
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    phone?: string;
    password?: string;
    general?: string;
  }>({});

  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "warning">("error");



  const showToast = (message: string, type: "success" | "error" | "warning" = "error") => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const clearError = (field: keyof typeof errors) => {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };



  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!fullName.trim()) {
      newErrors.fullName = "Vui lòng nhập họ và tên";
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = "Họ tên phải có ít nhất 2 ký tự";
    }

    if (!email.trim()) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Email không hợp lệ";
    }

    if (phone && !/^(0|\+84)\d{9,10}$/.test(phone.trim())) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    if (!password) {
      newErrors.password = "Vui lòng nhập mật khẩu";
    } else if (password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      await api.post("/auth/register", {
        fullName,
        email,
        password,
        phone,
      });

      showToast("Đăng ký tài khoản thành công!", "success");
      setTimeout(() => router.replace("/login"), 1000);
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        "Đăng ký thất bại. Vui lòng kiểm tra lại kết nối API.";
      // Nếu lỗi liên quan email → hiển thị inline, còn lại dùng toast
      if (
        message.toLowerCase().includes("email") ||
        message.toLowerCase().includes("tồn tại") ||
        message.toLowerCase().includes("exists")
      ) {
        setErrors((prev) => ({ ...prev, email: message }));
      } else {
        showToast(message, "error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-zinc-950">
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <Box className="flex-1 px-8 pt-8 pb-8">
            {/* --- BACK BUTTON --- */}
            <Pressable
              onPress={() => router.back()}
              className="w-12 h-12 rounded-full border border-zinc-100 dark:border-zinc-800 items-center justify-center mb-8 bg-zinc-50 dark:bg-zinc-900"
            >
              <Icon as={ArrowLeft} className="text-zinc-900 dark:text-white" />
            </Pressable>

            {/* --- HEADER --- */}
            <VStack className="mb-10 space-y-2">
              <Box className="w-16 h-16 bg-yellow-500 rounded-3xl items-center justify-center mb-6 shadow-xl shadow-yellow-500/50">
                <Icon as={Zap} className="text-zinc-900 w-8 h-8" />
              </Box>
              <Text className="text-4xl font-black text-zinc-900 dark:text-white leading-tight uppercase italic tracking-tighter">
                Think <Text className="text-yellow-500">hearT</Text>
              </Text>
              <Text className="text-zinc-500 dark:text-zinc-400 text-lg font-medium">
                Gia nhập cộng đồng công nghệ ngay!
              </Text>
            </VStack>

            {/* --- FORM --- */}
            <VStack className="space-y-5 gap-5">
              {/* Họ và tên */}
              <VStack className="space-y-1 gap-1">
                <Text className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-1">
                  Họ và tên
                </Text>
                <Input
                  className={`h-16 rounded-2xl bg-zinc-50 dark:bg-zinc-900 px-2 ${
                    errors.fullName
                      ? "border-red-400 dark:border-red-400"
                      : "border-zinc-100 dark:border-zinc-800"
                  }`}
                >
                  <InputSlot className="pl-4">
                    <InputIcon as={User} className="text-zinc-400" />
                  </InputSlot>
                  <InputField
                    placeholder="Nguyễn Văn A"
                    value={fullName}
                    onChangeText={(t) => {
                      setFullName(t);
                      clearError("fullName");
                    }}
                    className="text-zinc-900 dark:text-white font-bold"
                  />
                </Input>
                {errors.fullName ? (
                  <Text className="text-red-500 text-xs font-semibold ml-1">
                    {errors.fullName}
                  </Text>
                ) : null}
              </VStack>

              {/* Số điện thoại */}
              <VStack className="space-y-1 gap-1">
                <Text className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-1">
                  Số điện thoại
                </Text>
                <Input
                  className={`h-16 rounded-2xl bg-zinc-50 dark:bg-zinc-900 px-2 ${
                    errors.phone
                      ? "border-red-400 dark:border-red-400"
                      : "border-zinc-100 dark:border-zinc-800"
                  }`}
                >
                  <InputSlot className="pl-4">
                    <InputIcon as={Smartphone} className="text-zinc-400" />
                  </InputSlot>
                  <InputField
                    placeholder="0901234567"
                    value={phone}
                    onChangeText={(t) => {
                      setPhone(t);
                      clearError("phone");
                    }}
                    keyboardType="phone-pad"
                    className="text-zinc-900 dark:text-white font-bold"
                  />
                </Input>
                {errors.phone ? (
                  <Text className="text-red-500 text-xs font-semibold ml-1">
                    {errors.phone}
                  </Text>
                ) : null}
              </VStack>

              {/* Email */}
              <VStack className="space-y-1 gap-1">
                <Text className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-1">
                  Email
                </Text>
                <Input
                  className={`h-16 rounded-2xl bg-zinc-50 dark:bg-zinc-900 px-2 ${
                    errors.email
                      ? "border-red-400 dark:border-red-400"
                      : "border-zinc-100 dark:border-zinc-800"
                  }`}
                >
                  <InputSlot className="pl-4">
                    <InputIcon as={Mail} className="text-zinc-400" />
                  </InputSlot>
                  <InputField
                    placeholder="customer@gmail.com"
                    value={email}
                    onChangeText={(t) => {
                      setEmail(t);
                      clearError("email");
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    className="text-zinc-900 dark:text-white font-bold"
                  />
                </Input>
                {errors.email ? (
                  <Text className="text-red-500 text-xs font-semibold ml-1">
                    {errors.email}
                  </Text>
                ) : null}
              </VStack>

              {/* Mật khẩu */}
              <VStack className="space-y-1 gap-1">
                <Text className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-1">
                  Mật khẩu
                </Text>
                <Input
                  className={`h-16 rounded-2xl bg-zinc-50 dark:bg-zinc-900 px-2 ${
                    errors.password
                      ? "border-red-400 dark:border-red-400"
                      : "border-zinc-100 dark:border-zinc-800"
                  }`}
                >
                  <InputSlot className="pl-4">
                    <InputIcon as={Lock} className="text-zinc-400" />
                  </InputSlot>
                  <InputField
                    placeholder="••••••••"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={(t) => {
                      setPassword(t);
                      clearError("password");
                    }}
                    className="text-zinc-900 dark:text-white font-bold"
                  />
                  <InputSlot
                    className="pr-4"
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <InputIcon
                      as={showPassword ? EyeOff : Eye}
                      className="text-zinc-400"
                    />
                  </InputSlot>
                </Input>
                {errors.password ? (
                  <Text className="text-red-500 text-xs font-semibold ml-1">
                    {errors.password}
                  </Text>
                ) : null}
              </VStack>

              <HStack className="items-center space-x-2 gap-2 px-1">
                <Icon as={CheckCircle2} className="text-yellow-600 w-5 h-5" />
                <Text className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                  Tôi đồng ý với{" "}
                  <Text className="text-zinc-900 dark:text-white font-bold">
                    Điều khoản & Chính sách
                  </Text>
                </Text>
              </HStack>

              <Button
                onPress={handleRegister}
                disabled={isLoading}
                className="bg-zinc-900 dark:bg-yellow-500 h-16 rounded-2xl shadow-xl mt-2 active:opacity-90 disabled:opacity-50"
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <ButtonText className="text-white dark:text-zinc-900 font-black text-lg uppercase tracking-wider">
                    Đăng ký ngay
                  </ButtonText>
                )}
              </Button>


            </VStack>

            {/* --- FOOTER --- */}
            <HStack className="justify-center items-center mt-10 pb-4">
              <Text className="text-zinc-500 dark:text-zinc-400 font-medium">
                Bạn đã có tài khoản?{" "}
              </Text>
              <Pressable onPress={() => router.push("/login" as any)}>
                <Text className="text-yellow-600 font-black">
                  Đăng nhập ngay
                </Text>
              </Pressable>
            </HStack>
          </Box>
        </ScrollView>
      </KeyboardAvoidingView>

      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={() => setToastVisible(false)}
      />
    </SafeAreaView>
  );
}


