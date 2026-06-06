import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import Header from '@/components/Header';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Input, InputField, InputSlot, InputIcon } from '@/components/ui/input';
import { Button, ButtonText } from '@/components/ui/button';
import {
  User,
  Phone,
  MapPin,
  Home,
  Briefcase,
  Globe,
  Package,
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import {
  getAddressById,
  createAddress,
  updateAddress,
  type CreateAddressPayload,
} from '@/services/address.service';

type AddressType = 'HOME' | 'OFFICE' | 'OTHER';

const AddressFormScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = !!id;

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [ward, setWard] = useState('');
  const [city, setCity] = useState('');
  const [type, setType] = useState<AddressType>('HOME');
  const [isDefault, setIsDefault] = useState(false);

  // Load existing address when editing
  useEffect(() => {
    if (!id || !user?._id) return;
    const load = async () => {
      const address = await getAddressById(id, user._id);
      if (address) {
        setFullName(address.fullName);
        setPhone(address.phone);
        setStreet(address.street);
        setWard(address.ward);
        setCity(address.city);
        setType(address.type);
        setIsDefault(address.isDefault);
      } else {
        Alert.alert('Lỗi', 'Không tìm thấy địa chỉ');
        router.back();
      }
      setLoading(false);
    };
    load();
  }, [id, user?._id]);

  const handleSave = async () => {
    if (!user?._id) return;

    if (!fullName.trim() || !phone.trim() || !street.trim() || !ward.trim() || !city.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng điền đầy đủ tất cả các trường bắt buộc.');
      return;
    }

    setSaving(true);
    const payload: CreateAddressPayload = {
      fullName: fullName.trim(),
      phone: phone.trim(),
      street: street.trim(),
      ward: ward.trim(),
      city: city.trim(),
      type,
      isDefault,
    };

    try {
      if (isEditing) {
        const result = await updateAddress(id!, user._id, payload);
        if (result) {
          Alert.alert('Thành công', 'Địa chỉ đã được cập nhật.', [
            { text: 'OK', onPress: () => router.back() },
          ]);
        } else {
          Alert.alert('Lỗi', 'Cập nhật địa chỉ thất bại. Vui lòng thử lại.');
        }
      } else {
        const result = await createAddress(user._id, payload);
        if (result) {
          Alert.alert('Thành công', 'Địa chỉ đã được thêm mới.', [
            { text: 'OK', onPress: () => router.back() },
          ]);
        } else {
          Alert.alert('Lỗi', 'Thêm địa chỉ thất bại. Vui lòng thử lại.');
        }
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1 }} className="bg-zinc-50 dark:bg-zinc-950">
        <Stack.Screen options={{ headerShown: false }} />
        <Header title="Cập nhật địa chỉ" />
        <Box className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#EAB308" />
        </Box>
      </SafeAreaView>
    );
  }

  const typeOptions: { key: AddressType; label: string; icon: any }[] = [
    { key: 'HOME', label: 'Nhà riêng', icon: Home },
    { key: 'OFFICE', label: 'Văn phòng', icon: Briefcase },
    { key: 'OTHER', label: 'Khác', icon: Package },
  ];

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-zinc-50 dark:bg-zinc-950">
      <Stack.Screen options={{ headerShown: false }} />
      <Header title={isEditing ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ mới'} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-5 pt-6">
          <VStack className="space-y-6 gap-6 mb-10">

            {/* Section 1: Contact */}
            <VStack className="space-y-4 gap-4">
              <Text className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">
                Thông tin liên hệ
              </Text>

              <VStack className="space-y-2 gap-2">
                <Text className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-1">
                  Họ và tên <Text className="text-red-500">*</Text>
                </Text>
                <Input className="h-14 rounded-2xl border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2">
                  <InputSlot className="pl-4">
                    <InputIcon as={User} className="text-zinc-400" />
                  </InputSlot>
                  <InputField
                    placeholder="Nguyễn Văn A"
                    value={fullName}
                    onChangeText={setFullName}
                    className="text-zinc-900 dark:text-white font-bold"
                  />
                </Input>
              </VStack>

              <VStack className="space-y-2 gap-2">
                <Text className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-1">
                  Số điện thoại <Text className="text-red-500">*</Text>
                </Text>
                <Input className="h-14 rounded-2xl border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2">
                  <InputSlot className="pl-4">
                    <InputIcon as={Phone} className="text-zinc-400" />
                  </InputSlot>
                  <InputField
                    placeholder="0901234567"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    className="text-zinc-900 dark:text-white font-bold"
                  />
                </Input>
              </VStack>
            </VStack>

            {/* Section 2: Address */}
            <VStack className="space-y-4 gap-4">
              <Text className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">
                Địa chỉ giao hàng
              </Text>

              <VStack className="space-y-2 gap-2">
                <Text className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-1">
                  Tỉnh / Thành phố <Text className="text-red-500">*</Text>
                </Text>
                <Input className="h-14 rounded-2xl border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2">
                  <InputSlot className="pl-4">
                    <InputIcon as={Globe} className="text-zinc-400" />
                  </InputSlot>
                  <InputField
                    placeholder="Hồ Chí Minh"
                    value={city}
                    onChangeText={setCity}
                    className="text-zinc-900 dark:text-white font-bold"
                  />
                </Input>
              </VStack>

              <VStack className="space-y-2 gap-2">
                <Text className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-1">
                  Phường / Xã <Text className="text-red-500">*</Text>
                </Text>
                <Input className="h-14 rounded-2xl border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2">
                  <InputField
                    placeholder="Phường 1"
                    value={ward}
                    onChangeText={setWard}
                    className="text-zinc-900 dark:text-white font-bold"
                  />
                </Input>
              </VStack>

              <VStack className="space-y-2 gap-2">
                <Text className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-1">
                  Số nhà, tên đường <Text className="text-red-500">*</Text>
                </Text>
                <Input className="h-14 rounded-2xl border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2">
                  <InputSlot className="pl-4">
                    <InputIcon as={MapPin} className="text-zinc-400" />
                  </InputSlot>
                  <InputField
                    placeholder="123 Đường ABC"
                    value={street}
                    onChangeText={setStreet}
                    className="text-zinc-900 dark:text-white font-bold"
                  />
                </Input>
              </VStack>
            </VStack>

            {/* Section 3: Settings */}
            <VStack className="space-y-4 gap-4">
              <Text className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">
                Loại địa chỉ & Cài đặt
              </Text>

              {/* Type selector */}
              <HStack className="space-x-3 gap-3">
                {typeOptions.map((opt) => (
                  <Pressable
                    key={opt.key}
                    onPress={() => setType(opt.key)}
                    className={`flex-1 flex-row items-center justify-center h-14 rounded-2xl border-2 ${
                      type === opt.key
                        ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10'
                        : 'border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900'
                    }`}
                  >
                    <Icon
                      as={opt.icon}
                      className={type === opt.key ? 'text-yellow-600' : 'text-zinc-400'}
                      size="sm"
                    />
                    <Text
                      className={`ml-2 text-xs font-bold ${
                        type === opt.key ? 'text-yellow-700' : 'text-zinc-500'
                      }`}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </HStack>

              {/* Default toggle */}
              <HStack className="justify-between items-center p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                <VStack className="flex-1 mr-4">
                  <Text className="text-sm font-bold text-zinc-800 dark:text-white">
                    Đặt làm địa chỉ mặc định
                  </Text>
                  <Text className="text-xs text-zinc-500">
                    Dùng địa chỉ này cho tất cả đơn hàng
                  </Text>
                </VStack>
                <Switch
                  value={isDefault}
                  onValueChange={setIsDefault}
                  trackColor={{ false: '#e4e4e7', true: '#EAB308' }}
                  thumbColor="#fff"
                />
              </HStack>
            </VStack>

          </VStack>
        </ScrollView>

        {/* Save button */}
        <Box className="p-5 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800">
          <Button
            onPress={handleSave}
            disabled={saving}
            className="bg-zinc-900 dark:bg-yellow-500 h-16 rounded-2xl shadow-xl active:opacity-90"
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ButtonText className="text-white dark:text-zinc-900 font-black text-lg uppercase tracking-wider">
                {isEditing ? 'Lưu thay đổi' : 'Thêm địa chỉ'}
              </ButtonText>
            )}
          </Button>
        </Box>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AddressFormScreen;
