import React, { useState } from 'react';
import { ScrollView, SafeAreaView, KeyboardAvoidingView, Platform, Switch } from 'react-native';
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
  Globe
} from 'lucide-react-native';

const AddressFormScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const isEditing = !!id;

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [ward, setWard] = useState('');
  const [city, setCity] = useState('');
  const [type, setType] = useState('Home');
  const [isDefault, setIsDefault] = useState(false);

  const handleSave = () => {
    // Implement save logic here
    router.back();
  };

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
            
            {/* Section 1: Contact Info */}
            <VStack className="space-y-4 gap-4">
              <Text className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">Thông tin liên hệ</Text>
              
              <VStack className="space-y-2 gap-2">
                <Text className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-1">Họ và tên</Text>
                <Input className="h-14 rounded-2xl border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2">
                  <InputSlot className="pl-4">
                    <InputIcon as={User} className="text-zinc-400" />
                  </InputSlot>
                  <InputField 
                    placeholder="Nguyễn Văn A"
                    value={name}
                    onChangeText={setName}
                    className="text-zinc-900 dark:text-white font-bold"
                  />
                </Input>
              </VStack>

              <VStack className="space-y-2 gap-2">
                <Text className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-1">Số điện thoại</Text>
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

            {/* Section 2: Address Details */}
            <VStack className="space-y-4 gap-4">
              <Text className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">Địa chỉ giao hàng</Text>
              
              <VStack className="space-y-2 gap-2">
                <Text className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-1">Tỉnh / Thành phố</Text>
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
                <Text className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-1">Phường / Xã</Text>
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
                <Text className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-1">Địa chỉ cụ thể (Số nhà, tên đường)</Text>
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
              <Text className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">Loại địa chỉ & Cài đặt</Text>
              
              <HStack className="space-x-3 gap-3">
                <Pressable 
                  onPress={() => setType('Home')}
                  className={`flex-1 flex-row items-center justify-center h-14 rounded-2xl border-2 ${
                    type === 'Home' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10' : 'border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900'
                  }`}
                >
                  <Icon as={Home} className={type === 'Home' ? 'text-yellow-600' : 'text-zinc-400'} size="md" />
                  <Text className={`ml-2 font-bold ${type === 'Home' ? 'text-yellow-700' : 'text-zinc-500'}`}>Nhà riêng</Text>
                </Pressable>
                
                <Pressable 
                  onPress={() => setType('Work')}
                  className={`flex-1 flex-row items-center justify-center h-14 rounded-2xl border-2 ${
                    type === 'Work' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10' : 'border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900'
                  }`}
                >
                  <Icon as={Briefcase} className={type === 'Work' ? 'text-yellow-600' : 'text-zinc-400'} size="md" />
                  <Text className={`ml-2 font-bold ${type === 'Work' ? 'text-yellow-700' : 'text-zinc-500'}`}>Văn phòng</Text>
                </Pressable>
              </HStack>

              <HStack className="justify-between items-center p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 mt-2">
                <VStack className="flex-1 mr-4">
                  <Text className="text-sm font-bold text-zinc-800 dark:text-white">Đặt làm mặc định</Text>
                  <Text className="text-xs text-zinc-500">Dùng địa chỉ này cho tất cả đơn hàng</Text>
                </VStack>
                <Switch 
                  value={isDefault}
                  onValueChange={setIsDefault}
                  trackColor={{ false: '#e4e4e7', true: '#EAB308' }}
                  thumbColor={'#fff'}
                />
              </HStack>
            </VStack>

          </VStack>
        </ScrollView>

        {/* Save Button */}
        <Box className="p-5 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800">
          <Button 
            onPress={handleSave}
            className="bg-zinc-900 dark:bg-yellow-500 h-16 rounded-2xl shadow-xl active:opacity-90"
          >
            <ButtonText className="text-white dark:text-zinc-900 font-black text-lg uppercase tracking-wider">Lưu địa chỉ</ButtonText>
          </Button>
        </Box>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AddressFormScreen;
