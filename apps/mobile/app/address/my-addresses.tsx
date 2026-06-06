import React, { useState, useCallback } from 'react';
import { ScrollView, SafeAreaView, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter, Stack, useFocusEffect } from 'expo-router';
import Header from '@/components/Header';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Button, ButtonText, ButtonIcon } from '@/components/ui/button';
import {
  Plus,
  MapPin,
  Edit3,
  Trash2,
  CheckCircle2,
  Phone,
  User,
  Home,
  Briefcase,
  Package,
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { getAddresses, deleteAddress, type Address } from '@/services/address.service';

const typeConfig = {
  HOME: { label: 'Nhà riêng', icon: Home, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  OFFICE: { label: 'Văn phòng', icon: Briefcase, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  OTHER: { label: 'Khác', icon: Package, color: 'text-zinc-500', bg: 'bg-zinc-100 dark:bg-zinc-800' },
};

const MyAddressesScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAddresses = useCallback(async () => {
    if (!user?._id) return;
    const data = await getAddresses(user._id);
    setAddresses(data);
    setLoading(false);
    setRefreshing(false);
  }, [user?._id]);

  // Reload khi quay lại từ form
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadAddresses();
    }, [loadAddresses]),
  );

  const handleDelete = (id: string, isDefault: boolean) => {
    if (isDefault) {
      Alert.alert('Không thể xóa', 'Không thể xóa địa chỉ mặc định. Hãy chỉnh sửa và đặt địa chỉ khác làm mặc định trước.');
      return;
    }
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn xóa địa chỉ này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            const ok = await deleteAddress(id, user!._id);
            if (ok) {
              setAddresses((prev) => prev.filter((a) => a._id !== id));
            } else {
              Alert.alert('Lỗi', 'Xóa địa chỉ thất bại. Vui lòng thử lại.');
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-zinc-50 dark:bg-zinc-950">
      <Stack.Screen options={{ headerShown: false }} />
      <Header title="Địa chỉ nhận hàng" />

      {loading ? (
        <Box className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#EAB308" />
        </Box>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1 px-5 pt-6"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); loadAddresses(); }}
              tintColor="#EAB308"
            />
          }
        >
          <VStack className="space-y-4 gap-4 mb-10">
            {addresses.length === 0 ? (
              <VStack className="items-center justify-center py-20 space-y-4 gap-4">
                <Box className="w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-800 items-center justify-center">
                  <Icon as={MapPin} className="text-zinc-300 dark:text-zinc-600 w-10 h-10" />
                </Box>
                <Text className="text-zinc-400 font-medium text-center">
                  Bạn chưa có địa chỉ nào.{'\n'}Hãy thêm địa chỉ giao hàng!
                </Text>
              </VStack>
            ) : (
              addresses.map((address) => {
                const cfg = typeConfig[address.type] ?? typeConfig.OTHER;
                return (
                  <Box
                    key={address._id}
                    className={`bg-white dark:bg-zinc-900 p-5 rounded-3xl border ${
                      address.isDefault
                        ? 'border-yellow-500 shadow-md'
                        : 'border-zinc-100 dark:border-zinc-800 shadow-sm'
                    }`}
                  >
                    {/* Header row */}
                    <HStack className="justify-between items-start mb-3">
                      <HStack className="items-center space-x-2 gap-2">
                        <Box className={`w-8 h-8 rounded-full items-center justify-center ${cfg.bg}`}>
                          <Icon as={cfg.icon} className={`${cfg.color} w-4 h-4`} size="xs" />
                        </Box>
                        <Text className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tighter">
                          {cfg.label}
                        </Text>
                        {address.isDefault && (
                          <Box className="bg-yellow-500 px-2 py-0.5 rounded-md">
                            <Text className="text-[10px] font-bold text-zinc-900 uppercase">Mặc định</Text>
                          </Box>
                        )}
                      </HStack>

                      <HStack className="space-x-3 gap-3">
                        <Pressable
                          onPress={() =>
                            router.push({
                              pathname: '/address/address-form',
                              params: { id: address._id },
                            })
                          }
                          className="p-1"
                        >
                          <Icon as={Edit3} className="text-zinc-400 w-5 h-5" />
                        </Pressable>
                        <Pressable onPress={() => handleDelete(address._id, address.isDefault)} className="p-1">
                          <Icon as={Trash2} className="text-red-500 w-5 h-5" />
                        </Pressable>
                      </HStack>
                    </HStack>

                    {/* Address details */}
                    <VStack className="space-y-1 gap-1 mb-3">
                      <HStack className="items-center space-x-2 gap-2">
                        <Icon as={User} className="text-zinc-400 w-4 h-4" />
                        <Text className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{address.fullName}</Text>
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

                    {/* Default indicator */}
                    {address.isDefault && (
                      <HStack className="items-center space-x-2 gap-2 pt-3 border-t border-zinc-50 dark:border-zinc-800">
                        <Icon as={CheckCircle2} className="text-yellow-500 w-4 h-4" />
                        <Text className="text-xs font-bold text-yellow-600">Đang dùng làm địa chỉ mặc định</Text>
                      </HStack>
                    )}
                  </Box>
                );
              })
            )}
          </VStack>
        </ScrollView>
      )}

      {/* Add button */}
      <Box className="p-5 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800">
        <Button
          onPress={() => router.push('/address/address-form' as any)}
          className="bg-zinc-900 dark:bg-yellow-500 h-16 rounded-2xl shadow-xl active:opacity-90"
        >
          <ButtonIcon as={Plus} className="text-white dark:text-zinc-900 mr-2" />
          <ButtonText className="text-white dark:text-zinc-900 font-black text-lg uppercase tracking-wider">
            Thêm địa chỉ mới
          </ButtonText>
        </Button>
      </Box>
    </SafeAreaView>
  );
};

export default MyAddressesScreen;
