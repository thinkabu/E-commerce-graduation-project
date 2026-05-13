export interface User {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
  isActive: boolean;
  createdAt?: string;
}

const BASE_URL = import.meta.env.VITE_API_URL;

export const fetchUsers = async (): Promise<User[]> => {
  try {
    const res = await fetch(`${BASE_URL}/users`);
    const json = await res.json();
    // Backend trả về: { success: true, data: { items: [...], meta: {...} } }
    // hoặc: { success: true, data: [...] }
    const data = json.data;
    if (data && Array.isArray(data.items)) {
      return data.items;
    }
    if (Array.isArray(data)) {
      return data;
    }
    return [];
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};

export const deleteUser = async (id: string): Promise<boolean> => {
  try {
    const res = await fetch(`${BASE_URL}/users/${id}`, {
      method: "DELETE",
    });
    return res.ok;
  } catch (error) {
    console.error("Error deleting user:", error);
    return false;
  }
};

export const updateUserStatus = async (id: string, isActive: boolean): Promise<boolean> => {
  try {
    const res = await fetch(`${BASE_URL}/users/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ isActive }),
    });
    return res.ok;
  } catch (error) {
    console.error("Error updating user status:", error);
    return false;
  }
};

export const createUser = async (userData: any): Promise<{ success: boolean; message: string }> => {
  try {
    const res = await fetch(`${BASE_URL}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    const json = await res.json();
    
    if (res.ok) {
      return { success: true, message: "Thêm người dùng mới thành công!" };
    } else {
      // Trả về message lỗi cụ thể từ Backend
      return { success: false, message: json.message || "Lỗi không xác định từ server." };
    }
  } catch (error) {
    console.error("Error creating user:", error);
    return { success: false, message: "Không thể kết nối đến server." };
  }
};
