import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import api from './api';

// ─────────────────────── Setup Handler ───────────────────────────

/**
 * Gọi một lần trong _layout.tsx để cấu hình cách hiển thị
 * notification khi app đang mở (foreground).
 * Tách ra khỏi module-level để tránh side-effect khi import.
 */
export function initNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,  // Heads-up alert (thay shouldShowAlert từ v0.29+)
      shouldShowList: true,    // Hiện trong notification center
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

// ─────────────────────── Register Token ──────────────────────────

/**
 * Xin quyền & lấy Expo Push Token từ thiết bị thật.
 * Chỉ hoạt động trên Development Build (không phải Expo Go hay emulator).
 */
export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    console.warn('[Push] Chỉ hoạt động trên thiết bị thật (Development Build).');
    return null;
  }

  // Kiểm tra & xin quyền
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('[Push] Người dùng từ chối quyền push notification.');
    return null;
  }

  // Cấu hình Android notification channel trước khi lấy token
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Thông báo',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#eab308',
    });
  }

  // Lấy Expo Push Token
  try {
    const tokenData = await Notifications.getExpoPushTokenAsync();
    const token = tokenData.data;
    console.log('[Push] ✅ Expo Push Token:', token);
    return token;
  } catch (error) {
    console.error('[Push] ❌ Lỗi lấy token:', error);
    return null;
  }
}

// ─────────────────────── Token Server Sync ───────────────────────

/**
 * Gửi Expo Push Token lên backend để lưu vào User document ($addToSet).
 */
export async function savePushTokenToServer(
  userId: string,
  token: string,
): Promise<void> {
  try {
    await api.patch(`/users/${userId}/push-token`, { token });
    console.log('[Push] ✅ Đã lưu Push Token lên server.');
  } catch (error) {
    console.error('[Push] ❌ Lỗi lưu push token:', error);
  }
}

/**
 * Xóa token khỏi backend khi user đăng xuất ($pull).
 */
export async function removePushTokenFromServer(
  userId: string,
  token: string,
): Promise<void> {
  try {
    await api.delete(`/users/${userId}/push-token`, { data: { token } });
    console.log('[Push] ✅ Đã xóa Push Token khỏi server.');
  } catch (error) {
    console.error('[Push] ❌ Lỗi xóa push token:', error);
  }
}

// ─────────────────────── Notification Types ──────────────────────

export interface NotificationItem {
  _id: string;
  userId: string;
  title: string;
  body: string;
  type: string;
  data?: {
    orderId?: string;
    productId?: string;
    deepLink?: string;
    campaignId?: string;
    txHash?: string;
  };
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface NotificationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ─────────────────────── API Calls ───────────────────────────────

export async function getNotifications(
  userId: string,
  page = 1,
  limit = 20,
): Promise<{ items: NotificationItem[]; meta: NotificationMeta }> {
  try {
    const res = await api.get(`/notifications/user/${userId}`, {
      params: { page, limit },
    });
    // Backend trả về { data: { items, meta } } hoặc trực tiếp { items, meta }
    const payload = res.data?.data ?? res.data;
    return {
      items: payload?.items ?? [],
      meta: payload?.meta ?? { page, limit, total: 0, totalPages: 0 },
    };
  } catch (error) {
    console.error('[Notifications] Lỗi lấy danh sách:', error);
    return { items: [], meta: { page, limit, total: 0, totalPages: 0 } };
  }
}

export async function getUnreadCount(userId: string): Promise<number> {
  try {
    const res = await api.get(`/notifications/user/${userId}/unread-count`);
    const payload = res.data?.data ?? res.data;
    if (typeof payload === 'number') return payload;
    if (typeof payload?.count === 'number') return payload.count;
    return 0;
  } catch {
    return 0;
  }
}

export async function markNotificationAsRead(
  notifId: string,
  userId: string,
): Promise<void> {
  try {
    await api.patch(`/notifications/${notifId}/read`, {}, {
      params: { userId },
    });
  } catch (error) {
    console.error('[Notifications] Lỗi đánh dấu đã đọc:', error);
  }
}

export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  try {
    await api.patch(`/notifications/user/${userId}/read-all`);
  } catch (error) {
    console.error('[Notifications] Lỗi đánh dấu tất cả đã đọc:', error);
  }
}
