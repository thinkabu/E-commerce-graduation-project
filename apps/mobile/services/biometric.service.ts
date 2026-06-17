import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";

// ── Keys lưu trong SecureStore ──
const BIOMETRIC_ENABLED_KEY = "biometric_enabled"; // "true" | "false"
const BIOMETRIC_TOKEN_KEY = "biometric_token"; // JWT token lưu cho sinh trắc học
const BIOMETRIC_USER_KEY = "biometric_user_data"; // User data JSON
const BIOMETRIC_PROMPT_DISMISSED_KEY = "biometric_prompt_dismissed"; // Đã từ chối kích hoạt

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
  const types =
    await LocalAuthentication.supportedAuthenticationTypesAsync();

  if (
    types.includes(
      LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
    )
  ) {
    return "Face ID";
  }
  if (
    types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)
  ) {
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
// Quản lý trạng thái sinh trắc học
// ────────────────────────────────────────

/**
 * Kiểm tra người dùng đã bật sinh trắc học chưa
 */
export async function isBiometricEnabled(): Promise<boolean> {
  const value = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
  return value === "true";
}

/**
 * Lưu token và user data cho sinh trắc học (khi kích hoạt lần đầu hoặc khi đăng nhập lại)
 */
export async function enableBiometric(
  token: string,
  userData: any
): Promise<void> {
  await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, "true");
  await SecureStore.setItemAsync(BIOMETRIC_TOKEN_KEY, token);
  await SecureStore.setItemAsync(
    BIOMETRIC_USER_KEY,
    JSON.stringify(userData)
  );
}

/**
 * Tắt sinh trắc học (xóa tất cả dữ liệu liên quan)
 */
export async function disableBiometric(): Promise<void> {
  await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, "false");
  await SecureStore.deleteItemAsync(BIOMETRIC_TOKEN_KEY);
  await SecureStore.deleteItemAsync(BIOMETRIC_USER_KEY);
}

/**
 * Lấy token đã lưu cho sinh trắc học
 */
export async function getBiometricToken(): Promise<string | null> {
  return await SecureStore.getItemAsync(BIOMETRIC_TOKEN_KEY);
}

/**
 * Lấy user data đã lưu cho sinh trắc học
 */
export async function getBiometricUserData(): Promise<any | null> {
  const data = await SecureStore.getItemAsync(BIOMETRIC_USER_KEY);
  return data ? JSON.parse(data) : null;
}

/**
 * Cập nhật token mới cho sinh trắc học (khi đăng nhập lại sau 60 ngày)
 */
export async function updateBiometricToken(
  token: string,
  userData: any
): Promise<void> {
  const isEnabled = await isBiometricEnabled();
  if (isEnabled) {
    await SecureStore.setItemAsync(BIOMETRIC_TOKEN_KEY, token);
    await SecureStore.setItemAsync(
      BIOMETRIC_USER_KEY,
      JSON.stringify(userData)
    );
  }
}

/**
 * Kiểm tra người dùng đã từ chối kích hoạt sinh trắc học chưa
 */
export async function isBiometricPromptDismissed(): Promise<boolean> {
  const value = await SecureStore.getItemAsync(
    BIOMETRIC_PROMPT_DISMISSED_KEY
  );
  return value === "true";
}

/**
 * Đánh dấu người dùng đã từ chối kích hoạt sinh trắc học
 */
export async function dismissBiometricPrompt(): Promise<void> {
  await SecureStore.setItemAsync(BIOMETRIC_PROMPT_DISMISSED_KEY, "true");
}

/**
 * Reset trạng thái đã từ chối (khi người dùng bật lại từ cài đặt)
 */
export async function resetBiometricPromptDismissed(): Promise<void> {
  await SecureStore.deleteItemAsync(BIOMETRIC_PROMPT_DISMISSED_KEY);
}
