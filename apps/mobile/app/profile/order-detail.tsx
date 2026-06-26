import React, { useState, useEffect } from "react";
import {
  ScrollView,
  ActivityIndicator,
  View,
  Image,
  Alert,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack, useLocalSearchParams, useFocusEffect } from "expo-router";
import Header from "@/components/Header";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Icon } from "@/components/ui/icon";
import { Pressable } from "@/components/ui/pressable";
import { Button, ButtonText } from "@/components/ui/button";
import {
  Clock,
  CheckCircle2,
  Package,
  XCircle,
  MapPin,
  CreditCard,
  Receipt,
  Star,
  AlertCircle,
  Video,
} from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";
import { getOrderById, confirmOrderReceipt, type Order } from "@/services/order.service";
import { checkReviewed } from "@/services/review.service";
import api from "@/services/api";

const formatPrice = (price: number) => price.toLocaleString("vi-VN") + "₫";

const formatDate = (dateString: string) => {
  const d = new Date(dateString);
  return (
    d.toLocaleDateString("vi-VN") +
    " " +
    d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
  );
};

const getStatusConfig = (status: string) => {
  switch (status) {
    case "PENDING":
      return {
        label: "Chờ xử lý",
        icon: Clock,
        color: "text-orange-500",
        bg: "bg-orange-100 dark:bg-orange-900/30",
        desc: "Đơn hàng đang chờ được xác nhận.",
      };
    case "PROCESSING":
      return {
        label: "Đang chuẩn bị",
        icon: Package,
        color: "text-blue-500",
        bg: "bg-blue-100 dark:bg-blue-900/30",
        desc: "Người bán đang chuẩn bị hàng.",
      };
    case "SHIPPING":
      return {
        label: "Đang giao",
        icon: Package,
        color: "text-indigo-500",
        bg: "bg-indigo-100 dark:bg-indigo-900/30",
        desc: "Đơn hàng đang trên đường giao đến bạn.",
      };
    case "DELIVERED":
      return {
        label: "Hoàn thành",
        icon: CheckCircle2,
        color: "text-green-500",
        bg: "bg-green-100 dark:bg-green-900/30",
        desc: "Đơn hàng đã được giao thành công.",
      };
    case "RETURN_REQUESTED":
      return {
        label: "Chờ trả hàng",
        icon: Clock,
        color: "text-orange-500",
        bg: "bg-orange-100 dark:bg-orange-900/30",
        desc: "Yêu cầu trả hàng hoàn tiền đang chờ xác nhận.",
      };
    case "RETURNED":
      return {
        label: "Đã trả hàng",
        icon: XCircle,
        color: "text-red-500",
        bg: "bg-red-100 dark:bg-red-900/30",
        desc: "Đơn hàng đã được hoàn trả thành công.",
      };
    case "CANCELLED":
      return {
        label: "Đã hủy",
        icon: XCircle,
        color: "text-red-500",
        bg: "bg-red-100 dark:bg-red-900/30",
        desc: "Đơn hàng đã bị hủy.",
      };
    default:
      return {
        label: status,
        icon: Clock,
        color: "text-zinc-500",
        bg: "bg-zinc-100 dark:bg-zinc-800",
        desc: "",
      };
  }
};

const SectionLabel = ({ label }: { label: string }) => (
  <Text className="text-[11px] font-black text-zinc-400 uppercase tracking-widest mb-3 ml-1">
    {label}
  </Text>
);

const OrderDetailScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewedItems, setReviewedItems] = useState<Record<string, boolean>>({});
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [payNowLoading, setPayNowLoading] = useState(false);

  const fetchOrder = async () => {
    if (!id || !user) return;
    try {
      const data = await getOrderById(id, user._id);
      setOrder(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchOrder();
    }, [id, user])
  );

  useEffect(() => {
    if (!order || !user) return;
    if (order.orderStatus !== "DELIVERED") return;

    const checkAllReviews = async () => {
      const checked: Record<string, boolean> = {};
      await Promise.all(
        order.items.map(async (item) => {
          try {
            const hasReviewed = await checkReviewed(user._id, item.productId);
            checked[item.productId] = hasReviewed;
          } catch (e) {
            checked[item.productId] = false;
          }
        })
      );
      setReviewedItems(checked);
    };

    checkAllReviews();
  }, [order, user]);

  const handleConfirmReceipt = async () => {
    if (!id || !user) return;
    Alert.alert(
      "Xác nhận nhận hàng",
      "Bạn có chắc chắn đã nhận được đơn hàng này và muốn hoàn thành đơn hàng?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Đồng ý",
          onPress: async () => {
            setConfirmLoading(true);
            try {
              const updatedOrder = await confirmOrderReceipt(id, user._id);
              if (updatedOrder) {
                Alert.alert("Thành công", "Đơn hàng đã được xác nhận hoàn thành!");
                fetchOrder();
              }
            } catch (error: any) {
              const msg = error?.response?.data?.message || "Xác nhận nhận hàng thất bại. Vui lòng thử lại sau.";
              Alert.alert("Lỗi", msg);
            } finally {
              setConfirmLoading(false);
            }
          },
        },
      ]
    );
  };

  const handlePayNow = async () => {
    if (!order || !user) return;

    if (order.paymentMethod === "CRYPTO") {
      router.push({
        pathname: "/checkout/blockchain-payment",
        params: {
          total: order.totalAmount,
          orderId: order._id,
          mode: "retry",
        },
      } as any);
      return;
    }

    if (order.paymentMethod === "BANKING") {
      router.push({
        pathname: "/checkout/bank-selection",
        params: { total: order.totalAmount, orderId: order._id },
      } as any);
      return;
    }

    if (order.paymentMethod === "VNPAY") {
      setPayNowLoading(true);
      try {
        const response = await api.post(`/payments/vnpay/create?userId=${user._id}`, {
          orderId: order._id,
        });

        if (response.data?.success && response.data?.data?.paymentUrl) {
          // Mở cổng thanh toán VNPay
          await Linking.openURL(response.data.data.paymentUrl);
          // Đi đến màn hình Polling chờ kết quả
          router.push({
            pathname: "/checkout/waiting-payment",
            params: { orderId: order._id },
          } as any);
        } else {
          Alert.alert("Lỗi thanh toán", response.data?.message || "Không thể khởi tạo thanh toán VNPay");
        }
      } catch (err: any) {
        console.warn("Lỗi khởi tạo thanh toán VNPay:", err);
        Alert.alert("Lỗi", "Không thể tạo liên kết thanh toán VNPay. Vui lòng thử lại sau.");
      } finally {
        setPayNowLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1 }} className="bg-zinc-50 dark:bg-zinc-950">
        <Stack.Screen options={{ headerShown: false }} />
        <Header title="Chi tiết đơn hàng" />
        <Box className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#EAB308" />
        </Box>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={{ flex: 1 }} className="bg-zinc-50 dark:bg-zinc-950">
        <Stack.Screen options={{ headerShown: false }} />
        <Header title="Chi tiết đơn hàng" />
        <Box className="flex-1 items-center justify-center p-8">
          <Text className="text-zinc-500 text-center font-bold">
            Không tìm thấy đơn hàng
          </Text>
        </Box>
      </SafeAreaView>
    );
  }

  const statusConf = getStatusConfig(order.orderStatus);

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-zinc-50 dark:bg-zinc-950">
      <Stack.Screen options={{ headerShown: false }} />
      <Header title="Chi tiết đơn hàng" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 40,
        }}
      >
        {/* Status Header */}
        <VStack
          className={`mb-7 p-5 rounded-3xl ${statusConf.bg} border border-transparent`}
        >
          <HStack className="items-center space-x-3 gap-3 mb-2">
            <Icon
              as={statusConf.icon}
              className={`${statusConf.color} w-6 h-6`}
            />
            <Text
              className={`text-lg font-black uppercase ${statusConf.color}`}
            >
              {statusConf.label}
            </Text>
          </HStack>
          <Text
            className={`text-xs font-medium ${statusConf.color} opacity-80 leading-relaxed`}
          >
            {statusConf.desc}
          </Text>
          {order.orderStatus === "CANCELLED" &&
            (() => {
              const cancelHistory = order.statusHistory?.find(
                (h: any) => h.status === "CANCELLED",
              );
              if (cancelHistory && cancelHistory.note) {
                return (
                  <View className="mt-3 pt-3 border-t border-red-200 dark:border-red-800/40">
                    <Text className="text-xs font-black text-red-700 dark:text-red-400 uppercase tracking-wide">
                      Lý do hủy đơn:
                    </Text>
                    <Text className="text-xs text-red-600 dark:text-red-400 mt-1 italic font-medium">
                      "{cancelHistory.note}"
                    </Text>
                  </View>
                );
              }
              return null;
            })()}
        </VStack>

        {/* Order Info */}
        <VStack className="mb-7 bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
          <HStack className="justify-between items-center mb-3">
            <Text className="text-xs text-zinc-500">Mã đơn hàng</Text>
            <Text className="text-sm font-black text-zinc-900 dark:text-white uppercase">
              {order.orderId}
            </Text>
          </HStack>
          <HStack className="justify-between items-center mb-3">
            <Text className="text-xs text-zinc-500">Ngày đặt</Text>
            <Text className="text-sm font-bold text-zinc-900 dark:text-zinc-300">
              {formatDate(order.createdAt)}
            </Text>
          </HStack>
          <HStack className="justify-between items-center">
            <Text className="text-xs text-zinc-500">Phương thức TT</Text>
            <Text className="text-sm font-bold text-zinc-900 dark:text-zinc-300">
              {order.paymentMethod} • {order.paymentStatus}
            </Text>
          </HStack>
        </VStack>

        {/* Shipping Address */}
        <VStack className="mb-7">
          <SectionLabel label="Địa chỉ nhận hàng" />
          <Box className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm p-5">
            <HStack className="items-start space-x-4 gap-4">
              <Box className="w-10 h-10 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 items-center justify-center mt-1">
                <Icon as={MapPin} className="text-yellow-600 w-5 h-5" />
              </Box>
              <VStack className="flex-1 space-y-1 gap-1">
                <Text className="text-sm font-black text-zinc-900 dark:text-white">
                  {order.shippingAddressSnapshot.fullName}
                </Text>
                <Text className="text-xs text-zinc-500">
                  {order.shippingAddressSnapshot.phone}
                </Text>
                <Text className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mt-1">
                  {order.shippingAddressSnapshot.street},{" "}
                  {order.shippingAddressSnapshot.ward},{" "}
                  {order.shippingAddressSnapshot.district},{" "}
                  {order.shippingAddressSnapshot.province}
                </Text>
                {order.shippingAddressSnapshot.note && (
                  <Text className="text-xs text-zinc-400 italic mt-1">
                    Ghi chú: {order.shippingAddressSnapshot.note}
                  </Text>
                )}
              </VStack>
            </HStack>
          </Box>
        </VStack>

        {/* Order Items */}
        <VStack className="mb-7">
          <SectionLabel label="Sản phẩm" />
          <VStack className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden">
            {order.items.map((item, index) => (
              <React.Fragment key={index}>
                <HStack className="p-4 items-center space-x-4 gap-4">
                  <Image
                    source={{ uri: item.productSnapshot.image }}
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 12,
                      backgroundColor: "#f4f4f5",
                    }}
                  />
                  <VStack className="flex-1 space-y-1 gap-1">
                    <Text
                      className="text-sm font-bold text-zinc-900 dark:text-white leading-snug"
                      numberOfLines={2}
                    >
                      {item.productSnapshot.name}
                    </Text>
                    {item.productSnapshot.variantName && (
                      <Text className="text-[11px] text-zinc-500 font-medium">
                        Phân loại: {item.productSnapshot.variantName}
                      </Text>
                    )}
                    <HStack className="justify-between items-center mt-1">
                      <Text className="text-sm font-black text-yellow-600">
                        {formatPrice(item.unitPrice)}
                      </Text>
                      <Text className="text-xs font-black text-zinc-500">
                        x{item.quantity}
                      </Text>
                    </HStack>
                  </VStack>
                </HStack>
                {index < order.items.length - 1 && (
                  <Box className="h-px bg-zinc-50 dark:bg-zinc-800 mx-4" />
                )}
              </React.Fragment>
            ))}
          </VStack>
        </VStack>

        {/* Return Details Info */}
        {(order.orderStatus === "RETURN_REQUESTED" || order.orderStatus === "RETURNED") && (
          <VStack className="mb-7 bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
            <HStack className="items-center space-x-2 gap-2 mb-4">
              <Icon
                as={AlertCircle}
                className="text-red-500 w-5 h-5"
              />
              <Text className="text-sm font-black text-zinc-900 dark:text-white uppercase">
                Thông tin hoàn trả
              </Text>
            </HStack>
            <VStack className="space-y-2 gap-2 text-sm">
              <Text className="text-xs text-zinc-500">
                Lý do: <Text className="font-bold text-zinc-800 dark:text-zinc-200">{order.returnReason || "N/A"}</Text>
              </Text>
              <Text className="text-xs text-zinc-500">
                Chi tiết vấn đề: <Text className="font-medium text-zinc-800 dark:text-zinc-200">{order.returnProblem || "N/A"}</Text>
              </Text>
              
              {/* Evidence Images */}
              {order.returnImages && order.returnImages.length > 0 && (
                <VStack className="mt-2">
                  <Text className="text-xs text-zinc-500 mb-2">Hình ảnh bằng chứng:</Text>
                  <HStack className="gap-2 flex-wrap">
                    {order.returnImages.map((img: string, index: number) => (
                      <Image
                        key={index}
                        source={{ uri: img }}
                        style={{ width: 60, height: 60, borderRadius: 8, backgroundColor: "#f4f4f5" }}
                        resizeMode="cover"
                      />
                    ))}
                  </HStack>
                </VStack>
              )}

              {/* Evidence Videos */}
              {order.returnVideos && order.returnVideos.length > 0 && (
                <VStack className="mt-2">
                  <Text className="text-xs text-zinc-500 mb-2">Video bằng chứng:</Text>
                  <HStack className="gap-2">
                    {order.returnVideos.map((vid: string, index: number) => (
                      <Box key={index} className="bg-zinc-100 dark:bg-zinc-800 p-2 rounded-xl flex-row items-center space-x-2 gap-2">
                        <Icon as={Video} className="text-zinc-500 w-4 h-4" />
                        <Text className="text-[10px] text-zinc-600 dark:text-zinc-400 font-bold">Video #{index + 1}</Text>
                      </Box>
                    ))}
                  </HStack>
                </VStack>
              )}
            </VStack>
          </VStack>
        )}

        {/* Payment Summary */}
        <VStack className="mb-7 bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
          <HStack className="items-center space-x-2 gap-2 mb-4">
            <Icon
              as={Receipt}
              className="text-zinc-800 dark:text-zinc-200 w-5 h-5"
            />
            <Text className="text-sm font-black text-zinc-900 dark:text-white uppercase">
              Thanh toán
            </Text>
          </HStack>

          <VStack className="space-y-3 gap-3 mb-4">
            <HStack className="justify-between">
              <Text className="text-xs text-zinc-500">Tổng tiền hàng</Text>
              <Text className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                {formatPrice(order.subtotal)}
              </Text>
            </HStack>
            <HStack className="justify-between">
              <Text className="text-xs text-zinc-500">Phí vận chuyển</Text>
              <Text className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                {order.shippingFee === 0
                  ? "Miễn phí"
                  : formatPrice(order.shippingFee)}
              </Text>
            </HStack>
            {order.discount > 0 && (
              <HStack className="justify-between">
                <Text className="text-xs text-zinc-500">Giảm giá</Text>
                <Text className="text-xs font-bold text-green-600">
                  -{formatPrice(order.discount)}
                </Text>
              </HStack>
            )}
          </VStack>

          <Box className="h-px bg-zinc-100 dark:bg-zinc-800 mb-4" />

          <HStack className="justify-between items-center">
            <Text className="text-sm font-black text-zinc-900 dark:text-white uppercase">
              Thành tiền
            </Text>
            <Text className="text-xl font-black text-yellow-600">
              {formatPrice(order.totalAmount)}
            </Text>
          </HStack>
        </VStack>

        {/* Confirm Receipt Button (only for SHIPPING orders) */}
        {order.orderStatus === "SHIPPING" && (
          <Button
            onPress={handleConfirmReceipt}
            disabled={confirmLoading}
            className="w-full h-14 bg-green-500 rounded-2xl active:bg-green-600 shadow-sm mb-7"
          >
            {confirmLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <ButtonText className="text-white font-bold text-base">
                Đã nhận được hàng
              </ButtonText>
            )}
          </Button>
        )}

        {/* Pay Now Button (for unpaid pending orders) */}
        {order.orderStatus === "PENDING" &&
          order.paymentStatus === "PENDING" &&
          order.paymentMethod !== "COD" && (
            <Button
              onPress={handlePayNow}
              disabled={payNowLoading}
              className="w-full h-14 bg-yellow-500 rounded-2xl active:bg-yellow-600 shadow-sm mb-7"
            >
              {payNowLoading ? (
                <ActivityIndicator size="small" color="#18181b" />
              ) : (
                <ButtonText className="text-zinc-900 font-extrabold text-base">
                  THANH TOÁN NGAY
                </ButtonText>
              )}
            </Button>
          )}

        {/* Return request button (only for DELIVERED orders within 5 days) */}
        {order.orderStatus === "DELIVERED" && (() => {
          const deliveredHistory = order.statusHistory?.find(
            (h: any) => h.status === "DELIVERED"
          );
          const deliveryDate = deliveredHistory
            ? new Date(deliveredHistory.changedAt)
            : new Date(order.updatedAt || order.createdAt);
          const isWithin5Days = Date.now() - deliveryDate.getTime() <= 5 * 24 * 60 * 60 * 1000;
          
          if (isWithin5Days) {
            return (
              <Button
                onPress={() => {
                  router.push({
                    pathname: "/profile/return-order" as any,
                    params: { orderId: order._id },
                  });
                }}
                className="w-full h-14 bg-red-500 rounded-2xl active:bg-red-600 shadow-sm mb-7"
              >
                <ButtonText className="text-white font-bold text-base">
                  YÊU CẦU TRẢ HÀNG / HOÀN TIỀN
                </ButtonText>
              </Button>
            );
          }
          return null;
        })()}

        {/* Review Button (only for DELIVERED orders) */}
        {order.orderStatus === "DELIVERED" && (
          <VStack className="mb-7">
            <SectionLabel label="Đánh giá sản phẩm" />

            {(() => {
              const unreviewedList = order.items.filter(
                (item) => !reviewedItems[item.productId]
              );
              if (unreviewedList.length > 1) {
                return (
                  <Button
                    onPress={() => {
                      router.push({
                        pathname: "/profile/write-review" as any,
                        params: {
                          orderId: order._id,
                          productIds: unreviewedList
                            .map((item) => item.productId)
                            .join(","),
                          productNames: unreviewedList
                            .map((item) => item.productSnapshot.name)
                            .join(";"),
                          productImages: unreviewedList
                            .map((item) => item.productSnapshot.image)
                            .join(";"),
                          mode: "all",
                        },
                      });
                    }}
                    className="mb-4 w-full h-12 bg-yellow-400 active:bg-yellow-500 rounded-2xl shadow-sm justify-center items-center"
                  >
                    <ButtonText className="text-zinc-900 font-bold text-sm">
                      Đánh giá chung tất cả sản phẩm ({unreviewedList.length})
                    </ButtonText>
                  </Button>
                );
              }
              return null;
            })()}

            <VStack className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden">
              {order.items.map((item, index) => {
                const isReviewed = !!reviewedItems[item.productId];
                return (
                  <Pressable
                    key={index}
                    disabled={isReviewed}
                    onPress={() =>
                      router.push({
                        pathname: "/profile/write-review" as any,
                        params: {
                          productId: item.productId as any,
                          orderId: (order as any)._id,
                          productName: item.productSnapshot.name,
                          productImage: item.productSnapshot.image,
                        },
                      })
                    }
                    className={`flex-row items-center p-4 active:bg-zinc-50 dark:active:bg-zinc-800 ${index < order.items.length - 1 ? "border-b border-zinc-50 dark:border-zinc-800" : ""}`}
                  >
                    <Image
                      source={{ uri: item.productSnapshot.image }}
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        backgroundColor: "#f4f4f5",
                      }}
                    />
                    <VStack className="flex-1 ml-3">
                      <Text
                        className="text-sm font-bold text-zinc-900 dark:text-white"
                        numberOfLines={1}
                      >
                        {item.productSnapshot.name}
                      </Text>
                      <HStack className="items-center space-x-1 gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Icon
                            key={s}
                            as={Star}
                            className={`w-3 h-3 ${isReviewed ? "text-yellow-500 fill-yellow-500" : "text-zinc-200 dark:text-zinc-700"}`}
                          />
                        ))}
                        <Text className={`text-[10px] ml-1 ${isReviewed ? "text-green-600 font-bold" : "text-zinc-400"}`}>
                          {isReviewed ? "Đã đánh giá" : "Chưa đánh giá"}
                        </Text>
                      </HStack>
                    </VStack>
                    <Box className={`px-3 py-2 rounded-xl ${isReviewed ? "bg-zinc-100 dark:bg-zinc-800" : "bg-yellow-400"}`}>
                      <Text className={`text-xs font-bold ${isReviewed ? "text-zinc-400" : "text-zinc-900"}`}>
                        {isReviewed ? "Đã đánh giá" : "Đánh giá"}
                      </Text>
                    </Box>
                  </Pressable>
                );
              })}
            </VStack>
          </VStack>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default OrderDetailScreen;
