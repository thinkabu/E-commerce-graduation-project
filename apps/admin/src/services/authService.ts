const BASE_URL = import.meta.env.VITE_API_URL;

export interface LoginResponse {
  access_token: string;
  user: {
    _id: string;
    fullName: string;
    email: string;
    role: string;
    avatar?: string;
  };
}

export const loginAdmin = async (email: string, password: string): Promise<{ success: boolean; data?: LoginResponse; message: string }> => {
  try {
    const res = await fetch(`${BASE_URL}/auth/login/admin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const json = await res.json();

    if (res.ok) {
      // Lưu vào localStorage với thời gian hết hạn (3 ngày)
      const expiry = new Date().getTime() + 3 * 24 * 60 * 60 * 1000;
      localStorage.setItem("admin_token", json.data.access_token);
      localStorage.setItem("admin_user", JSON.stringify(json.data.user));
      localStorage.setItem("admin_expiry", expiry.toString());
      
      return { success: true, data: json.data, message: "Đăng nhập thành công!" };
    } else {
      return { success: false, message: json.message || "Email hoặc mật khẩu không đúng" };
    }
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, message: "Không thể kết nối đến server." };
  }
};

export const logout = () => {
  localStorage.removeItem("admin_token");
  localStorage.removeItem("admin_user");
  localStorage.removeItem("admin_expiry");
  window.location.href = "/login";
};

export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem("admin_token");
  const expiry = localStorage.getItem("admin_expiry");
  
  if (!token || !expiry) return false;
  
  // Kiểm tra nếu đã quá 3 ngày
  if (new Date().getTime() > parseInt(expiry)) {
    logout();
    return false;
  }
  
  return true;
};

export const getAdminUser = () => {
  const user = localStorage.getItem("admin_user");
  return user ? JSON.parse(user) : null;
};
