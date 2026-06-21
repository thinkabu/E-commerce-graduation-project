import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useRef,
} from "react";
import { AppState, Modal } from "react-native";
import * as SecureStore from "expo-secure-store";
import AppLockScreen from "../components/AppLockScreen";
import {
  registerForPushNotifications,
  savePushTokenToServer,
  removePushTokenFromServer,
} from "@/services/notification.service";
import {
  isBiometricAvailable,
  authenticateWithBiometric,
  isBiometricPromptDismissedForAccount,
  dismissBiometricPromptForAccount,
  resetBiometricPromptDismissedForAccount,
  getBiometricType,
  // Multi-account
  SavedAccount,
  getSavedAccounts,
  saveAccount,
  removeAccount,
  isBiometricEnabledForAccount,
  enableBiometricForAccount,
  disableBiometricForAccount,
  getBiometricTokenForAccount,
  getBiometricUserDataForAccount,
  updateBiometricTokenForAccount,
} from "@/services/biometric.service";

interface AuthContextType {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: any;
  login: (token: string, userData: any) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (userData: any) => Promise<void>;
  // ── Biometric ──
  biometricAvailable: boolean;
  biometricEnabled: boolean;
  biometricType: string;
  shouldShowBiometricPrompt: boolean;
  isLocked: boolean;
  loginWithBiometric: () => Promise<boolean>;
  toggleBiometric: (enable: boolean) => Promise<void>;
  handleBiometricPromptResponse: (accepted: boolean) => Promise<void>;
  dismissBiometricSetupPrompt: () => void;
  // Multi-account
  savedAccounts: SavedAccount[];
  deleteSavedAccount: (id: string) => Promise<void>;
  loginWithBiometricForAccount: (id: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthContextProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── Biometric state ──
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricType, setBiometricType] = useState("Sinh trắc học");
  const [shouldShowBiometricPrompt, setShouldShowBiometricPrompt] =
    useState(false);
  // Lưu tạm token & user khi chờ prompt kích hoạt sinh trắc
  const [pendingToken, setPendingToken] = useState<string | null>(null);
  const [pendingUserData, setPendingUserData] = useState<any>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>([]);

  const appState = useRef(AppState.currentState);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // 1. Kiểm tra thiết bị hỗ trợ sinh trắc học
      const bioAvailable = await isBiometricAvailable();
      setBiometricAvailable(bioAvailable);

      if (bioAvailable) {
        const type = await getBiometricType();
        setBiometricType(type);
      }

      // 2. Lấy danh sách tài khoản đã lưu
      const accounts = await getSavedAccounts();
      setSavedAccounts(accounts);

      // 3. Kiểm tra token thường trong SecureStore
      const token = await SecureStore.getItemAsync("user_token");
      const userData = await SecureStore.getItemAsync("user_data");
      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        setIsAuthenticated(true);
        setUser(parsedUser);

        // Xem tài khoản hiện tại có bật sinh trắc học không
        const activeAccount = accounts.find((a) => a.id === parsedUser._id);
        const bioEnabled = activeAccount ? activeAccount.biometricEnabled : false;
        setBiometricEnabled(bioEnabled);

