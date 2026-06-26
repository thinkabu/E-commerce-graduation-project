import React, { useState, useEffect, useCallback } from "react";
import {
  ScrollView,
  SafeAreaView,
  Image,
  Modal,
  Animated,
  ActivityIndicator,
  Alert,
  Linking,
} from "react-native";
import {
  useRouter,
  Stack,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";
import Header from "@/components/Header";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Icon } from "@/components/ui/icon";
import { Pressable } from "@/components/ui/pressable";
import { Button, ButtonText } from "@/components/ui/button";
import {
  MapPin,
  ChevronRight,
  Wallet,
  Banknote,
  CreditCard,
  Package,
  Tag,
  Truck,
  CheckCircle2,
  ShoppingBag,
  AlertCircle,
} from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { getAddresses, type Address } from "@/services/address.service";
import { validateCoupon } from "@/services/coupon.service";
import { createOrder } from "@/services/order.service";
import { getProductById } from "@/services/product.service";
import { Input, InputField, InputSlot, InputIcon } from "@/components/ui/input";
import api from "@/services/api";

// ─── Helpers ───────────────────────────────────────────────────
const formatPrice = (price: number) => price.toLocaleString("vi-VN") + "₫";

// ─── Payment method config ──────────────────────────────────────
const PAYMENT_METHODS = [
  {
    id: "COD",
    label: "Thanh toán khi nhận hàng",
    sub: "Trả tiền mặt khi nhận hàng",
    icon: Banknote,
    badge: null,
  },
  {
    id: "BANKING",
    label: "Chuyển khoản ngân hàng",
    sub: "QR Pay / Internet Banking",
    icon: CreditCard,
    badge: null,
  },
  {
    id: "VNPAY",
    label: "Thanh toán VNPay",
    sub: "Thẻ ATM / Thẻ quốc tế / QR Pay",
    icon: CreditCard,
    badge: "MỚI",
  },
  {
    id: "CRYPTO",
    label: "Thanh toán Blockchain",
    sub: "USDT / ETH — bảo mật cao",
    icon: Wallet,
    badge: "HOT",
  },
];

// ─── Section header ─────────────────────────────────────────────
const SectionLabel = ({ label }: { label: string }) => (
  <Text className="text-[11px] font-black text-zinc-400 uppercase tracking-widest mb-3 ml-1">
    {label}
  </Text>
);

