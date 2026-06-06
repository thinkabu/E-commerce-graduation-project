import React, { createContext, useContext, ReactNode, useState, useEffect } from "react";
import * as SecureStore from 'expo-secure-store';
import {
  registerForPushNotifications,
  savePushTokenToServer,
  removePushTokenFromServer,
} from '@/services/notification.service';

interface AuthContextType {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: any;
  login: (token: string, userData: any) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthContextProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await SecureStore.getItemAsync('user_token');
      const userData = await SecureStore.getItemAsync('user_data');
      if (token && userData) {
        setIsAuthenticated(true);
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error("Check auth error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (token: string, userData: any) => {
    await SecureStore.setItemAsync('user_token', token);
    await SecureStore.setItemAsync('user_data', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);

    // ── Đăng ký Push Notification sau khi login ──
    try {
      const pushToken = await registerForPushNotifications();
      if (pushToken && userData?._id) {
        await savePushTokenToServer(userData._id, pushToken);
        // Lưu token vào SecureStore để dùng khi logout
        await SecureStore.setItemAsync('expo_push_token', pushToken);
      }
    } catch (err) {
      console.warn('Không đăng ký được push token:', err);
    }
  };

  const logout = async () => {
    // ── Xóa Push Token khỏi server trước khi logout ──
    try {
      const pushToken = await SecureStore.getItemAsync('expo_push_token');
      const userData = await SecureStore.getItemAsync('user_data');
      if (pushToken && userData) {
        const parsed = JSON.parse(userData);
        if (parsed?._id) {
          await removePushTokenFromServer(parsed._id, pushToken);
        }
      }
    } catch (err) {
      console.warn('Không xóa được push token khi logout:', err);
    }

    await SecureStore.deleteItemAsync('user_token');
    await SecureStore.deleteItemAsync('user_data');
    await SecureStore.deleteItemAsync('expo_push_token');
    setIsAuthenticated(false);
    setUser(null);
  };

  const updateUser = async (userData: any) => {
    await SecureStore.setItemAsync('user_data', JSON.stringify(userData));
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ isLoading, isAuthenticated, user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within a AuthContextProvider");
  }
  return context;
}
