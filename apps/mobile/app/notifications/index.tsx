import React, { useState, useEffect, useCallback } from "react";
import {
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Pressable } from "@/components/ui/pressable";
import { Icon } from "@/components/ui/icon";
import {
  ChevronLeft,
  Package,
  CreditCard,
  Gift,
  Bell,
  CheckCheck,
} from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";
import { useNotification } from "@/contexts/NotificationContext";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  NotificationItem,
} from "@/services/notification.service";

// ── Icon & màu theo loại thông báo ────────────────────────────────

const TYPE_CONFIG: Record<
  string,
  { icon: any; bg: string; iconColor: string }
> = {
  ORDER: {
    icon: Package,
    bg: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  PAYMENT: {
    icon: CreditCard,
    bg: "bg-green-100 dark:bg-green-900/30",
    iconColor: "text-green-600 dark:text-green-400",
  },
  PROMOTION: {
    icon: Gift,
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
    iconColor: "text-yellow-600 dark:text-yellow-500",
  },
  SYSTEM: {
    icon: Bell,
    bg: "bg-zinc-100 dark:bg-zinc-800",
    iconColor: "text-zinc-600 dark:text-zinc-400",
  },
  RECOMMENDATION: {
    icon: Gift,
    bg: "bg-purple-100 dark:bg-purple-900/30",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
  CRYPTO: {
    icon: CreditCard,
    bg: "bg-orange-100 dark:bg-orange-900/30",
    iconColor: "text-orange-600 dark:text-orange-400",
  },
  CHAT: {
    icon: Bell,
    bg: "bg-pink-100 dark:bg-pink-900/30",
    iconColor: "text-pink-600 dark:text-pink-400",
  },
};

// ── Format thời gian tương đối ─────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Hôm qua";
  if (days < 7) return `${days} ngày trước`;
  return new Date(dateStr).toLocaleDateString("vi-VN");
}

// ── Notification Item Component ────────────────────────────────────

const NotifItem = ({
  item,
  onPress,
}: {
  item: NotificationItem;
  onPress: (item: NotificationItem) => void;
}) => {
  const cfg = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.SYSTEM;
  const IconComp = cfg.icon;

  return (
    <Pressable
      onPress={() => onPress(item)}
      className={`flex-row items-start p-4 border-b border-zinc-50 dark:border-zinc-800 active:opacity-70 ${
        !item.isRead
          ? "bg-yellow-50/60 dark:bg-yellow-900/10"
          : "bg-white dark:bg-zinc-900"
      }`}
    >
      {/* Unread dot */}
      <Box className="w-2 h-2 mt-3 mr-2">
        {!item.isRead && <Box className="w-2 h-2 rounded-full bg-yellow-500" />}
      </Box>

      {/* Icon */}
      <Box
        className={`w-11 h-11 rounded-2xl ${cfg.bg} items-center justify-center mr-3 shrink-0`}
      >
        <Icon as={IconComp} className={`w-5 h-5 ${cfg.iconColor}`} />
      </Box>

      {/* Content */}
      <VStack className="flex-1">
        <HStack className="justify-between items-start">
          <Text
            className={`text-sm flex-1 mr-2 leading-tight ${
              !item.isRead
                ? "font-bold text-zinc-900 dark:text-white"
                : "font-semibold text-zinc-700 dark:text-zinc-300"
            }`}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <Text className="text-[11px] text-zinc-400 shrink-0">
            {timeAgo(item.createdAt)}
          </Text>
        </HStack>
        <Text
          className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed"
          numberOfLines={2}
        >
          {item.body}
        </Text>
      </VStack>
    </Pressable>
  );
};

// ── Main Screen ────────────────────────────────────────────────────

export default function NotificationsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { refreshUnreadCount } = useNotification();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = useCallback(
    async (pageNum = 1, replace = true) => {
      if (!user?._id) return;
      try {
        const res = await getNotifications(user._id, pageNum, 20);
        if (replace) {
          setNotifications(res.items);
        } else {
          setNotifications((prev) => [...prev, ...res.items]);
        }
        setHasMore(pageNum < res.meta.totalPages);
        setPage(pageNum);
      } catch {
        // silently ignore
      }
    },
    [user?._id],
  );

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchNotifications(1, true);
      setLoading(false);
    })();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications(1, true);
    await refreshUnreadCount();
    setRefreshing(false);
  };

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    await fetchNotifications(page + 1, false);
    setLoadingMore(false);
  };

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    if (
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - 100
    ) {
      loadMore();
    }
  };

  const handlePressItem = async (item: NotificationItem) => {
    // Đánh dấu đã đọc
    if (!item.isRead && user?._id) {
      await markNotificationAsRead(item._id, user._id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === item._id ? { ...n, isRead: true } : n)),
      );
      refreshUnreadCount();
    }
    // Điều hướng theo deepLink
    const deepLink = item.data?.deepLink;
    if (deepLink) {
      try {
        router.push(deepLink as any);
      } catch {
        // Ignore invalid routes
      }
    }
  };

  const handleMarkAllRead = async () => {
    if (!user?._id || markingAll) return;
    setMarkingAll(true);
    await markAllNotificationsAsRead(user._id);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    refreshUnreadCount();
    setMarkingAll(false);
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <Box className="bg-white dark:bg-zinc-900 px-5 pt-6 pb-4 border-b border-zinc-100 dark:border-zinc-800">
        <HStack className="items-center justify-between">
          <HStack className="items-center gap-3">
            <Pressable
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 items-center justify-center"
            >
              <Icon
                as={ChevronLeft}
                className="text-zinc-700 dark:text-zinc-300 w-5 h-5"
              />
            </Pressable>
            <VStack>
              <Text className="text-xl font-bold text-zinc-900 dark:text-white">
                Thông báo
              </Text>
              {unreadCount > 0 && (
                <Text className="text-xs text-zinc-400">
                  {unreadCount} chưa đọc
                </Text>
              )}
            </VStack>
          </HStack>

          {unreadCount > 0 && (
            <Pressable
              onPress={handleMarkAllRead}
              disabled={markingAll}
              className="flex-row items-center gap-1.5 px-3 py-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl active:opacity-70"
            >
              {markingAll ? (
                <ActivityIndicator size="small" color="#eab308" />
              ) : (
                <Icon
                  as={CheckCheck}
                  className="text-yellow-600 dark:text-yellow-500 w-4 h-4"
                />
              )}
              <Text className="text-xs font-semibold text-yellow-600 dark:text-yellow-500">
                Đọc tất cả
              </Text>
            </Pressable>
          )}
        </HStack>
      </Box>

      {/* Content */}
      {loading ? (
        <Box className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#eab308" />
        </Box>
      ) : notifications.length === 0 ? (
        <Box className="flex-1 items-center justify-center px-8">
          <Box className="w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-800 items-center justify-center mb-4">
            <Icon
              as={Bell}
              className="text-zinc-300 dark:text-zinc-600 w-10 h-10"
            />
          </Box>
          <Text className="text-lg font-bold text-zinc-700 dark:text-zinc-300 text-center">
            Chưa có thông báo
          </Text>
          <Text className="text-sm text-zinc-400 text-center mt-2">
            Thông báo về đơn hàng và khuyến mãi sẽ xuất hiện ở đây
          </Text>
        </Box>
      ) : (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#eab308"
              colors={["#eab308"]}
            />
          }
        >
          <Box className="bg-white dark:bg-zinc-900 rounded-3xl mx-4 my-4 overflow-hidden border border-zinc-100 dark:border-zinc-800 shadow-sm elevation-1">
            {notifications.map((item) => (
              <NotifItem key={item._id} item={item} onPress={handlePressItem} />
            ))}
          </Box>

          {loadingMore && (
            <Box className="py-6 items-center">
              <ActivityIndicator color="#eab308" />
              <Text className="text-xs text-zinc-400 mt-2">
                Đang tải thêm...
              </Text>
            </Box>
          )}

          {!hasMore && notifications.length > 0 && (
            <Text className="text-center text-xs text-zinc-300 dark:text-zinc-600 py-6">
              Đã hiển thị tất cả thông báo
            </Text>
          )}

          <Box className="h-10" />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
