import React, { useState, useEffect } from "react";
import {
  ScrollView,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { Button, ButtonText, ButtonIcon } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Pressable } from "@/components/ui/pressable";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Globe,
  Code,
  Smartphone,
  Fingerprint,
  ScanFace,
  ShieldCheck,
  X,
  Trash2,
} from "lucide-react-native";
import api from "@/services/api";
import { Alert, Image } from "react-native";

export default function LoginScreen() {
  const router = useRouter();
  const {
    login,
    biometricAvailable,
    biometricType,
    shouldShowBiometricPrompt,
    handleBiometricPromptResponse,
    savedAccounts,
    deleteSavedAccount,
    loginWithBiometricForAccount,
  } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);
  const [showBiometricModal, setShowBiometricModal] = useState(false);

  // Chọn tài khoản đã lưu
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [isNewAccountMode, setIsNewAccountMode] = useState(false);

  // Hiển thị modal kích hoạt sinh trắc sau khi đăng nhập
  useEffect(() => {
    if (shouldShowBiometricPrompt) {
      setShowBiometricModal(true);
    }
  }, [shouldShowBiometricPrompt]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin");
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post("/auth/login", { email, password });
      const { access_token, user } = response.data.data;

      const shouldPrompt = await login(access_token, user);
      if (!shouldPrompt) {
        router.replace("/home");
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "Đăng nhập thất bại";
      Alert.alert("Lỗi", message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAccount = async (account: any) => {
    setSelectedAccount(account);
    setPassword("");
    if (account.biometricEnabled && biometricAvailable) {
      // Tự động kích hoạt quét Face ID khi chọn tài khoản
      await handleQuickBiometricLogin(account.id);
    }
  };

  const handleQuickBiometricLogin = async (id: string) => {
    setIsBiometricLoading(true);
    try {
      const success = await loginWithBiometricForAccount(id);
      if (success) {
        router.replace("/home");
      } else {
        Alert.alert(
          "Không thể xác thực",
          `Xác thực ${biometricType} thất bại. Vui lòng đăng nhập bằng mật khẩu.`
        );
        // Tự động lấy tài khoản làm selectedAccount để nhập mật mã
        const account = savedAccounts.find((a) => a.id === id);
        if (account) {
          setSelectedAccount(account);
          setPassword("");
        }
      }
    } catch (error) {
      Alert.alert("Lỗi", `Đã xảy ra lỗi khi xác thực ${biometricType}.`);
    } finally {
      setIsBiometricLoading(false);
    }
  };

  const handleBiometricLoginForSelectedAccount = async () => {
    if (!selectedAccount) return;
    await handleQuickBiometricLogin(selectedAccount.id);
  };

  const handleLoginWithPasswordForSelectedAccount = async () => {
    if (!selectedAccount) return;
    if (!password) {
      Alert.alert("Lỗi", "Vui lòng nhập mật khẩu");
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post("/auth/login", {
        email: selectedAccount.email,
        password,
      });
      const { access_token, user } = response.data.data;

      const shouldPrompt = await login(access_token, user);
      if (!shouldPrompt) {
        router.replace("/home");
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "Đăng nhập thất bại";
      Alert.alert("Lỗi", message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async (id: string) => {
    Alert.alert(
      "Xác nhận xóa",
      "Bạn có chắc muốn xóa tài khoản này khỏi danh sách đã lưu không? (Dữ liệu Face ID/Vân tay liên quan cũng sẽ bị xóa)",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: () => {
            setTimeout(async () => {
              await deleteSavedAccount(id);
              if (selectedAccount?.id === id) {
                setSelectedAccount(null);
              }
            }, 100);
          },
        },
      ]
    );
  };

  const handleBiometricPromptAccept = async () => {
    setShowBiometricModal(false);
    await handleBiometricPromptResponse(true);
    router.replace("/home");
  };

  const handleBiometricPromptDecline = async () => {
    setShowBiometricModal(false);
    await handleBiometricPromptResponse(false);
    router.replace("/home");
  };

  // Icon cho sinh trắc
  const BiometricIcon =
    biometricType === "Face ID" ? ScanFace : Fingerprint;

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
            {/* --- HEADER --- */}
            <VStack className="mb-12 space-y-2">
              <Box className="w-16 h-16 bg-yellow-500 rounded-3xl items-center justify-center mb-6 shadow-xl shadow-yellow-500/50">
                <Icon as={Smartphone} className="text-zinc-900 w-8 h-8" />
              </Box>
              <Text className="text-4xl font-black text-zinc-900 dark:text-white leading-tight uppercase italic tracking-tighter">
                Think <Text className="text-yellow-500">hearT</Text>
              </Text>
              <Text className="text-zinc-500 dark:text-zinc-400 text-lg font-medium">
                Thế giới công nghệ trong tầm tay bạn
              </Text>
            </VStack>

            {/* --- CORE CONTENT --- */}
            {savedAccounts.length > 0 && !isNewAccountMode ? (
              selectedAccount ? (
                // --- NHẬP MẬT KHẨU TÀI KHOẢN ĐÃ CHỌN ---
                <VStack className="space-y-6 gap-6">
                  <VStack className="items-center mb-4 space-y-2">
                    <Image
                      source={{
                        uri:
                          selectedAccount.avatar ||
                          "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200&auto=format&fit=crop",
                      }}
                      className="w-20 h-20 rounded-full border-2 border-yellow-500 mb-2"
                    />
                    <Text className="text-xl font-bold text-zinc-900 dark:text-white">
                      {selectedAccount.name}
                    </Text>
                    <Text className="text-sm text-zinc-500 dark:text-zinc-400">
                      {selectedAccount.email}
                    </Text>
                  </VStack>

                  <VStack className="space-y-2 gap-2">
                    <Text className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-1">
                      Mật khẩu
                    </Text>
                    <Input className="h-16 rounded-2xl border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-2">
                      <InputSlot className="pl-4">
                        <InputIcon as={Lock} className="text-zinc-400" />
                      </InputSlot>
                      <InputField
                        placeholder="••••••••"
                        secureTextEntry={!showPassword}
                        value={password}
                        onChangeText={setPassword}
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
                  </VStack>

                  <VStack className="space-y-3 gap-3">
                    <Button
                      onPress={handleLoginWithPasswordForSelectedAccount}
                      disabled={isLoading}
                      className="bg-zinc-900 dark:bg-yellow-500 h-16 rounded-2xl active:opacity-90 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <ActivityIndicator color="white" />
                      ) : (
                        <ButtonText className="text-white dark:text-zinc-900 font-bold uppercase tracking-wider">
                          Đăng nhập
                        </ButtonText>
                      )}
                    </Button>

                    {selectedAccount.biometricEnabled && biometricAvailable && (
                      <Button
                        onPress={handleBiometricLoginForSelectedAccount}
                        disabled={isBiometricLoading}
                        className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-zinc-900 dark:to-zinc-800 border border-yellow-400/50 h-16 rounded-2xl active:opacity-90"
                      >
                        <HStack className="items-center space-x-2 gap-2">
                          {isBiometricLoading ? (
                            <ActivityIndicator color="#eab308" />
                          ) : (
                            <>
                              <Icon
                                as={BiometricIcon}
                                className="text-yellow-600 dark:text-yellow-400 w-5 h-5"
                              />
                              <ButtonText className="text-zinc-900 dark:text-yellow-400 font-bold uppercase tracking-wider">
                                Xác thực {biometricType}
                              </ButtonText>
                            </>
                          )}
                        </HStack>
                      </Button>
                    )}

                    <Pressable
                      onPress={() => {
                        setSelectedAccount(null);
                        setPassword("");
                      }}
                      className="items-center py-2 active:opacity-75"
                    >
                      <Text className="text-zinc-500 dark:text-zinc-400 font-bold text-sm underline">
                        Quay lại danh sách
                      </Text>
                    </Pressable>
                  </VStack>
                </VStack>
              ) : (
                // --- DANH SÁCH TÀI KHOẢN ĐÃ LƯU ---
                <VStack className="space-y-4 gap-4">
                  <Text className="text-lg font-bold text-zinc-900 dark:text-white mb-2 ml-1">
                    Tài khoản đã đăng nhập
                  </Text>

                  {savedAccounts.map((account) => (
                    <HStack
                      key={account.id}
                      className="items-center justify-between bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-4 active:bg-zinc-100 dark:active:bg-zinc-800"
                    >
                      <Pressable
                        onPress={() => handleSelectAccount(account)}
                        className="flex-1 flex-row items-center space-x-4 gap-4"
                      >
                        <Image
                          source={{
                            uri:
                              account.avatar ||
                              "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200&auto=format&fit=crop",
                          }}
                          className="w-12 h-12 rounded-full border border-zinc-200 dark:border-zinc-700"
                        />
                        <VStack className="flex-1">
                          <Text className="text-base font-bold text-zinc-900 dark:text-white">
                            {account.name}
                          </Text>
                          <Text className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                            {account.email}
                          </Text>
                        </VStack>
                      </Pressable>

                      <HStack className="items-center space-x-2 gap-2">
                        {account.biometricEnabled && biometricAvailable && (
                          <Pressable
                            onPress={() => handleQuickBiometricLogin(account.id)}
                            disabled={isBiometricLoading}
                            className="p-3 bg-yellow-500/10 dark:bg-yellow-500/20 rounded-2xl active:opacity-75"
                          >
                            <Icon
                              as={BiometricIcon}
                              className="text-yellow-600 dark:text-yellow-400 w-5 h-5"
                            />
                          </Pressable>
                        )}
                        <Pressable
                          onPress={() => handleDeleteAccount(account.id)}
                          className="p-3 bg-red-500/10 dark:bg-red-500/20 rounded-2xl active:opacity-75"
                        >
                          <Icon as={Trash2} className="text-red-500 w-5 h-5" />
                        </Pressable>
                      </HStack>
                    </HStack>
                  ))}

                  <Button
                    variant="outline"
                    onPress={() => setIsNewAccountMode(true)}
                    className="border-2 border-zinc-900 dark:border-zinc-100 h-16 rounded-2xl active:opacity-90 mt-4"
                  >
                    <ButtonText className="text-zinc-900 dark:text-zinc-100 font-bold uppercase tracking-wider">
                      Sử dụng tài khoản khác
                    </ButtonText>
                  </Button>
                </VStack>
              )
            ) : (
              // --- FORM ĐĂNG NHẬP THÔNG THƯỜNG ---
              <VStack className="space-y-6 gap-6">
                <VStack className="space-y-2 gap-2">
                  <Text className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-1">
                    Email
                  </Text>
                  <Input className="h-16 rounded-2xl border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-2">
                    <InputSlot className="pl-4">
                      <InputIcon as={Mail} className="text-zinc-400" />
                    </InputSlot>
                    <InputField
                      placeholder="admin@thinkheart.com"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      className="text-zinc-900 dark:text-white font-bold"
                    />
                  </Input>
                </VStack>

                <VStack className="space-y-2 gap-2">
                  <HStack className="justify-between items-center px-1">
                    <Text className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                      Mật khẩu
                    </Text>
                    <Pressable>
                      <Text className="text-sm font-bold text-yellow-600">
                        Quên mật khẩu?
                      </Text>
                    </Pressable>
                  </HStack>
                  <Input className="h-16 rounded-2xl border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-2">
                    <InputSlot className="pl-4">
                      <InputIcon as={Lock} className="text-zinc-400" />
                    </InputSlot>
                    <InputField
                      placeholder="••••••••"
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={setPassword}
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
                </VStack>

                <Button
                  onPress={handleLogin}
                  disabled={isLoading}
                  className="bg-zinc-900 dark:bg-yellow-500 h-16 rounded-2xl shadow-xl shadow-zinc-900/20 mt-4 active:opacity-90 disabled:opacity-50"
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <>
                      <ButtonText className="text-white dark:text-zinc-900 font-black text-lg uppercase tracking-wider">
                        Đăng nhập
                      </ButtonText>
                      <ButtonIcon
                        as={ArrowRight}
                        className="text-white dark:text-zinc-900 ml-2"
                      />
                    </>
                  )}
                </Button>

                {savedAccounts.length > 0 && (
                  <Button
                    variant="outline"
                    onPress={() => setIsNewAccountMode(false)}
                    className="border-2 border-zinc-900 dark:border-zinc-100 h-16 rounded-2xl active:opacity-90"
                  >
                    <ButtonText className="text-zinc-900 dark:text-zinc-100 font-bold uppercase tracking-wider">
                      Xem tài khoản đã lưu
                    </ButtonText>
                  </Button>
                )}
              </VStack>
            )}

            {/* --- DIVIDER --- */}
            <HStack className="items-center my-10 space-x-4 gap-4">
              <Box className="flex-1 h-[1px] bg-zinc-100 dark:bg-zinc-800" />
              <Text className="text-zinc-400 text-xs font-bold uppercase tracking-widest">
                Hoặc đăng nhập bằng
              </Text>
              <Box className="flex-1 h-[1px] bg-zinc-100 dark:bg-zinc-800" />
            </HStack>

            {/* --- SOCIAL LOGIN --- */}
            <HStack className="space-x-4 gap-4 mb-12">
              <Pressable className="flex-1 h-16 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 items-center justify-center active:bg-zinc-50 dark:active:bg-zinc-800 shadow-sm">
                <Icon
                  as={Globe}
                  className="text-zinc-700 dark:text-zinc-300 w-6 h-6"
                />
              </Pressable>
              <Pressable className="flex-1 h-16 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 items-center justify-center active:bg-zinc-50 dark:active:bg-zinc-800 shadow-sm">
                <Icon
                  as={Smartphone}
                  className="text-zinc-700 dark:text-zinc-300 w-6 h-6"
                />
              </Pressable>
              <Pressable className="flex-1 h-16 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 items-center justify-center active:bg-zinc-50 dark:active:bg-zinc-800 shadow-sm">
                <Icon
                  as={Code}
                  className="text-zinc-700 dark:text-zinc-300 w-6 h-6"
                />
              </Pressable>
            </HStack>

            {/* --- FOOTER --- */}
            <HStack className="justify-center items-center mt-auto py-4">
              <Text className="text-zinc-500 dark:text-zinc-400 font-medium">
                Bạn chưa có tài khoản?{" "}
              </Text>
              <Pressable onPress={() => router.push("/register" as any)}>
                <Text className="text-yellow-600 font-black">Đăng ký ngay</Text>
              </Pressable>
            </HStack>
          </Box>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── MODAL KÍCH HOẠT SINH TRẮC HỌC ── */}
      <Modal
        visible={showBiometricModal}
        transparent
        animationType="fade"
        onRequestClose={handleBiometricPromptDecline}
      >
        <Box className="flex-1 bg-black/60 justify-center items-center px-6">
          <Box className="bg-white dark:bg-zinc-900 rounded-[32px] p-8 w-full max-w-sm shadow-2xl">
            {/* Close button */}
            <Pressable
              onPress={handleBiometricPromptDecline}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 items-center justify-center z-10"
            >
              <Icon as={X} className="text-zinc-500 w-4 h-4" />
            </Pressable>

            {/* Icon */}
            <Box className="items-center mb-6">
              <Box className="w-20 h-20 rounded-[28px] bg-yellow-500/10 dark:bg-yellow-500/20 items-center justify-center mb-4">
                <Icon
                  as={BiometricIcon}
                  className="text-yellow-500 w-10 h-10"
                />
              </Box>
              <Text className="text-xl font-black text-zinc-900 dark:text-white text-center">
                Kích hoạt {biometricType}
              </Text>
              <Text className="text-sm text-zinc-500 dark:text-zinc-400 text-center mt-2 leading-5">
                Bạn có muốn sử dụng {biometricType} để đăng nhập nhanh cho
                những lần sau không?
              </Text>
            </Box>

            {/* Features */}
            <VStack className="space-y-3 gap-3 mb-8">
              <HStack className="items-center space-x-3 gap-3">
                <Box className="w-8 h-8 rounded-xl bg-green-500/10 items-center justify-center">
                  <Icon
                    as={ShieldCheck}
                    className="text-green-500 w-4 h-4"
                  />
                </Box>
                <Text className="text-sm text-zinc-700 dark:text-zinc-300 flex-1">
                  An toàn tuyệt đối với mã hóa thiết bị
                </Text>
              </HStack>
              <HStack className="items-center space-x-3 gap-3">
                <Box className="w-8 h-8 rounded-xl bg-blue-500/10 items-center justify-center">
                  <Icon
                    as={Fingerprint}
                    className="text-blue-500 w-4 h-4"
                  />
                </Box>
                <Text className="text-sm text-zinc-700 dark:text-zinc-300 flex-1">
                  Đăng nhập nhanh chỉ trong 1 giây
                </Text>
              </HStack>
            </VStack>

            {/* Actions */}
            <VStack className="space-y-3 gap-3">
              <Pressable
                onPress={handleBiometricPromptAccept}
                className="bg-zinc-900 dark:bg-yellow-500 h-14 rounded-2xl items-center justify-center active:opacity-80"
              >
                <Text className="text-white dark:text-zinc-900 font-black text-base uppercase tracking-wider">
                  Kích hoạt ngay
                </Text>
              </Pressable>
              <Pressable
                onPress={handleBiometricPromptDecline}
                className="h-12 rounded-2xl items-center justify-center active:opacity-60"
              >
                <Text className="text-zinc-500 font-bold text-sm">
                  Để sau
                </Text>
              </Pressable>
            </VStack>
          </Box>
        </Box>
      </Modal>
    </SafeAreaView>
  );
}
