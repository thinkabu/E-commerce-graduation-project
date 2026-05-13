import React, { useState } from 'react';
import { ScrollView, Dimensions, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { Button, ButtonText, ButtonIcon } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Globe, Code, Smartphone, Heart } from 'lucide-react-native';
import api from '@/services/api';
import { Alert } from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin");
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { access_token, user } = response.data.data;
      
      await login(access_token, user);
      router.replace('/home');
    } catch (error: any) {
      const message = error.response?.data?.message || "Đăng nhập thất bại";
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

            {/* --- FORM --- */}
            <VStack className="space-y-6 gap-6">
              <VStack className="space-y-2 gap-2">
                <Text className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-1">Email</Text>
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
                  <Text className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Mật khẩu</Text>
                  <Pressable>
                    <Text className="text-sm font-bold text-yellow-600">Quên mật khẩu?</Text>
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
                  <InputSlot className="pr-4" onPress={() => setShowPassword(!showPassword)}>
                    <InputIcon as={showPassword ? EyeOff : Eye} className="text-zinc-400" />
                  </InputSlot>
                </Input>
              </VStack>

              <Button 
                onPress={handleLogin}
                disabled={isLoading}
                className="bg-zinc-900 dark:bg-yellow-500 h-16 rounded-2xl shadow-xl shadow-zinc-900/20 mt-4 active:opacity-90 disabled:opacity-50"
              >
                {isLoading ? (
                  <ActivityIndicator color={Platform.OS === 'ios' ? 'white' : 'white'} />
                ) : (
                  <>
                    <ButtonText className="text-white dark:text-zinc-900 font-black text-lg uppercase tracking-wider">Đăng nhập</ButtonText>
                    <ButtonIcon as={ArrowRight} className="text-white dark:text-zinc-900 ml-2" />
                  </>
                )}
              </Button>
            </VStack>

            {/* --- DIVIDER --- */}
            <HStack className="items-center my-10 space-x-4 gap-4">
              <Box className="flex-1 h-[1px] bg-zinc-100 dark:bg-zinc-800" />
              <Text className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Hoặc đăng nhập bằng</Text>
              <Box className="flex-1 h-[1px] bg-zinc-100 dark:bg-zinc-800" />
            </HStack>

            {/* --- SOCIAL LOGIN --- */}
            <HStack className="space-x-4 gap-4 mb-12">
              <Pressable className="flex-1 h-16 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 items-center justify-center active:bg-zinc-50 dark:active:bg-zinc-800 shadow-sm">
                <Icon as={Globe} className="text-zinc-700 dark:text-zinc-300 w-6 h-6" />
              </Pressable>
              <Pressable className="flex-1 h-16 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 items-center justify-center active:bg-zinc-50 dark:active:bg-zinc-800 shadow-sm">
                <Icon as={Smartphone} className="text-zinc-700 dark:text-zinc-300 w-6 h-6" />
              </Pressable>
              <Pressable className="flex-1 h-16 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 items-center justify-center active:bg-zinc-50 dark:active:bg-zinc-800 shadow-sm">
                <Icon as={Code} className="text-zinc-700 dark:text-zinc-300 w-6 h-6" />
              </Pressable>
            </HStack>

            {/* --- FOOTER --- */}
            <HStack className="justify-center items-center mt-auto py-4">
              <Text className="text-zinc-500 dark:text-zinc-400 font-medium">Bạn chưa có tài khoản? </Text>
              <Pressable onPress={() => router.push('/register' as any)}>
                <Text className="text-yellow-600 font-black">Đăng ký ngay</Text>
              </Pressable>
            </HStack>
          </Box>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
