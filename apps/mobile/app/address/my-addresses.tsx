import React, { useState } from 'react';
import { ScrollView, SafeAreaView, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import Header from '@/components/Header';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Button, ButtonText, ButtonIcon } from '@/components/ui/button';
import { 
  ChevronLeft, 
  Plus, 
  MapPin, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Phone, 
  User,
  Home,
  Briefcase
} from 'lucide-react-native';

// Mock data for addresses
const initialAddresses = [
  {
    id: '1',
    name: 'Nguyễn Văn A',
    phone: '0901234567',
    street: '123 Đường ABC',
    ward: 'Phường 1',
    district: 'Quận 1',
    city: 'Hồ Chí Minh',
    type: 'Home',
    isDefault: true
  },
  {
    id: '2',
    name: 'Nguyễn Văn A (Work)',
    phone: '0901234567',
    street: '456 Đường XYZ',
    ward: 'Phường 5',
    district: 'Quận Tân Bình',
    city: 'Hồ Chí Minh',
    type: 'Work',
    isDefault: false
  }
];

const MyAddressesScreen = () => {
  const router = useRouter();
  const [addresses, setAddresses] = useState(initialAddresses);

  const handleSetDefault = (id: string) => {
    setAddresses(addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    })));
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      "Xác nhận",
      "Bạn có chắc muốn xóa địa chỉ này?",
      [
        { text: "Hủy", style: "cancel" },
        { 
          text: "Xóa", 
          style: "destructive", 
          onPress: () => setAddresses(addresses.filter(addr => addr.id !== id)) 
        }
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-zinc-50 dark:bg-zinc-950">
      <Stack.Screen options={{ headerShown: false }} />
      <Header title="Địa chỉ nhận hàng" />

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-5 pt-6">
        <VStack className="space-y-4 gap-4 mb-10">
          {addresses.map((address) => (
            <Pressable 
              key={address.id}
              onPress={() => handleSetDefault(address.id)}
              className={`bg-white dark:bg-zinc-900 p-5 rounded-3xl border ${
                address.isDefault ? 'border-yellow-500 shadow-md' : 'border-zinc-100 dark:border-zinc-800 shadow-sm'
              }`}
            >
              <HStack className="justify-between items-start mb-3">
                <HStack className="items-center space-x-2 gap-2">
                  <Box className={`w-8 h-8 rounded-full items-center justify-center ${
                    address.type === 'Home' ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-purple-50 dark:bg-purple-900/20'
                  }`}>
                    <Icon 
                      as={address.type === 'Home' ? Home : Briefcase} 
                      className={address.type === 'Home' ? 'text-blue-500' : 'text-purple-500'} 
                      size="xs" 
                    />
                  </Box>
                  <Text className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tighter">
                    {address.type === 'Home' ? 'Nhà riêng' : 'Văn phòng'}
                  </Text>
                  {address.isDefault && (
                    <Box className="bg-yellow-500 px-2 py-0.5 rounded-md">
                      <Text className="text-[10px] font-bold text-zinc-900 uppercase">Mặc định</Text>
                    </Box>
                  )}
                </HStack>
                
                <HStack className="space-x-3 gap-3">
                  <Pressable onPress={() => router.push(`/address/address-form?id=${address.id}` as any)}>
                    <Icon as={Edit3} className="text-zinc-400 w-5 h-5" />
                  </Pressable>
                  <Pressable onPress={() => handleDelete(address.id)}>
                    <Icon as={Trash2} className="text-red-500 w-5 h-5" />
                  </Pressable>
                </HStack>
              </HStack>

              <VStack className="space-y-1 gap-1 mb-4">
                <HStack className="items-center space-x-2 gap-2">
                  <Icon as={User} className="text-zinc-400 w-4 h-4" />
                  <Text className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{address.name}</Text>
                </HStack>
                <HStack className="items-center space-x-2 gap-2">
                  <Icon as={Phone} className="text-zinc-400 w-4 h-4" />
                  <Text className="text-sm text-zinc-500">{address.phone}</Text>
                </HStack>
                <HStack className="items-start space-x-2 gap-2 mt-1">
                  <Icon as={MapPin} className="text-yellow-500 w-4 h-4 mt-0.5" />
                  <Text className="text-sm text-zinc-600 dark:text-zinc-400 flex-1 leading-relaxed">
                    {address.street}, {address.ward}, {address.city}
                  </Text>
                </HStack>
              </VStack>

              {address.isDefault ? (
                <HStack className="items-center space-x-2 gap-2 pt-3 border-t border-zinc-50 dark:border-zinc-800">
                  <Icon as={CheckCircle2} className="text-yellow-500 w-4 h-4" />
                  <Text className="text-xs font-bold text-yellow-600">Đang được chọn làm mặc định</Text>
                </HStack>
              ) : (
                <Pressable onPress={() => handleSetDefault(address.id)} className="pt-3 border-t border-zinc-50 dark:border-zinc-800">
                  <Text className="text-xs font-bold text-zinc-400 italic">Nhấn để chọn làm mặc định</Text>
                </Pressable>
              )}
            </Pressable>
          ))}
        </VStack>
      </ScrollView>

      {/* Add New Address Button */}
      <Box className="p-5 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800">
        <Button 
          onPress={() => router.push('/address/address-form' as any)}
          className="bg-zinc-900 dark:bg-yellow-500 h-16 rounded-2xl shadow-xl active:opacity-90"
        >
          <ButtonIcon as={Plus} className="text-white dark:text-zinc-900 mr-2" />
          <ButtonText className="text-white dark:text-zinc-900 font-black text-lg uppercase tracking-wider">Thêm địa chỉ mới</ButtonText>
        </Button>
      </Box>
    </SafeAreaView>
  );
};

export default MyAddressesScreen;
