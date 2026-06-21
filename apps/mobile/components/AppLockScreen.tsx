import React from "react";
import { View, ActivityIndicator } from "react-native";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Button, ButtonText } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Pressable } from "@/components/ui/pressable";
import { ScanFace, Fingerprint, Lock } from "lucide-react-native";

interface AppLockScreenProps {
  biometricType: string;
  onUnlock: () => Promise<boolean>;
  onLogout: () => Promise<void>;
}

export default function AppLockScreen({
  biometricType,
  onUnlock,
  onLogout,
}: AppLockScreenProps) {
  const BiometricIcon = biometricType === "Face ID" ? ScanFace : Fingerprint;

  return (
    <View className="flex-1 justify-center items-center bg-white dark:bg-zinc-950 px-8">
      <VStack className="items-center w-full max-w-sm" space="xl">
        {/* Shield Icon & Status */}
        <Box className="w-24 h-24 rounded-[36px] bg-yellow-500/10 dark:bg-yellow-500/20 items-center justify-center mb-4">
          <Icon as={Lock} className="text-yellow-600 dark:text-yellow-400 w-12 h-12" />
        </Box>

        <Text className="text-2xl font-black text-zinc-900 dark:text-white text-center">
          Ứng dụng đang khóa
        </Text>
        
        <Text className="text-sm text-zinc-500 dark:text-zinc-400 text-center mb-8 px-4 leading-5">
          Vui lòng xác thực {biometricType} để tiếp tục sử dụng ứng dụng Think heart.
        </Text>

        {/* Biometric trigger button */}
        <Pressable
          onPress={onUnlock}
          className="w-20 h-20 rounded-full bg-yellow-500 items-center justify-center shadow-lg shadow-yellow-500/30 active:scale-95 transition-transform mb-8"
        >
          <Icon as={BiometricIcon} className="text-zinc-900 w-10 h-10" />
        </Pressable>

        {/* Primary Action Button */}
        <Button
          onPress={onUnlock}
          className="w-full bg-zinc-900 dark:bg-yellow-500 h-14 rounded-2xl active:opacity-90"
        >
          <ButtonText className="text-white dark:text-zinc-900 font-bold uppercase tracking-wider">
            Mở khóa bằng {biometricType}
          </ButtonText>
        </Button>

        {/* Logout / Switch Account Button */}
        <Pressable
          onPress={onLogout}
          className="mt-4 active:opacity-75"
        >
          <Text className="text-zinc-500 dark:text-zinc-400 font-bold text-sm underline">
            Đăng nhập bằng mật khẩu
          </Text>
        </Pressable>
      </VStack>
    </View>
  );
}
