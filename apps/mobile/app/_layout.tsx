import { Stack } from "expo-router";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "@/global.css";
import { customDarkTheme, customLightTheme } from "@/constants/Theme";
import { ThemeProvider } from "@react-navigation/native";
import { useColorScheme } from "nativewind";

// Import các Providers đã tạo
import { AuthContextProvider } from "../contexts/AuthContext";
import { CartContextProvider } from "../contexts/CartContext";
import { AddressContextProvider } from "../contexts/AddressContext";
import { PaymentContextProvider } from "../contexts/PaymentContext";
import { NFTContextProvider } from "../contexts/NFTContext";

export default function RootLayout() {
  const { colorScheme } = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? customDarkTheme : customLightTheme}>
      <GluestackUIProvider mode="system">
        <AuthContextProvider>
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
        </AuthContextProvider>
      </GluestackUIProvider>
    </ThemeProvider>
  );
}
