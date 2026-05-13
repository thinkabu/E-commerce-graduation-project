import React, { useState } from 'react';
import { ScrollView, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { Button, ButtonText, ButtonIcon } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Mail, Lock, User, Eye, EyeOff, Zap, ArrowLeft, CheckCircle2, Heart, Smartphone } from 'lucide-react-native';
import api from '@/services/api';
import { Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';

export default function RegisterScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!fullName || !email || !password) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Attempting to register with:", { fullName, email, phone });
      
      // 1. Đăng ký tài khoản
      const registerRes = await api.post('/auth/register', { 
        fullName, 
        email, 
        password,
        phone
      });
      
      console.log("Register success:", registerRes.data);

      // 2. Tự động đăng nhập sau khi đăng ký thành công
      const loginResponse = await api.post('/auth/login', { email, password });
      const { access_token, user } = loginResponse.data.data;
      
      await login(access_token, user);
      Alert.alert("Thành công", "Tài khoản đã được tạo!");
      router.replace('/home');
    } catch (error: any) {
      console.error("Register Error Details:", error.response?.data || error.message);
      const message = error.response?.data?.message || "Đăng ký thất bại. Vui lòng kiểm tra lại kết nối API.";
      Alert.alert("Lỗi", message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-zinc-950">
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
            <VStack className="space-y-6 gap-6">
              <VStack className="space-y-2 gap-2">
                <Text className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-1">Họ và tên</Text>
                <Input className="h-16 rounded-2xl border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-2">
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
                <Text className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-1">Số điện thoại</Text>
                <Input className="h-16 rounded-2xl border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-2">
                  <InputSlot className="pl-4">
                    <InputIcon as={Smartphone} className="text-zinc-400" />
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

              <VStack className="space-y-2 gap-2">
                <Text className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-1">Email</Text>
                <Input className="h-16 rounded-2xl border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-2">
                  <InputSlot className="pl-4">
                    <InputIcon as={Mail} className="text-zinc-400" />
                  </InputSlot>
                  <InputField 
                    placeholder="customer@gmail.com"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    className="text-zinc-900 dark:text-white font-bold"
                  />
                </Input>
              </VStack>

              <VStack className="space-y-2 gap-2">
                <Text className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-1">Mật khẩu</Text>
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
                  <InputSlot className="pr-4" onPress={() => setShowPassword(!showPassword)}>
                    <InputIcon as={showPassword ? EyeOff : Eye} className="text-zinc-400" />
                  </InputSlot>
                </Input>
              </VStack>

              <HStack className="items-center space-x-2 gap-2 px-1">
                <Icon as={CheckCircle2} className="text-yellow-600 w-5 h-5" />
                <Text className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                  Tôi đồng ý với <Text className="text-zinc-900 dark:text-white font-bold">Điều khoản & Chính sách</Text>
                </Text>
              </HStack>

              <Button 
                onPress={handleRegister}
                disabled={isLoading}
                className="bg-zinc-900 dark:bg-yellow-500 h-16 rounded-2xl shadow-xl mt-4 active:opacity-90 disabled:opacity-50"
              >
                {isLoading ? (
                  <ActivityIndicator color={Platform.OS === 'ios' ? 'white' : 'white'} />
                ) : (
                  <ButtonText className="text-white dark:text-zinc-900 font-black text-lg uppercase tracking-wider">Đăng ký ngay</ButtonText>
                )}
              </Button>
            </VStack>

            {/* --- FOOTER --- */}
            <HStack className="justify-center items-center mt-12 pb-4">
              <Text className="text-zinc-500 dark:text-zinc-400 font-medium">Bạn đã có tài khoản? </Text>
              <Pressable onPress={() => router.push('/login' as any)}>
                <Text className="text-yellow-600 font-black">Đăng nhập ngay</Text>
              </Pressable>
            </HStack>
          </Box>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
