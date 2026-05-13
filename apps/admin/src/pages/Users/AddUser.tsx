import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { ArrowLeft, UserPlus, Shield, Mail, Phone, Lock, CheckCircle2 } from "lucide-react";
import { usePageTitle } from "@/contexts/PageTitleContext";
import { toast } from "sonner";
import { createUser } from "@/services/userService";

const AddUser: React.FC = () => {
  const navigate = useNavigate();
  usePageTitle("Thêm Người Dùng Mới");

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    role: "user",
  });

  const [permissions, setPermissions] = useState({
    manageProducts: false,
    manageOrders: false,
    manageUsers: false,
    viewReports: false,
    manageCoupons: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, role: value }));
    // Tự động set permission dựa theo role
    if (value === "admin") {
      setPermissions({
        manageProducts: true,
        manageOrders: true,
        manageUsers: true,
        viewReports: true,
        manageCoupons: true,
      });
    } else {
      // Mặc định cho vai trò User (khách hàng)
      setPermissions({
        manageProducts: false,
        manageOrders: false,
        manageUsers: false,
        viewReports: false,
        manageCoupons: false,
      });
    }
  };

  const togglePermission = (key: keyof typeof permissions) => {
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const fullPayload = {
      ...formData,
      permissions
    };

    const result = await createUser(fullPayload);
    
    if (result.success) {
      toast.success(result.message);
      // Quay về trang danh sách sau khi tạo thành công
      setTimeout(() => navigate("/users"), 1000);
    } else {
      toast.error(result.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* --- BACK BUTTON --- */}
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
                    <UserPlus size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Thông tin cơ bản</h3>
                    <p className="text-zinc-400 text-xs">Nhập các thông tin định danh của người dùng</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-zinc-700">Họ và tên</Label>
                    <div className="relative">
                      <Input 
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="Nguyễn Văn A" 
                        required 
                        className="pl-10 h-12 rounded-xl border-zinc-200 focus:ring-zinc-900" 
                      />
                      <Shield className="absolute left-3 top-3.5 text-zinc-400" size={18} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-zinc-700">Email</Label>
                    <div className="relative">
                      <Input 
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="a.nguyen@example.com" 
                        required 
                        className="pl-10 h-12 rounded-xl border-zinc-200" 
                      />
                      <Mail className="absolute left-3 top-3.5 text-zinc-400" size={18} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-zinc-700">Số điện thoại</Label>
                    <div className="relative">
                      <Input 
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="0912345678" 
                        className="pl-10 h-12 rounded-xl border-zinc-200" 
                      />
                      <Phone className="absolute left-3 top-3.5 text-zinc-400" size={18} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-zinc-700">Mật khẩu khởi tạo</Label>
                    <div className="relative">
                      <Input 
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="••••••••" 
                        required 
                        className="pl-10 h-12 rounded-xl border-zinc-200" 
                      />
                      <Lock className="absolute left-3 top-3.5 text-zinc-400" size={18} />
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
                    <h3 className="text-lg font-bold text-zinc-900">Phân quyền chi tiết</h3>
                    <p className="text-zinc-500 text-xs">Bật/Tắt các quyền hạn cụ thể cho người dùng này</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                  <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                    <div>
                      <p className="font-bold text-zinc-800">Quản lý sản phẩm</p>
                      <p className="text-xs text-zinc-500">Xem, thêm, sửa, xóa sản phẩm</p>
                    </div>
                    <Switch 
                      checked={permissions.manageProducts}
                      onCheckedChange={() => togglePermission("manageProducts")}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                    <div>
                      <p className="font-bold text-zinc-800">Quản lý đơn hàng</p>
                      <p className="text-xs text-zinc-500">Duyệt và cập nhật trạng thái đơn</p>
                    </div>
                    <Switch 
                      checked={permissions.manageOrders}
                      onCheckedChange={() => togglePermission("manageOrders")}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                    <div>
                      <p className="font-bold text-zinc-800">Quản lý khách hàng</p>
                      <p className="text-xs text-zinc-500">Xem thông tin và phân quyền user</p>
                    </div>
                    <Switch 
                      checked={permissions.manageUsers}
                      onCheckedChange={() => togglePermission("manageUsers")}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                    <div>
                      <p className="font-bold text-zinc-800">Xem báo cáo</p>
                      <p className="text-xs text-zinc-500">Truy cập doanh thu và thống kê</p>
                    </div>
                    <Switch 
                      checked={permissions.viewReports}
                      onCheckedChange={() => togglePermission("viewReports")}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                    <div>
                      <p className="font-bold text-zinc-800">Khuyến mãi & Coupon</p>
                      <p className="text-xs text-zinc-500">Quản lý các chiến dịch giảm giá</p>
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
                  <Label className="text-sm font-bold text-zinc-700">Vai trò hệ thống</Label>
                  <Select value={formData.role} onValueChange={handleRoleChange}>
                    <SelectTrigger className="h-12 rounded-xl border-zinc-200">
                      <SelectValue placeholder="Chọn vai trò" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Khách hàng (User)</SelectItem>
                      <SelectItem value="admin">Quản trị viên (Admin)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-[10px] text-zinc-400 mt-2 italic">* Vai trò Admin sẽ có toàn quyền truy cập hệ thống</p>
                </div>

                <div className="pt-6 border-t border-zinc-100">
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full h-14 bg-zinc-900 hover:bg-zinc-800 text-white font-black rounded-2xl shadow-xl shadow-zinc-900/20 transition-all active:scale-[0.98] disabled:opacity-70"
                  >
                    {isLoading ? (
                      <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-5 w-5" /> TẠO NGƯỜI DÙNG
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="p-6 bg-zinc-50 border border-zinc-100 rounded-2xl">
              <p className="text-xs text-zinc-500 font-medium leading-relaxed text-center italic">
                {/* 
                  Tạm thời chưa dùng đến email thông báo.
                  "Sau khi tạo, người dùng sẽ nhận được email thông báo để kích hoạt tài khoản và đổi mật khẩu lần đầu." 
                */}
                Vui lòng kiểm tra kỹ thông tin trước khi xác nhận tạo người dùng mới.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddUser;