        if (bioEnabled) {
          setIsLocked(true);
        }
      }
    } catch (error) {
      console.error("Check auth error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const unlockWithBiometric = async (): Promise<boolean> => {
    try {
      const success = await authenticateWithBiometric();
      if (success) {
        setIsLocked(false);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Unlock biometric error:", error);
      return false;
    }
  };

  useEffect(() => {
    if (isLocked && isAuthenticated) {
      const timer = setTimeout(() => {
        unlockWithBiometric();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isLocked, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !biometricEnabled) return;

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (appState.current === "background" && nextAppState === "active") {
        setIsLocked(true);
        setTimeout(() => {
          unlockWithBiometric();
        }, 500);
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [isAuthenticated, biometricEnabled]);

  /**
   * Đăng nhập bằng mật khẩu (bình thường).
   * Sau khi đăng nhập xong, nếu thiết bị hỗ trợ sinh trắc và chưa kích hoạt,
   * sẽ hiển thị prompt hỏi kích hoạt.
   * Trả về boolean chỉ định xem có hiển thị modal kích hoạt sinh trắc học hay không.
   */
  const login = async (token: string, userData: any): Promise<boolean> => {
    await SecureStore.setItemAsync("user_token", token);
    await SecureStore.setItemAsync("user_data", JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);

    // Lưu tài khoản vào danh sách đã từng đăng nhập
    const bioEnabled = await isBiometricEnabledForAccount(userData._id);
    const account: SavedAccount = {
      id: userData._id,
      email: userData.email,
      name: userData.fullName || userData.name || "Người dùng",
      avatar: userData.avatar,
      biometricEnabled: bioEnabled,
    };
    await saveAccount(account);
    const accounts = await getSavedAccounts();
    setSavedAccounts(accounts);

    setBiometricEnabled(bioEnabled);

    // ── Đăng ký Push Notification sau khi login ──
    try {
      const pushToken = await registerForPushNotifications();
      if (pushToken && userData?._id) {
        await savePushTokenToServer(userData._id, pushToken);
        await SecureStore.setItemAsync("expo_push_token", pushToken);
      }
    } catch (err) {
      console.warn("Không đăng ký được push token:", err);
    }

    // ── Kiểm tra có nên hiện prompt kích hoạt sinh trắc hay không ──
    const bioAvailable = await isBiometricAvailable();
    const promptDismissed = await isBiometricPromptDismissedForAccount(userData._id);

    let shouldPrompt = false;
    if (bioAvailable && !bioEnabled && !promptDismissed) {
      // Lưu tạm token và userData để kích hoạt nếu user đồng ý
      setPendingToken(token);
      setPendingUserData(userData);
      setShouldShowBiometricPrompt(true);
      shouldPrompt = true;
    }

    // Nếu sinh trắc đã bật, cập nhật token mới (gia hạn 60 ngày mới)
    if (bioEnabled) {
      await updateBiometricTokenForAccount(userData._id, token, userData);
    }

    return shouldPrompt;
  };

  /**
   * Xử lý phản hồi từ prompt kích hoạt sinh trắc học
   */
  const handleBiometricPromptResponse = async (accepted: boolean) => {
    setShouldShowBiometricPrompt(false);

    if (accepted && pendingToken && pendingUserData) {
      // Xác thực sinh trắc để kích hoạt
      const success = await authenticateWithBiometric();
      if (success) {
        await enableBiometricForAccount(pendingUserData._id, pendingToken, pendingUserData);
        setBiometricEnabled(true);
        await resetBiometricPromptDismissedForAccount(pendingUserData._id);
        
        // Cập nhật lại danh sách tài khoản đã lưu
        const accounts = await getSavedAccounts();
        setSavedAccounts(accounts);
      }
    } else {
      if (pendingUserData?._id) {
        await dismissBiometricPromptForAccount(pendingUserData._id);
      }
    }

    setPendingToken(null);
    setPendingUserData(null);
  };

  /**
   * Đăng nhập bằng sinh trắc học (Face ID / Vân tay) cho tài khoản đầu tiên có bật
   */
  const loginWithBiometric = async (): Promise<boolean> => {
    const activeAccount = savedAccounts.find((a) => a.biometricEnabled);
    if (!activeAccount) return false;
    return await loginWithBiometricForAccount(activeAccount.id);
  };

  /**
   * Đăng nhập bằng sinh trắc học cho một tài khoản cụ thể
   */
  const loginWithBiometricForAccount = async (id: string): Promise<boolean> => {
    try {
      // 1. Xác thực sinh trắc
      const success = await authenticateWithBiometric();
      if (!success) return false;

      // 2. Đọc token & userData của tài khoản này
      const token = await getBiometricTokenForAccount(id);
      const userData = await getBiometricUserDataForAccount(id);

      if (!token || !userData) {
        // Token đã bị xóa hoặc hết hạn
        await disableBiometricForAccount(id);
        const accounts = await getSavedAccounts();
        setSavedAccounts(accounts);
        return false;
      }

      // 3. Đăng nhập với token đã lưu
      await SecureStore.setItemAsync("user_token", token);
      await SecureStore.setItemAsync("user_data", JSON.stringify(userData));
      setIsAuthenticated(true);
      setUser(userData);
      setBiometricEnabled(true);

      // 4. Đăng ký push notification
      try {
        const pushToken = await registerForPushNotifications();
        if (pushToken && userData?._id) {
          await savePushTokenToServer(userData._id, pushToken);
          await SecureStore.setItemAsync("expo_push_token", pushToken);
        }
      } catch (err) {
        console.warn("Không đăng ký được push token:", err);
      }

      return true;
    } catch (error) {
      console.error("Biometric login for account error:", error);
      return false;
    }
  };

  /**
   * Bật/tắt sinh trắc học từ Profile/Settings cho user hiện tại.
   * Yêu cầu xác thực sinh trắc trong cả hai trường hợp bật và tắt.
   */
  const toggleBiometric = async (enable: boolean) => {
    if (!user?._id) return;

    // Yêu cầu quét sinh trắc học trước khi thực hiện bất kỳ hành động bật hoặc tắt nào
    const success = await authenticateWithBiometric();
    if (!success) return; // Hủy hoặc thất bại -> Giữ nguyên cài đặt cũ

    if (enable) {
      const token = await SecureStore.getItemAsync("user_token");
      if (token) {
        await enableBiometricForAccount(user._id, token, user);
        setBiometricEnabled(true);
        await resetBiometricPromptDismissedForAccount(user._id);
      }
    } else {
      await disableBiometricForAccount(user._id);
      setBiometricEnabled(false);
    }
    
    // Cập nhật lại danh sách tài khoản đã lưu
    const accounts = await getSavedAccounts();
    setSavedAccounts(accounts);
  };

  /**
   * Ẩn prompt kích hoạt (không hỏi lại trong phiên hiện tại)
   */
  const dismissBiometricSetupPrompt = () => {
    setShouldShowBiometricPrompt(false);
    setPendingToken(null);
    setPendingUserData(null);
  };

  const deleteSavedAccount = async (id: string) => {
    await removeAccount(id);
    const accounts = await getSavedAccounts();
    setSavedAccounts(accounts);
  };

  const logout = async () => {
    // ── Xóa Push Token khỏi server trước khi logout ──
    try {
      const pushToken = await SecureStore.getItemAsync("expo_push_token");
      const userData = await SecureStore.getItemAsync("user_data");
      if (pushToken && userData) {
        const parsed = JSON.parse(userData);
        if (parsed?._id) {
          await removePushTokenFromServer(parsed._id, pushToken);
        }
      }
    } catch (err) {
      console.warn("Không xóa được push token khi logout:", err);
    }

    await SecureStore.deleteItemAsync("user_token");
    await SecureStore.deleteItemAsync("user_data");
    await SecureStore.deleteItemAsync("expo_push_token");
    // Lưu ý: KHÔNG xóa biometric token/data của các tài khoản khi logout
    setIsAuthenticated(false);
    setUser(null);
    setIsLocked(false);
    setBiometricEnabled(false);
  };

  const updateUser = async (userData: any) => {
    await SecureStore.setItemAsync("user_data", JSON.stringify(userData));
    setUser(userData);
  };

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        isAuthenticated,
        user,
        login,
        logout,
        updateUser,
        biometricAvailable,
        biometricEnabled,
        biometricType,
        shouldShowBiometricPrompt,
        isLocked,
        loginWithBiometric,
        toggleBiometric,
        handleBiometricPromptResponse,
        dismissBiometricSetupPrompt,
        savedAccounts,
        deleteSavedAccount,
        loginWithBiometricForAccount,
      }}
    >
      {children}
      {isLocked && isAuthenticated && (
        <Modal
          visible={isLocked && isAuthenticated}
          animationType="fade"
          transparent={false}
        >
          <AppLockScreen
            biometricType={biometricType}
            onUnlock={unlockWithBiometric}
            onLogout={logout}
          />
        </Modal>
      )}
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
