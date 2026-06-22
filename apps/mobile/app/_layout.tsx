import { Stack } from "expo-router";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "@/global.css";
import { customDarkTheme, customLightTheme } from "@/constants/Theme";
import { ThemeProvider } from "@react-navigation/native";
import { useColorScheme } from "nativewind";

// Import các Providers đã tạo
import { AuthContextProvider } from "../contexts/AuthContext";
import { WishlistContextProvider } from "../contexts/WishlistContext";
import { CartContextProvider } from "../contexts/CartContext";
import { AddressContextProvider } from "../contexts/AddressContext";
import { PaymentContextProvider } from "../contexts/PaymentContext";
import { NFTContextProvider } from "../contexts/NFTContext";
import { ThemeContextProvider } from "../contexts/ThemeContext";
import { NotificationContextProvider } from "../contexts/NotificationContext";
import { initNotificationHandler } from "../services/notification.service";

// Khởi tạo handler một lần khi app load
initNotificationHandler();

export default function RootLayout() {
  const { colorScheme } = useColorScheme();

  return (
    <ThemeProvider
      value={colorScheme === "dark" ? customDarkTheme : customLightTheme}
    >
      <GluestackUIProvider mode="system">
        <ThemeContextProvider>
          <AuthContextProvider>
            <WishlistContextProvider>
              <NotificationContextProvider>
                <CartContextProvider>
                  <AddressContextProvider>
                    <PaymentContextProvider>
                      <NFTContextProvider>
                        <Stack screenOptions={{ headerShown: false }}>
                          {/* Trạm gác cổng điều hướng */}
                          <Stack.Screen name="index" />

                          {/* Các nhóm màn hình chính */}
                          <Stack.Screen name="(tabs)" />
                        </Stack>
                      </NFTContextProvider>
                    </PaymentContextProvider>
                  </AddressContextProvider>
                </CartContextProvider>
              </NotificationContextProvider>
            </WishlistContextProvider>
          </AuthContextProvider>
        </ThemeContextProvider>
      </GluestackUIProvider>
    </ThemeProvider>
  );
}
