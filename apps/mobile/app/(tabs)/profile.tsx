import React from 'react';
import { ScrollView, Image, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { 
  User, 
  Settings, 
  LogOut, 
  Package, 
  MapPin, 
  CreditCard, 
  ChevronRight,
  Bell,
  HelpCircle,
  ShieldCheck,
  Star
} from 'lucide-react-native';

const menuGroups = [
  {
    title: 'Đơn hàng & Giao dịch',
    items: [
      { id: 'orders', label: 'Lịch sử đơn hàng', icon: Package },
      { id: 'reviews', label: 'Đánh giá của tôi', icon: Star },
      { id: 'payment', label: 'Phương thức thanh toán', icon: CreditCard },
    ]
  },
  {
    title: 'Cá nhân',
    items: [
      { id: 'address', label: 'Địa chỉ nhận hàng', icon: MapPin },
      { id: 'notifications', label: 'Thông báo', icon: Bell },
      { id: 'security', label: 'Bảo mật tài khoản', icon: ShieldCheck },
    ]
  },
  {
    title: 'Hỗ trợ',
    items: [
      { id: 'help', label: 'Trung tâm trợ giúp', icon: HelpCircle },
      { id: 'settings', label: 'Cài đặt ứng dụng', icon: Settings },
    ]
  }
];

const ProfileScreen = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-zinc-50 dark:bg-zinc-950">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        
        {/* Header Profile */}
        <Box className="bg-white dark:bg-zinc-900 px-5 pt-10 pb-8 rounded-b-[40px] shadow-sm elevation-2">
          <VStack className="items-center">
            <Box className="relative">
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop' }} 
                className="w-28 h-28 rounded-full border-4 border-yellow-400"
              />
              <Pressable className="absolute bottom-1 right-1 bg-zinc-900 dark:bg-zinc-100 p-2 rounded-full border-2 border-white dark:border-zinc-900">
                <Icon as={Settings} className="text-white dark:text-zinc-900 w-4 h-4" />
              </Pressable>
            </Box>
            
            <Text className="text-2xl font-bold text-zinc-900 dark:text-white mt-4">Wilson Junior</Text>
            <Text className="text-sm text-zinc-500 font-medium">wilson.jr@example.com</Text>
            
            <HStack className="mt-6 space-x-8 gap-8 bg-zinc-50 dark:bg-zinc-800 px-8 py-4 rounded-3xl">
              <VStack className="items-center">
                <Text className="text-lg font-bold text-zinc-900 dark:text-white">12</Text>
                <Text className="text-[10px] text-zinc-500 uppercase font-bold tracking-tighter">Đơn hàng</Text>
              </VStack>
              <Box className="w-px h-full bg-zinc-200 dark:bg-zinc-700" />
              <VStack className="items-center">
                <Text className="text-lg font-bold text-zinc-900 dark:text-white">850</Text>
                <Text className="text-[10px] text-zinc-500 uppercase font-bold tracking-tighter">Điểm tích lũy</Text>
              </VStack>
              <Box className="w-px h-full bg-zinc-200 dark:bg-zinc-700" />
              <VStack className="items-center">
                <Text className="text-lg font-bold text-zinc-900 dark:text-white">5</Text>
                <Text className="text-[10px] text-zinc-500 uppercase font-bold tracking-tighter">Mã giảm giá</Text>
              </VStack>
            </HStack>
          </VStack>
        </Box>

        {/* Menu Items */}
        <Box className="px-5 mt-8 mb-10">
          {menuGroups.map((group, groupIndex) => (
            <VStack key={groupIndex} className="mb-8">
              <Text className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4 ml-2">
                {group.title}
              </Text>
              <Box className="bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-100 dark:border-zinc-800 shadow-sm elevation-1">
                {group.items.map((item, index) => (
                  <Pressable 
                    key={item.id}
                    className={`flex-row items-center justify-between p-4 active:bg-zinc-50 dark:active:bg-zinc-800 ${
                      index < group.items.length - 1 ? 'border-b border-zinc-50 dark:border-zinc-800' : ''
                    }`}
                  >
                    <HStack className="items-center space-x-3 gap-3">
                      <Box className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-800 items-center justify-center">
                        <Icon as={item.icon} className="text-zinc-600 dark:text-zinc-400 w-5 h-5" />
                      </Box>
                      <Text className="text-sm font-medium text-zinc-900 dark:text-white">{item.label}</Text>
                    </HStack>
                    <Icon as={ChevronRight} className="text-zinc-300 dark:text-zinc-600 w-5 h-5" />
                  </Pressable>
                ))}
              </Box>
            </VStack>
          ))}

          {/* Logout Button */}
          <Pressable 
            className="flex-row items-center justify-center bg-red-50 dark:bg-red-900/20 p-5 rounded-3xl border border-red-100 dark:border-red-900/30 mb-10 active:opacity-80"
          >
            <Icon as={LogOut} className="text-red-500 w-5 h-5 mr-3" />
            <Text className="text-base font-bold text-red-500">Đăng xuất</Text>
          </Pressable>
        </Box>

        {/* Extra spacing for tabs */}
        <Box className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
