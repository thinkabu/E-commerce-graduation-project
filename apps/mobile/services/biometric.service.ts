import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";

// ── Keys lưu trong SecureStore ──
const BIOMETRIC_PROMPT_DISMISSED_KEY = "biometric_prompt_dismissed"; // Đã từ chối kích hoạt
const SAVED_ACCOUNTS_KEY = "saved_accounts";

export interface SavedAccount {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  biometricEnabled: boolean;
}

/**
 * Kiểm tra thiết bị có hỗ trợ sinh trắc học không
 */
export async function isBiometricAvailable(): Promise<boolean> {
  const compatible = await LocalAuthentication.hasHardwareAsync();
  if (!compatible) return false;

  const enrolled = await LocalAuthentication.isEnrolledAsync();
  return enrolled;
}

/**
 * Lấy loại sinh trắc học thiết bị hỗ trợ (Face ID, Fingerprint, v.v.)
 */
export async function getBiometricType(): Promise<string> {
  const types = await LocalAuthentication.supportedAuthenticationTypesAsync();

  if (
    types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)
  ) {
    return "Face ID";
  }
  if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
    return "Vân tay";
  }
  if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
    return "Mống mắt";
  }
  return "Sinh trắc học";
}

/**
 * Xác thực sinh trắc học (Face ID / Vân tay)
 */
export async function authenticateWithBiometric(): Promise<boolean> {
  const biometricType = await getBiometricType();
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: `Xác thực bằng ${biometricType}`,
    cancelLabel: "Hủy",
    disableDeviceFallback: false,
    fallbackLabel: "Dùng mật khẩu thiết bị",
  });

  return result.success;
}

// ────────────────────────────────────────
// Quản lý nhiều tài khoản sinh trắc học
// ────────────────────────────────────────

/**
 * Lấy danh sách các tài khoản đã từng đăng nhập
 */
export async function getSavedAccounts(): Promise<SavedAccount[]> {
  try {
    const data = await SecureStore.getItemAsync(SAVED_ACCOUNTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error getting saved accounts:", error);
    return [];
  }
}

/**
 * Lưu hoặc cập nhật một tài khoản vào danh sách
 */
export async function saveAccount(account: SavedAccount): Promise<void> {
  try {
    const accounts = await getSavedAccounts();
    const index = accounts.findIndex((a) => a.id === account.id);
    if (index >= 0) {
      accounts[index] = { ...accounts[index], ...account };
    } else {
      accounts.push(account);
    }
    await SecureStore.setItemAsync(SAVED_ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch (error) {
    console.error("Error saving account:", error);
  }
}

/**
 * Xóa một tài khoản khỏi danh sách và xóa dữ liệu sinh trắc liên quan
 */
export async function removeAccount(id: string): Promise<void> {
  try {
    const accounts = await getSavedAccounts();
    const filtered = accounts.filter((a) => a.id !== id);
    await SecureStore.setItemAsync(SAVED_ACCOUNTS_KEY, JSON.stringify(filtered));
    
    // Xóa các key sinh trắc của tài khoản này
    await SecureStore.deleteItemAsync(`biometric_token_${id}`);
    await SecureStore.deleteItemAsync(`biometric_user_${id}`);
    await SecureStore.deleteItemAsync(`biometric_prompt_dismissed_${id}`);
  } catch (error) {
    console.error("Error removing account:", error);
  }
}

/**
 * Kiểm tra xem sinh trắc học có bật cho một tài khoản cụ thể không
 */
export async function isBiometricEnabledForAccount(id: string): Promise<boolean> {
  const accounts = await getSavedAccounts();
  const account = accounts.find((a) => a.id === id);
  return account ? account.biometricEnabled : false;
}

/**
 * Bật sinh trắc học cho một tài khoản cụ thể
 */
export async function enableBiometricForAccount(
  id: string,
  token: string,
  userData: any
): Promise<void> {
  await SecureStore.setItemAsync(`biometric_token_${id}`, token);
  await SecureStore.setItemAsync(`biometric_user_${id}`, JSON.stringify(userData));
  
  const account: SavedAccount = {
    id,
    email: userData.email,
    name: userData.fullName || userData.name || "Người dùng",
    avatar: userData.avatar,
    biometricEnabled: true,
  };
  await saveAccount(account);
}

/**
 * Tắt sinh trắc học của một tài khoản cụ thể
 */
export async function disableBiometricForAccount(id: string): Promise<void> {
  await SecureStore.deleteItemAsync(`biometric_token_${id}`);
  await SecureStore.deleteItemAsync(`biometric_user_${id}`);
  
  const accounts = await getSavedAccounts();
  const account = accounts.find((a) => a.id === id);
  if (account) {
    account.biometricEnabled = false;
    await saveAccount(account);
  }
}

/**
 * Lấy token của một tài khoản
 */
export async function getBiometricTokenForAccount(id: string): Promise<string | null> {
  return await SecureStore.getItemAsync(`biometric_token_${id}`);
}

/**
 * Lấy dữ liệu user của một tài khoản
 */
export async function getBiometricUserDataForAccount(id: string): Promise<any | null> {
  const data = await SecureStore.getItemAsync(`biometric_user_${id}`);
  return data ? JSON.parse(data) : null;
}

/**
 * Cập nhật token cho tài khoản khi đăng nhập lại thành công
 */
export async function updateBiometricTokenForAccount(
  id: string,
  token: string,
  userData: any
): Promise<void> {
  const isEnabled = await isBiometricEnabledForAccount(id);
  if (isEnabled) {
    await SecureStore.setItemAsync(`biometric_token_${id}`, token);
    await SecureStore.setItemAsync(`biometric_user_${id}`, JSON.stringify(userData));
  }
}

// ────────────────────────────────────────
// Quản lý trạng thái từ chối kích hoạt
// ────────────────────────────────────────

/**
 * Kiểm tra người dùng đã từ chối kích hoạt sinh trắc học chưa (cho tài khoản cụ thể)
 */
export async function isBiometricPromptDismissedForAccount(id: string): Promise<boolean> {
  const value = await SecureStore.getItemAsync(`biometric_prompt_dismissed_${id}`);
  return value === "true";
}

/**
 * Đánh dấu người dùng đã từ chối kích hoạt sinh trắc học (cho tài khoản cụ thể)
 */
export async function dismissBiometricPromptForAccount(id: string): Promise<void> {
  await SecureStore.setItemAsync(`biometric_prompt_dismissed_${id}`, "true");
}

/**
 * Reset trạng thái đã từ chối (cho tài khoản cụ thể)
 */
export async function resetBiometricPromptDismissedForAccount(id: string): Promise<void> {
  await SecureStore.deleteItemAsync(`biometric_prompt_dismissed_${id}`);
}
