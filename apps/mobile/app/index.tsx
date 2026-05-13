import { Redirect } from "expo-router";
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
  - Nếu đã đăng nhập (isAuthenticated = true) -> Điều hướng thẳng vào màn hình Trang chủ (tabs/home).
  - Nếu chưa đăng nhập -> Điều hướng ra màn hình Đăng nhập (auth/login).
*/
export default function Index() {
  // Lấy trạng thái đăng nhập từ Context Auth
  const { isAuthenticated, isLoading } = useAuth();

  // BƯỚC 1: XỬ LÝ TRẠNG THÁI LOADING (Ví dụ: Đang chờ lấy Token từ AsyncStorage/SecureStore)
  if (isLoading) {
    return (
      // Hiển thị vòng xoay tải dữ liệu (Loading Spinner) ở chính giữa màn hình
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // BƯỚC 2: ĐIỀU HƯỚNG (REDIRECT) DỰA THEO KẾT QUẢ ĐĂNG NHẬP
  // Bạn có thể đổi `/(tabs)/home` và `/(auth)/login` theo đúng tên file route thực tế trong dự án
  return <Redirect href={(isAuthenticated ? "/home" : "/login") as any} />;
}
