import React, { useState } from 'react';
import { ScrollView, SafeAreaView, TouchableOpacity, Alert, Image, View } from 'react-native';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import Header from '@/components/Header';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Icon } from '@/components/ui/icon';
import { Button, ButtonText } from '@/components/ui/button';
import { 
  Copy, 
  Wallet, 
  CheckCircle2, 
  ShieldCheck, 
  AlertCircle,
  Info
} from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';

const BlockchainPaymentScreen = () => {
  const router = useRouter();
  const { total } = useLocalSearchParams();
  const [copied, setCopied] = useState(false);

  // Mock wallet info
  const walletAddress = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";
  const usdtAmount = (Number(total) / 25450).toFixed(2); // Giả sử tỉ giá 1 USDT = 25.450 VNĐ

  const copyToClipboard = async () => {
    try {
      if (Clipboard && typeof Clipboard.setStringAsync === 'function') {
        await Clipboard.setStringAsync(walletAddress);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        throw new Error('Clipboard not available');
      }
    } catch (error) {
      Alert.alert("Thông báo", "Vui lòng sao chép thủ công địa chỉ ví này.");
      console.log('Clipboard error:', error);
    }
  };

  const handleConfirmPayment = () => {
    Alert.alert(
      "Xác nhận thanh toán",
      "Bạn đã chuyển khoản thành công? Chúng tôi sẽ kiểm tra giao dịch trên mạng lưới.",
      [
        { text: "Chưa", style: "cancel" },
        { 
          text: "Đã chuyển", 
          onPress: () => {
             // Logic xác thực giao dịch
             router.replace('/checkout/payment-result?success=true' as any);
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-zinc-50 dark:bg-zinc-950">
      <Stack.Screen options={{ headerShown: false }} />
      <Header title="Thanh toán Blockchain" />

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-5 pt-6">
        <VStack className="space-y-6 gap-6 mb-10">
          
          {/* Amount Box */}
          <Box className="bg-zinc-900 p-8 rounded-[32px] items-center shadow-xl">
             <Text className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2">Số tiền cần thanh toán</Text>
             <Text className="text-yellow-500 text-3xl font-black">{usdtAmount} USDT</Text>
             <Text className="text-zinc-500 text-[10px] mt-1">≈ {Number(total).toLocaleString()}₫ (Tỉ giá: 1 USDT = 25.450₫)</Text>
          </Box>

          {/* Wallet Address */}
          <VStack className="space-y-3 gap-3">
            <Text className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1">Địa chỉ ví nhận (ERC-20 / BEP-20)</Text>
            <Box className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-100 dark:border-zinc-800 border-dashed">
              <HStack className="items-center justify-between">
                <Text className="text-sm font-bold text-zinc-800 dark:text-zinc-200 flex-1 mr-4" numberOfLines={1}>
                  {walletAddress}
                </Text>
                <TouchableOpacity onPress={copyToClipboard} className="bg-yellow-500 p-2 rounded-xl">
                  <Icon as={copied ? CheckCircle2 : Copy} className="text-zinc-900 w-5 h-5" />
                </TouchableOpacity>
              </HStack>
              {copied && <Text className="text-[10px] text-green-500 font-bold mt-2">Đã sao chép vào bộ nhớ tạm!</Text>}
            </Box>
          </VStack>

          {/* QR Code Placeholder */}
          <VStack className="items-center py-6 bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-100 dark:border-zinc-800">
             <Box className="w-48 h-48 bg-zinc-100 dark:bg-zinc-800 rounded-2xl items-center justify-center p-4">
                <Image 
                  source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${walletAddress}` }} 
                  className="w-full h-full"
                />
             </Box>
             <Text className="text-xs text-zinc-400 mt-4 italic">Quét mã QR để lấy địa chỉ ví nhanh</Text>
          </VStack>

          {/* Warning Note */}
          <Box className="bg-red-50 dark:bg-red-900/10 p-5 rounded-3xl border border-red-100 dark:border-red-900/20">
            <HStack className="items-start space-x-3 gap-3">
              <Icon as={AlertCircle} className="text-red-500 w-5 h-5 mt-0.5" />
              <VStack className="flex-1">
                <Text className="text-xs font-black text-red-600 uppercase">Lưu ý quan trọng</Text>
                <Text className="text-[11px] text-red-500/80 leading-relaxed mt-1">
                  Chỉ chuyển tiền qua mạng lưới <Text className="font-bold">ERC-20 hoặc BEP-20</Text>. Gửi sai mạng lưới có thể dẫn đến mất tài sản vĩnh viễn. 
                  Vui lòng chụp lại biên lai giao dịch sau khi hoàn tất.
                </Text>
              </VStack>
            </HStack>
          </Box>

        </VStack>
      </ScrollView>

      {/* Action Button */}
      <Box className="p-5 bg-white dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-800">
        <Button 
          onPress={handleConfirmPayment}
          className="bg-zinc-900 dark:bg-yellow-500 h-16 rounded-2xl shadow-xl active:opacity-90"
        >
          <ButtonText className="text-white dark:text-zinc-900 font-black text-lg uppercase tracking-wider">Tôi đã chuyển tiền</ButtonText>
        </Button>
      </Box>
    </SafeAreaView>
  );
};

export default BlockchainPaymentScreen;
