import React, { useEffect } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import { View, ActivityIndicator } from "react-native";

/*
  --------------------------------------------------------------------------
  📍 AUTH GUARD (TRẠM KIỂM SOÁT ĐIỀU HƯỚNG TỰ ĐỘNG)
  --------------------------------------------------------------------------
  File `index.tsx` này không chứa giao diện hiển thị cho User, 
  mà nó đóng vai trò là "Người gác cổng".
  
  Mục đích:
  - Khi App vừa mở lên, nó sẽ chạy vào đây đầu tiên.
  - Kiểm tra xem App có đang lấy thông tin đăng nhập không (isLoading).
  - Nếu sinh trắc học đã bật và token còn hạn -> Tự động xác thực sinh trắc.
  - Nếu đã đăng nhập (isAuthenticated = true) -> Điều hướng thẳng vào màn hình Trang chủ (tabs/home).
  - Nếu chưa đăng nhập -> Điều hướng ra màn hình Đăng nhập (auth/login).
*/
export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace("/home");
      } else {
        router.replace("/login");
      }
    }
  }, [isLoading, isAuthenticated]);

  return (
    <View className="flex-1 justify-center items-center bg-white dark:bg-zinc-950">
      <ActivityIndicator size="large" color="#eab308" />
    </View>
  );
}
