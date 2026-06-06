import React from 'react';
import { SafeAreaView, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import Header from '@/components/Header';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Sun, Moon, Smartphone, Check } from 'lucide-react-native';

type ThemeOption = {
  mode: 'light' | 'dark' | 'system';
  label: string;
  desc: string;
  icon: any;
  iconBg: string;
  iconColor: string;
};

const themeOptions: ThemeOption[] = [
  {
    mode: 'light',
    label: 'Chế độ sáng',
    desc: 'Giao diện sáng, phù hợp dùng ban ngày',
    icon: Sun,
    iconBg: 'bg-amber-100 dark:bg-amber-900/30',
    iconColor: 'text-amber-600',
  },
  {
    mode: 'dark',
    label: 'Chế độ tối',
    desc: 'Giao diện tối, bảo vệ mắt vào ban đêm',
    icon: Moon,
    iconBg: 'bg-indigo-100 dark:bg-indigo-900/30',
    iconColor: 'text-indigo-600',
  },
  {
    mode: 'system',
    label: 'Theo hệ thống',
    desc: 'Tự động thay đổi theo cài đặt thiết bị',
    icon: Smartphone,
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
    iconColor: 'text-emerald-600',
  },
];

const AppearanceScreen = () => {
  const { themeMode, setThemeMode } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-zinc-50 dark:bg-zinc-950">
      <Stack.Screen options={{ headerShown: false }} />
      <Header title="Giao diện" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>
        <Text className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4 ml-2">
          Chọn chế độ hiển thị
        </Text>

        <VStack className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden">
          {themeOptions.map((option, index) => {
            const isActive = themeMode === option.mode;
            return (
              <Pressable
                key={option.mode}
                onPress={() => setThemeMode(option.mode)}
                className={`flex-row items-center p-5 active:bg-zinc-50 dark:active:bg-zinc-800 ${
                  index < themeOptions.length - 1 ? 'border-b border-zinc-50 dark:border-zinc-800' : ''
                }`}
              >
                <Box className={`w-12 h-12 rounded-2xl ${option.iconBg} items-center justify-center mr-4`}>
                  <Icon as={option.icon} className={`${option.iconColor} w-6 h-6`} />
                </Box>
                <VStack className="flex-1">
                  <Text className="text-base font-bold text-zinc-900 dark:text-white">
                    {option.label}
                  </Text>
                  <Text className="text-xs text-zinc-500 mt-0.5">
                    {option.desc}
                  </Text>
                </VStack>
                {isActive && (
                  <Box className="w-8 h-8 rounded-full bg-yellow-400 items-center justify-center">
                    <Icon as={Check} className="text-zinc-900 w-5 h-5" />
                  </Box>
                )}
              </Pressable>
            );
          })}
        </VStack>

        <Box className="mt-6 px-3">
          <Text className="text-xs text-zinc-400 leading-relaxed">
            Chế độ "Theo hệ thống" sẽ tự động chuyển đổi giữa giao diện sáng và tối dựa trên cài đặt trên thiết bị của bạn.
          </Text>
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AppearanceScreen;
