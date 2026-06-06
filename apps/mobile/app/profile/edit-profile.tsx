import React, { useState } from 'react';
import { SafeAreaView, ScrollView, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { updateProfile } from '@/services/user.service';
import Header from '@/components/Header';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { Button, ButtonText } from '@/components/ui/button';
import { User, Phone, Mail, Image as ImageIcon } from 'lucide-react-native';

const EditProfileScreen = () => {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!fullName.trim() || !phone.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ họ tên và số điện thoại');
      return;
    }

    setLoading(true);
    try {
      const updatedUser = await updateProfile(user!._id, { fullName, phone, avatar });
      await updateUser(updatedUser);
      Alert.alert('Thành công', 'Cập nhật thông tin thành công', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      Alert.alert('Lỗi', error?.response?.data?.message || 'Cập nhật thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-zinc-50 dark:bg-zinc-950">
      <Stack.Screen options={{ headerShown: false }} />
      <Header title="Chỉnh sửa hồ sơ" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>
        <VStack className="space-y-6 gap-6">
          <Box>
            <Text className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2 ml-1">Email (Không thể thay đổi)</Text>
            <Input className="h-14 bg-zinc-100 dark:bg-zinc-900 border-0 rounded-2xl opacity-60 pointer-events-none" isDisabled={true}>
              <InputSlot className="pl-4 pr-2">
                <InputIcon as={Mail} className="text-zinc-500 w-5 h-5" />
              </InputSlot>
              <InputField 
                value={user?.email || ''} 
                className="text-base text-zinc-900 dark:text-white"
                editable={false}
              />
            </Input>
          </Box>

          <Box>
            <Text className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2 ml-1">Họ và tên</Text>
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

          <Box>
            <Text className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2 ml-1">Số điện thoại</Text>
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

          <Box>
            <Text className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2 ml-1">Ảnh đại diện (URL)</Text>
            <Input className="h-14 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm focus:border-yellow-400">
              <InputSlot className="pl-4 pr-2">
                <InputIcon as={ImageIcon} className="text-zinc-500 w-5 h-5" />
              </InputSlot>
              <InputField 
                value={avatar}
                onChangeText={setAvatar}
                placeholder="Nhập URL ảnh"
                autoCapitalize="none"
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
              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </ButtonText>
          </Button>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditProfileScreen;
