import React, { useState } from "react";
import {
  ScrollView,
  SafeAreaView,
  Image,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter, Stack, useLocalSearchParams } from "expo-router";
import Header from "@/components/Header";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Icon } from "@/components/ui/icon";
import { Button, ButtonText } from "@/components/ui/button";
import {
  Search,
  CheckCircle2,
  Building2,
  CreditCard,
} from "lucide-react-native";
import { Input, InputField, InputSlot, InputIcon } from "@/components/ui/input";

const BANKS = [
  {
    id: "vcb",
    name: "Vietcombank",
    fullName: "Ngân hàng TMCP Ngoại thương Việt Nam",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Logo_Vietcombank.png/1200px-Logo_Vietcombank.png",
  },
  {
    id: "tcb",
    name: "Techcombank",
    fullName: "Ngân hàng TMCP Kỹ thương Việt Nam",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Techcombank_logo.svg/2560px-Techcombank_logo.svg.png",
  },
  {
    id: "bidv",
    name: "BIDV",
    fullName: "Ngân hàng TMCP Đầu tư và Phát triển Việt Nam",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/BIDV_Logo.svg/2560px-BIDV_Logo.svg.png",
  },
  {
    id: "vpb",
    name: "VPBank",
    fullName: "Ngân hàng TMCP Việt Nam Thịnh Vượng",
    logo: "https://upload.wikimedia.org/wikipedia/vi/thumb/a/a2/Logo_VPBank.svg/1280px-Logo_VPBank.svg.png",
  },
  {
    id: "mbb",
    name: "MB Bank",
    fullName: "Ngân hàng TMCP Quân đội",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/MB_Bank_Logo.svg/2560px-MB_Bank_Logo.svg.png",
  },
  {
    id: "acb",
    name: "ACB",
    fullName: "Ngân hàng TMCP Á Châu",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/ACB_Logo.svg/2560px-ACB_Logo.svg.png",
  },
];

const BankSelectionScreen = () => {
  const router = useRouter();
  const { total, orderId } = useLocalSearchParams<{ total: string; orderId: string }>();
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBanks = BANKS.filter(
    (bank) =>
      bank.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bank.fullName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleConfirm = () => {
    if (!selectedBank) return;
    const bank = BANKS.find((b) => b.id === selectedBank);
    // Điều hướng sang trang kết quả thanh toán hiển thị VietQR chuyển khoản
    router.replace(
      `/checkout/payment-result?status=success&method=banking&bank=${bank?.name}&orderId=${orderId}&total=${total}` as any,
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-zinc-50 dark:bg-zinc-950">
      <Stack.Screen options={{ headerShown: false }} />
      <Header title="Chọn ngân hàng" />

      <Box className="px-5 pt-4 pb-2">
        <Input className="h-12 rounded-2xl border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2">
          <InputSlot className="pl-4">
            <InputIcon as={Search} className="text-zinc-400" />
          </InputSlot>
          <InputField
            placeholder="Tìm tên ngân hàng..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="text-zinc-900 dark:text-white font-medium"
          />
        </Input>
      </Box>

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1 px-5 pt-4"
      >
        <VStack className="space-y-3 gap-3 mb-10">
          {filteredBanks.map((bank) => (
            <TouchableOpacity
              key={bank.id}
              onPress={() => setSelectedBank(bank.id)}
              className={`p-4 rounded-3xl border-2 flex-row items-center bg-white dark:bg-zinc-900 ${
                selectedBank === bank.id
                  ? "border-yellow-500 shadow-lg"
                  : "border-zinc-100 dark:border-zinc-800"
              }`}
            >
              <Box className="w-14 h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-800 items-center justify-center mr-4 overflow-hidden border border-zinc-100 dark:border-zinc-800">
                <Image
                  source={{ uri: bank.logo }}
                  className="w-10 h-10 object-contain"
                />
              </Box>
              <VStack className="flex-1">
                <Text
                  className={`text-sm font-black ${selectedBank === bank.id ? "text-zinc-900 dark:text-yellow-500" : "text-zinc-700 dark:text-zinc-200"}`}
                >
                  {bank.name}
                </Text>
                <Text
                  className="text-[10px] text-zinc-400 font-medium"
                  numberOfLines={1}
                >
                  {bank.fullName}
                </Text>
              </VStack>
              {selectedBank === bank.id && (
                <Icon as={CheckCircle2} className="text-yellow-500 w-6 h-6" />
              )}
            </TouchableOpacity>
          ))}
        </VStack>
      </ScrollView>

      {/* Footer Info */}
      <Box className="p-5 bg-white dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-800 shadow-2xl">
        <HStack className="justify-between items-center mb-6 px-1">
          <VStack>
            <Text className="text-[10px] uppercase font-black text-zinc-400 tracking-tighter">
              Số tiền thanh toán
            </Text>
            <Text className="text-xl font-black text-yellow-600">
              {(Number(total) || 0).toLocaleString()}₫
            </Text>
          </VStack>
          <HStack className="items-center space-x-2 gap-2 bg-green-50 dark:bg-green-900/10 px-3 py-1.5 rounded-xl border border-green-100 dark:border-green-900/20">
            <Icon as={CreditCard} className="text-green-500 w-4 h-4" />
            <Text className="text-[10px] font-black text-green-600 uppercase">
              Miễn phí giao dịch
            </Text>
          </HStack>
        </HStack>

        <Button
          onPress={handleConfirm}
          disabled={!selectedBank}
          className="bg-zinc-900 dark:bg-yellow-500 h-16 rounded-2xl shadow-xl active:opacity-90 disabled:opacity-50"
        >
          <ButtonText className="text-white dark:text-zinc-900 font-black text-lg uppercase tracking-wider">
            Tiếp tục thanh toán
          </ButtonText>
        </Button>
      </Box>
    </SafeAreaView>
  );
};

export default BankSelectionScreen;