// ═══════════════════════════════════════════════════════════════
// MAIN SCREEN
// ═══════════════════════════════════════════════════════════════
const CheckoutScreen = () => {
  const router = useRouter();
  const {
    mode,
    productId,
    variantId,
    quantity: qtyStr,
  } = useLocalSearchParams();
  const { user } = useAuth();
  const {
    cartItems,
    subtotal,
    shipping,
    total,
    loading: cartLoading,
    clearCart,
  } = useCart();

  // Single Item Logic
  const [singleItem, setSingleItem] = useState<any>(null);
  const [isFetchingSingle, setIsFetchingSingle] = useState(mode === "single");

  useEffect(() => {
    if (mode === "single" && productId) {
      const fetchSingleProduct = async () => {
        try {
          const product = await getProductById(productId as string);
          if (product) {
            const discountPercent = product.discountPercentage || 0;
            let baseDiscountedPrice = product.basePrice * (1 - discountPercent / 100);
            let price = baseDiscountedPrice;
            let image =
              product.images?.[0] || "https://via.placeholder.com/300";
            let variantAttrs: Record<string, string> = {};

            if (variantId) {
              const variant = product.variants?.find(
                (v: any) => v._id === variantId,
              );
              if (variant) {
                const variantBasePrice = variant.price !== undefined ? variant.price : product.basePrice;
                price = variantBasePrice * (1 - discountPercent / 100);
                if (variant.images?.length > 0) image = variant.images[0];
                if (variant.attributes) {
                  variant.attributes.forEach((attr: any) => {
                    variantAttrs[attr.name] = attr.value;
                  });
                }
              }
            }

            setSingleItem({
              id: product._id,
              productId: product._id,
              variantId: variantId as string | undefined,
              name: product.name,
              price: price,
              image: image,
              quantity: parseInt(qtyStr as string) || 1,
              variants: variantAttrs,
            });
          }
        } catch (error) {
          console.error("Error fetching single product for checkout:", error);
        } finally {
          setIsFetchingSingle(false);
        }
      };
      fetchSingleProduct();
    }
  }, [mode, productId, variantId, qtyStr]);

  const checkoutItems =
    mode === "single" && singleItem ? [singleItem] : cartItems;
  const checkoutSubtotal =
    mode === "single" && singleItem
      ? singleItem.price * singleItem.quantity
      : subtotal;
  const checkoutShipping = checkoutItems.length > 0 ? 30000 : 0;
  const checkoutTotal = checkoutSubtotal + checkoutShipping;

  // Address
  const [defaultAddress, setDefaultAddress] = useState<Address | null>(null);
  const [addressLoading, setAddressLoading] = useState(true);

  // Payment
  const [paymentMethod, setPaymentMethod] = useState("COD");

  // Coupon
  const [couponInput, setCouponInput] = useState("");
  const [discount, setDiscount] = useState(0);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);

  // Order placing
  const [placing, setPlacing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const successAnim = React.useRef(new Animated.Value(0)).current;

  // ── Load default address ──────────────────────────────────────
  const loadAddress = useCallback(async () => {
    if (!user?._id) return;
    setAddressLoading(true);
    const addresses = await getAddresses(user._id);
    const def = addresses.find((a) => a.isDefault) ?? addresses[0] ?? null;
    setDefaultAddress(def);
    setAddressLoading(false);
  }, [user?._id]);

  useFocusEffect(
    useCallback(() => {
      loadAddress();
    }, [loadAddress]),
  );

  // ── Coupon Logic ──────────────────────────────────────────────
  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;

    setIsValidatingCoupon(true);
    const result = await validateCoupon(couponInput, checkoutSubtotal);
    setIsValidatingCoupon(false);

    if (result.valid && result.coupon) {
      setAppliedCoupon(result.coupon);
      let calculatedDiscount = 0;
      if (result.coupon.discountType === "PERCENTAGE") {
        calculatedDiscount =
          (checkoutSubtotal * result.coupon.discountValue) / 100;
        if (result.coupon.maxDiscountAmount) {
          calculatedDiscount = Math.min(
            calculatedDiscount,
            result.coupon.maxDiscountAmount,
          );
        }
      } else {
        calculatedDiscount = result.coupon.discountValue;
      }
      setDiscount(calculatedDiscount);
      Alert.alert("Thành công", `Đã áp dụng mã ${result.coupon.code}`);
    } else {
      Alert.alert("Lỗi", result.message || "Mã giảm giá không hợp lệ");
      setAppliedCoupon(null);
      setDiscount(0);
    }
  };

  // ── Place order ───────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    if (!defaultAddress) {
      Alert.alert(
        "Thiếu địa chỉ",
        "Vui lòng thêm hoặc chọn địa chỉ nhận hàng.",
      );
      return;
    }
    if (checkoutItems.length === 0) {
      Alert.alert(
        "Giỏ hàng trống",
        "Vui lòng thêm sản phẩm trước khi đặt hàng.",
      );
      return;
    }

    if (paymentMethod === "CRYPTO") {
      router.push({
        pathname: "/checkout/blockchain-payment",
        params: {
          total: grandTotal,
          mode: mode || "cart",
          productId: productId || "",
          variantId: variantId || "",
          quantity: qtyStr || "",
          shippingAddressId: defaultAddress._id,
          couponId: appliedCoupon?.code || "",
        },
      } as any);
      return;
    }

    setPlacing(true);
    try {
      // Chuẩn bị payload
      const payload = {
        items: checkoutItems.map((item: any) => ({
          productId: item.productId,
          variantId:
            item.variantId &&
            item.variantId !== "undefined" &&
            item.variantId !== "null" &&
            item.variantId !== ""
              ? item.variantId
              : undefined,
          quantity: item.quantity,
        })),
        shippingAddressId: defaultAddress._id,
        paymentMethod,
        couponId: appliedCoupon?.code,
      };

      const order = await createOrder(user!._id, payload);

      if (mode !== "single") {
        await clearCart();
      }
      setPlacing(false);

      if (!order) {
        throw new Error("Không thể tạo đơn hàng");
      }

      // Route theo phương thức thanh toán
      if (paymentMethod === "BANKING") {
        router.push({
          pathname: "/checkout/bank-selection",
          params: { total: grandTotal, orderId: order._id },
        } as any);
        return;
      }

      if (paymentMethod === "VNPAY") {
        try {
          const response = await api.post(`/payments/vnpay/create?userId=${user!._id}`, {
            orderId: order._id,
          });

          if (response.data?.success && response.data?.data?.paymentUrl) {
            await Linking.openURL(response.data.data.paymentUrl);
            router.push({
              pathname: "/checkout/waiting-payment",
              params: { orderId: order._id },
            } as any);
          } else {
            Alert.alert("Lỗi thanh toán", response.data?.message || "Không thể khởi tạo thanh toán VNPay");
          }
        } catch (vnpayErr: any) {
          console.warn("Lỗi VNPay URL generation:", vnpayErr);
          Alert.alert("Lỗi cổng thanh toán", "Không thể liên kết đến VNPay. Vui lòng thanh toán lại từ lịch sử đơn hàng.");
        }
        return;
      }

      // COD -> Hiện thông báo thành công
      setShowSuccess(true);
      Animated.spring(successAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    } catch (error: any) {
      setPlacing(false);
      Alert.alert(
        "Lỗi",
        error?.response?.data?.message ||
          error.message ||
          "Có lỗi xảy ra khi tạo đơn hàng",
      );
    }
  };

  const grandTotal = checkoutTotal - discount;

  // ─── Loading state ────────────────────────────────────────────
  if (cartLoading || addressLoading || isFetchingSingle) {
    return (
      <SafeAreaView style={{ flex: 1 }} className="bg-zinc-50 dark:bg-zinc-950">
        <Stack.Screen options={{ headerShown: false }} />
        <Header title="Thanh toán" />
        <Box className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#EAB308" />
        </Box>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-zinc-50 dark:bg-zinc-950">
      <Stack.Screen options={{ headerShown: false }} />
      <Header title="Thanh toán" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 160,
        }}
      >
        {/* ── 1. SHIPPING ADDRESS ── */}
        <VStack className="mb-7">
          <SectionLabel label="Địa chỉ nhận hàng" />
          <Pressable
            onPress={() => router.push("/address/my-addresses" as any)}
            className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden"
          >
            {defaultAddress ? (
              <HStack className="p-5 items-center">
                <Box className="w-11 h-11 rounded-2xl bg-yellow-100 dark:bg-yellow-900/30 items-center justify-center mr-4">
                  <Icon as={MapPin} className="text-yellow-600 w-5 h-5" />
                </Box>
                <VStack className="flex-1">
                  <HStack className="items-center space-x-2 gap-2 mb-0.5">
                    <Text className="text-sm font-black text-zinc-900 dark:text-white">
                      {defaultAddress.fullName}
                    </Text>
                    <Box className="bg-yellow-500 px-1.5 py-0.5 rounded-md">
                      <Text className="text-[9px] font-black text-zinc-900">
                        MẶC ĐỊNH
                      </Text>
                    </Box>
                  </HStack>
                  <Text className="text-xs text-zinc-500 mb-0.5">
                    {defaultAddress.phone}
                  </Text>
                  <Text
                    className="text-xs text-zinc-400 leading-relaxed"
                    numberOfLines={2}
                  >
                    {defaultAddress.street}, {defaultAddress.ward},{" "}
                    {defaultAddress.city}
                  </Text>
                </VStack>
                <Icon
                  as={ChevronRight}
                  className="text-zinc-300 w-5 h-5 ml-3"
                />
              </HStack>
            ) : (
              <HStack className="p-5 items-center">
                <Box className="w-11 h-11 rounded-2xl bg-red-50 dark:bg-red-900/20 items-center justify-center mr-4">
                  <Icon as={AlertCircle} className="text-red-400 w-5 h-5" />
                </Box>
                <VStack className="flex-1">
                  <Text className="text-sm font-bold text-zinc-900 dark:text-white">
                    Chưa có địa chỉ giao hàng
                  </Text>
                  <Text className="text-xs text-red-400 mt-0.5">
                    Nhấn để thêm địa chỉ mới
                  </Text>
                </VStack>
                <Icon
                  as={ChevronRight}
                  className="text-zinc-300 w-5 h-5 ml-3"
                />
              </HStack>
            )}
          </Pressable>
        </VStack>

        {/* ── 2. ORDER ITEMS ── */}
        <VStack className="mb-7">
          <SectionLabel label={`Sản phẩm (${checkoutItems.length})`} />
          <VStack className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden">
            {checkoutItems.length === 0 ? (
              <VStack className="items-center py-10 space-y-3 gap-3">
                <Icon
                  as={ShoppingBag}
                  className="text-zinc-200 dark:text-zinc-700 w-12 h-12"
                />
                <Text className="text-zinc-400 text-sm">
                  Chưa có sản phẩm nào
                </Text>
              </VStack>
            ) : (
              checkoutItems.map((item, index) => (
                <React.Fragment key={item.id}>
                  <HStack className="p-4 items-center space-x-4 gap-4">
                    <Image
                      source={{ uri: item.image }}
                      style={{
                        width: 72,
                        height: 72,
                        borderRadius: 16,
                        backgroundColor: "#f4f4f5",
                      }}
                    />
                    <VStack className="flex-1 space-y-1 gap-1">
                      <Text
                        className="text-sm font-bold text-zinc-900 dark:text-white leading-snug"
                        numberOfLines={2}
                      >
                        {item.name}
                      </Text>
                      {/* Variants */}
                      {item.variants &&
                        Object.keys(item.variants).length > 0 && (
                          <HStack className="flex-wrap gap-1">
                            {Object.entries(item.variants).map(([k, v]) => (
                              <Box
                                key={k}
                                className="bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-lg"
                              >
                                <Text className="text-[10px] text-zinc-500 font-bold">
                                  {String(v)}
                                </Text>
                              </Box>
                            ))}
                          </HStack>
                        )}
                      <HStack className="justify-between items-center mt-1">
                        <Text className="text-sm font-black text-yellow-600">
                          {formatPrice(item.price)}
                        </Text>
                        <Box className="bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-xl">
                          <Text className="text-xs font-black text-zinc-600 dark:text-zinc-300">
                            x{item.quantity}
                          </Text>
                        </Box>
                      </HStack>
                    </VStack>
                  </HStack>
                  {index < checkoutItems.length - 1 && (
                    <Box className="h-px bg-zinc-50 dark:bg-zinc-800 mx-4" />
                  )}
                </React.Fragment>
              ))
            )}
          </VStack>
        </VStack>

        {/* ── 3. PAYMENT METHOD ── */}
        <VStack className="mb-7">
          <SectionLabel label="Phương thức thanh toán" />
          <VStack className="space-y-3 gap-3">
            {PAYMENT_METHODS.map((method) => {
              const isSelected = paymentMethod === method.id;
              return (
                <Pressable
                  key={method.id}
                  onPress={() => setPaymentMethod(method.id)}
                  className={`p-4 rounded-3xl border-2 flex-row items-center ${
                    isSelected
                      ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10"
                      : "border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                  }`}
                >
                  <Box
                    className={`w-11 h-11 rounded-2xl items-center justify-center mr-4 ${
                      isSelected
                        ? "bg-yellow-500"
                        : "bg-zinc-100 dark:bg-zinc-800"
                    }`}
                  >
                    <Icon
                      as={method.icon}
                      className={isSelected ? "text-zinc-900" : "text-zinc-400"}
                      size="md"
                    />
                  </Box>
                  <VStack className="flex-1">
                    <HStack className="items-center space-x-2 gap-2">
                      <Text
                        className={`text-sm font-black ${
                          isSelected
                            ? "text-zinc-900 dark:text-yellow-400"
                            : "text-zinc-600 dark:text-zinc-300"
                        }`}
                      >
                        {method.label}
                      </Text>
                      {method.badge && (
                        <Box className="bg-red-500 px-1.5 py-0.5 rounded-md">
                          <Text className="text-[9px] font-black text-white">
                            {method.badge}
                          </Text>
                        </Box>
                      )}
                    </HStack>
                    <Text className="text-[11px] text-zinc-400 mt-0.5">
                      {method.sub}
                    </Text>
                  </VStack>
                  {isSelected && (
                    <Icon
                      as={CheckCircle2}
                      className="text-yellow-500 w-5 h-5 ml-2"
                    />
                  )}
                </Pressable>
              );
            })}
          </VStack>
        </VStack>

        {/* ── 4. COUPON CODE ── */}
        <VStack className="mb-7">
          <SectionLabel label="Mã giảm giá" />
          <HStack className="space-x-3 gap-3">
            <Input className="flex-1 h-14 rounded-2xl border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2">
              <InputSlot className="pl-4">
                <Icon as={Tag} className="text-zinc-400 w-5 h-5" />
              </InputSlot>
              <InputField
                placeholder="Nhập mã giảm giá..."
                value={couponInput}
                onChangeText={setCouponInput}
                autoCapitalize="characters"
                className="text-zinc-900 dark:text-white font-bold"
              />
            </Input>
            <Button
              onPress={handleApplyCoupon}
              disabled={isValidatingCoupon || !couponInput.trim()}
              className="bg-zinc-900 dark:bg-zinc-800 h-14 px-6 rounded-2xl"
            >
              {isValidatingCoupon ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <ButtonText className="text-white font-bold">
                  Áp dụng
                </ButtonText>
              )}
            </Button>
          </HStack>
          {appliedCoupon && (
            <HStack className="mt-2 items-center space-x-2 gap-2 ml-1">
              <CheckCircle2 size={14} className="text-green-500" />
              <Text className="text-xs text-green-500 font-medium">
                Đã áp dụng mã: {appliedCoupon.code}
              </Text>
              <Pressable
                onPress={() => {
                  setAppliedCoupon(null);
                  setDiscount(0);
                  setCouponInput("");
                }}
              >
                <Text className="text-xs text-red-500 font-bold ml-2">
                  Gỡ bỏ
                </Text>
              </Pressable>
            </HStack>
          )}
        </VStack>

        {/* ── 4. DELIVERY INFO ── */}
        <VStack className="mb-7">
          <SectionLabel label="Thông tin vận chuyển" />
          <Box className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm p-5">
            <HStack className="items-center space-x-4 gap-4">
              <Box className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-900/20 items-center justify-center">
                <Icon as={Truck} className="text-blue-500 w-5 h-5" />
              </Box>
              <VStack className="flex-1">
                <Text className="text-sm font-black text-zinc-900 dark:text-white">
                  Giao hàng tiêu chuẩn
                </Text>
                <Text className="text-xs text-zinc-400 mt-0.5">
                  Dự kiến nhận hàng trong 2–4 ngày
                </Text>
              </VStack>
              <Text className="text-sm font-black text-zinc-700 dark:text-zinc-200">
                {checkoutShipping === 0
                  ? "Miễn phí"
                  : formatPrice(checkoutShipping)}
              </Text>
            </HStack>
          </Box>
        </VStack>

        {/* Note */}
        <HStack className="items-start space-x-2 gap-2 px-1 mb-6">
          <Icon as={Package} className="text-zinc-300 w-4 h-4 mt-0.5" />
          <Text className="text-xs text-zinc-400 flex-1 leading-relaxed">
            Bằng cách đặt hàng, bạn đồng ý với{" "}
            <Text className="text-yellow-600 font-bold">
              Điều khoản sử dụng
            </Text>{" "}
            và{" "}
            <Text className="text-yellow-600 font-bold">
              Chính sách bảo mật
            </Text>{" "}
            của chúng tôi.
          </Text>
        </HStack>
      </ScrollView>

      {/* ── STICKY PLACE ORDER BUTTON ── */}
      <Box className="absolute bottom-0 left-0 right-0 bg-white dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-800 shadow-2xl">
        <VStack className="px-6 pt-5 pb-8 space-y-4 gap-4">
          {/* Detailed Summary in sticky footer */}
          <VStack className="space-y-2 gap-2">
            <HStack className="justify-between">
              <Text className="text-xs text-zinc-500">
                Tạm tính ({checkoutItems.length} sản phẩm)
              </Text>
              <Text className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                {formatPrice(checkoutSubtotal)}
              </Text>
            </HStack>
            <HStack className="justify-between">
              <Text className="text-xs text-zinc-500">Phí vận chuyển</Text>
              <Text className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                {checkoutShipping === 0
                  ? "Miễn phí"
                  : `+${formatPrice(checkoutShipping)}`}
              </Text>
            </HStack>
            {discount > 0 && (
              <HStack className="justify-between">
                <Text className="text-xs text-zinc-500">Giảm giá</Text>
                <Text className="text-xs font-bold text-green-600">
                  -{formatPrice(discount)}
                </Text>
              </HStack>
            )}
          </VStack>

          <Box className="h-px bg-zinc-100 dark:bg-zinc-800" />

          <HStack className="justify-between items-center">
            <VStack>
              <Text className="text-[10px] uppercase font-black text-zinc-400 tracking-tighter">
                Tổng cộng
              </Text>
              <Text className="text-xl font-black text-yellow-600">
                {formatPrice(grandTotal)}
              </Text>
            </VStack>
            <Button
              onPress={handlePlaceOrder}
              disabled={placing || checkoutItems.length === 0}
              className="bg-yellow-500 h-14 px-8 rounded-2xl shadow-lg active:opacity-90 disabled:opacity-50"
            >
              {placing ? (
                <ActivityIndicator color="#18181b" />
              ) : (
                <ButtonText className="text-zinc-900 font-black text-base uppercase tracking-wider">
                  Đặt hàng
                </ButtonText>
              )}
            </Button>
          </HStack>
        </VStack>
      </Box>

      {/* ── SUCCESS MODAL ── */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <Box className="flex-1 bg-black/80 items-center justify-center px-8">
          <Animated.View
            style={{
              transform: [{ scale: successAnim }],
              opacity: successAnim,
            }}
            className="bg-white dark:bg-zinc-900 w-full p-10 rounded-[48px] items-center"
          >
            <Box className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 items-center justify-center mb-6">
              <Icon as={CheckCircle2} className="text-green-500 w-12 h-12" />
            </Box>
            <Text className="text-2xl font-black text-zinc-900 dark:text-white text-center mb-2 uppercase tracking-tighter">
              Đặt hàng thành công!
            </Text>
            <Text className="text-sm text-zinc-500 text-center mb-2 leading-relaxed">
              Cảm ơn bạn đã tin tưởng{"\n"}Think hearT DIGITAL.
            </Text>
            <Text className="text-xs text-zinc-400 text-center mb-8">
              Đơn hàng đang được xử lý và sẽ sớm được giao đến bạn.
            </Text>

            <VStack className="w-full space-y-3 gap-3">
              <Button
                onPress={() => {
                  setShowSuccess(false);
                  router.replace("/(tabs)/home" as any);
                }}
                className="bg-zinc-900 dark:bg-yellow-500 w-full h-14 rounded-2xl"
              >
                <ButtonText className="text-white dark:text-zinc-900 font-bold uppercase">
                  Về trang chủ
                </ButtonText>
              </Button>
              <Button
                onPress={() => {
                  setShowSuccess(false);
                  router.replace("/(tabs)/home" as any);
                  setTimeout(() => {
                    router.push("/profile/order-history" as any);
                  }, 100);
                }}
                className="bg-zinc-100 dark:bg-zinc-800 w-full h-14 rounded-2xl"
              >
                <ButtonText className="text-zinc-700 dark:text-zinc-200 font-bold">
                  Xem đơn hàng của tôi
                </ButtonText>
              </Button>
            </VStack>
          </Animated.View>
        </Box>
      </Modal>
    </SafeAreaView>
  );
};

export default CheckoutScreen;
