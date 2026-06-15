import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
  useCallback,
} from "react";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { getUnreadCount } from "@/services/notification.service";

interface NotificationContextType {
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export function NotificationContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();

  // Refs để cleanup listeners khi unmount
  const notifReceivedRef = useRef<Notifications.EventSubscription | null>(null);
  const notifResponseRef = useRef<Notifications.EventSubscription | null>(null);

  const refreshUnreadCount = useCallback(async () => {
    try {
      const userData = await SecureStore.getItemAsync("user_data");
      if (!userData) return;
      const user = JSON.parse(userData);
      if (!user?._id) return;
      const count = await getUnreadCount(user._id);
      setUnreadCount(count);
    } catch {
      // Bỏ qua lỗi silently
    }
  }, []);

  useEffect(() => {
    // Load số thông báo chưa đọc khi app khởi động
    refreshUnreadCount();

    // ── Listener 1: Nhận notification khi app đang mở (foreground) ──
    notifReceivedRef.current = Notifications.addNotificationReceivedListener(
      () => {
        // Khi nhận được push mới → tăng badge ngay
        setUnreadCount((prev) => prev + 1);
      },
    );

    // ── Listener 2: Xử lý khi user bấm vào notification ──
    notifResponseRef.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data as any;
        const deepLink = data?.deepLink;

        if (deepLink) {
          // Điều hướng theo deepLink được gửi từ backend
          try {
            router.push(deepLink as any);
          } catch {
            // Nếu deepLink không hợp lệ thì chuyển về màn thông báo
            router.push("/notifications" as any);
          }
        } else {
          router.push("/notifications" as any);
        }
      });

    return () => {
      notifReceivedRef.current?.remove();
      notifResponseRef.current?.remove();
    };
  }, []);

  return (
    <NotificationContext.Provider value={{ unreadCount, refreshUnreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within NotificationContextProvider",
    );
  }
  return context;
}
