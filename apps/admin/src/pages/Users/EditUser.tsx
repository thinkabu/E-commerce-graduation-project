import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft,
  UserCog,
  Shield,
  Mail,
  Phone,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { usePageTitle } from "@/contexts/PageTitleContext";
import { toast } from "sonner";
import { fetchUserById, updateUser } from "@/services/userService";

const EditUser: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  usePageTitle("Chỉnh Sửa Người Dùng");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<{
    fullName: string;
    email: string;
    phone: string;
    role: 'user' | 'admin';
    isActive: boolean;
  }>({
    fullName: "",
    email: "",
    phone: "",
    role: "user",
    isActive: true,
  });

  const [permissions, setPermissions] = useState({
    manageProducts: false,
    manageOrders: false,
    manageUsers: false,
    viewReports: false,
    manageCoupons: false,
  });

  useEffect(() => {
    if (!id) return;
    const loadUser = async () => {
      setIsLoading(true);
      const user = await fetchUserById(id);
      if (user) {
        setFormData({
          fullName: user.fullName || "",
          email: user.email || "",
          phone: user.phone || "",
          role: user.role || "user",
          isActive: user.isActive ?? true,
        });
        if (user.permissions) {
          setPermissions({
            manageProducts: user.permissions.manageProducts ?? false,
            manageOrders: user.permissions.manageOrders ?? false,
            manageUsers: user.permissions.manageUsers ?? false,
            viewReports: user.permissions.viewReports ?? false,
            manageCoupons: user.permissions.manageCoupons ?? false,
          });
        }
      } else {
        toast.error("Không tìm thấy người dùng");
        navigate("/users");
      }
      setIsLoading(false);
    };
    loadUser();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, role: value as 'user' | 'admin' }));
    if (value === "admin") {
      setPermissions({
        manageProducts: true,
        manageOrders: true,
        manageUsers: true,
        viewReports: true,
        manageCoupons: true,
      });
    }
  };

  const togglePermission = (key: keyof typeof permissions) => {
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setIsSaving(true);

    const payload = {
      fullName: formData.fullName,
      phone: formData.phone,
      role: formData.role,
      isActive: formData.isActive,
      permissions,
    };

    const result = await updateUser(id, payload);

    if (result.success) {
      toast.success(result.message);
      setTimeout(() => navigate("/users"), 1000);
    } else {
      toast.error(result.message);
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
        <p className="text-sm text-zinc-500">
          Đang tải thông tin người dùng...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <Button
        variant="ghost"
        onClick={() => navigate("/users")}
        className="mb-4 hover:bg-zinc-100"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại danh sách
      </Button>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* --- LEFT COL: BASIC INFO --- */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-sm overflow-hidden">
              <CardHeader className="bg-zinc-900 text-white py-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-zinc-800 rounded-lg">
                    <UserCog size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Thông tin người dùng</h3>
                    <p className="text-zinc-400 text-xs">
                      Chỉnh sửa thông tin cá nhân
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-zinc-700">
                      Họ và tên
                    </Label>
                    <div className="relative">
                      <Input
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="Nguyễn Văn A"
                        required
                        className="pl-10 h-12 rounded-xl border-zinc-200 focus:ring-zinc-900"
                      />
                      <Shield
                        className="absolute left-3 top-3.5 text-zinc-400"
                        size={18}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-zinc-700">
                      Email
                    </Label>
                    <div className="relative">
                      <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        disabled
                        className="pl-10 h-12 rounded-xl border-zinc-200 bg-zinc-50 text-zinc-500 cursor-not-allowed"
                      />
                      <Mail
                        className="absolute left-3 top-3.5 text-zinc-400"
                        size={18}
                      />
                    </div>
                    <p className="text-[10px] text-zinc-400 italic">
                      * Email không thể thay đổi
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-zinc-700">
                      Số điện thoại
                    </Label>
                    <div className="relative">
                      <Input
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="0912345678"
                        className="pl-10 h-12 rounded-xl border-zinc-200"
                      />
                      <Phone
                        className="absolute left-3 top-3.5 text-zinc-400"
                        size={18}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-zinc-700">
                      Trạng thái
                    </Label>
                    <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl border border-zinc-100 h-12">
                      <span
                        className={`text-sm font-bold ${formData.isActive ? "text-green-600" : "text-red-500"}`}
                      >
                        {formData.isActive ? "Đang hoạt động" : "Đã khóa"}
                      </span>
                      <Switch
                        checked={formData.isActive}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({
                            ...prev,
                            isActive: checked,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* --- PERMISSIONS SECTION --- */}
            <Card className="border-none shadow-sm overflow-hidden">
              <CardHeader className="bg-white border-b border-zinc-100 py-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-zinc-100 rounded-lg text-zinc-900">
                    <Shield size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900">
                      Phân quyền chi tiết
                    </h3>
                    <p className="text-zinc-500 text-xs">
                      Bật/Tắt các quyền hạn cụ thể
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                  <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                    <div>
                      <p className="font-bold text-zinc-800">
                        Quản lý sản phẩm
                      </p>
                      <p className="text-xs text-zinc-500">
                        Xem, thêm, sửa, xóa sản phẩm
                      </p>
                    </div>
                    <Switch
                      checked={permissions.manageProducts}
                      onCheckedChange={() => togglePermission("manageProducts")}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                    <div>
                      <p className="font-bold text-zinc-800">
                        Quản lý đơn hàng
                      </p>
                      <p className="text-xs text-zinc-500">
                        Duyệt và cập nhật trạng thái đơn
                      </p>
                    </div>
                    <Switch
                      checked={permissions.manageOrders}
                      onCheckedChange={() => togglePermission("manageOrders")}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                    <div>
                      <p className="font-bold text-zinc-800">
                        Quản lý khách hàng
                      </p>
                      <p className="text-xs text-zinc-500">
                        Xem thông tin và phân quyền user
                      </p>
                    </div>
                    <Switch
                      checked={permissions.manageUsers}
                      onCheckedChange={() => togglePermission("manageUsers")}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                    <div>
                      <p className="font-bold text-zinc-800">Xem báo cáo</p>
                      <p className="text-xs text-zinc-500">
                        Truy cập doanh thu và thống kê
                      </p>
                    </div>
                    <Switch
                      checked={permissions.viewReports}
                      onCheckedChange={() => togglePermission("viewReports")}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                    <div>
                      <p className="font-bold text-zinc-800">
                        Khuyến mãi & Coupon
                      </p>
                      <p className="text-xs text-zinc-500">
                        Quản lý các chiến dịch giảm giá
                      </p>
                    </div>
                    <Switch
                      checked={permissions.manageCoupons}
                      onCheckedChange={() => togglePermission("manageCoupons")}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* --- RIGHT COL: ROLE & SUBMIT --- */}
          <div className="space-y-6">
            <Card className="border-none shadow-sm">
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-zinc-700">
                    Vai trò hệ thống
                  </Label>
                  <Select
                    value={formData.role}
                    onValueChange={handleRoleChange}
                  >
                    <SelectTrigger className="h-12 rounded-xl border-zinc-200">
                      <SelectValue placeholder="Chọn vai trò" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Khách hàng (User)</SelectItem>
                      <SelectItem value="admin">
                        Quản trị viên (Admin)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-6 border-t border-zinc-100">
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="w-full h-14 bg-zinc-900 hover:bg-zinc-800 text-white font-black rounded-2xl shadow-xl shadow-zinc-900/20 transition-all active:scale-[0.98] disabled:opacity-70"
                  >
                    {isSaving ? (
                      <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-5 w-5" /> LƯU THAY ĐỔI
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="p-6 bg-zinc-50 border border-zinc-100 rounded-2xl">
              <p className="text-xs text-zinc-500 font-medium leading-relaxed text-center italic">
                Thay đổi sẽ được lưu ngay lập tức sau khi nhấn nút "Lưu thay
                đổi".
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditUser;
