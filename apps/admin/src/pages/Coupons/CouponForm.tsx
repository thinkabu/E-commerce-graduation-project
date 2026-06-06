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
import { ArrowLeft, Ticket, CheckCircle2, Loader2 } from "lucide-react";
import { usePageTitle } from "@/contexts/PageTitleContext";
import { toast } from "sonner";
import { fetchCouponById, createCoupon, updateCoupon } from "@/services/couponService";

const CouponForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  usePageTitle(isEdit ? "Chỉnh Sửa Mã Giảm Giá" : "Tạo Mã Giảm Giá");

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEdit);
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "PERCENTAGE" as "PERCENTAGE" | "FIXED_AMOUNT",
    discountValue: 0,
    minOrderAmount: 0,
    maxDiscountAmount: 0,
    usageLimit: 100,
    usageLimitPerUser: 1,
    startDate: "",
    endDate: "",
    isActive: true,
  });

  useEffect(() => {
    if (id) {
      const loadCoupon = async () => {
        setIsFetching(true);
        const coupon = await fetchCouponById(id);
        if (coupon) {
          setFormData({
            code: coupon.code || "",
            description: coupon.description || "",
            discountType: coupon.discountType || "PERCENTAGE",
            discountValue: coupon.discountValue || 0,
            minOrderAmount: coupon.minOrderAmount || 0,
            maxDiscountAmount: coupon.maxDiscountAmount || 0,
            usageLimit: coupon.usageLimit || 100,
            usageLimitPerUser: coupon.usageLimitPerUser || 1,
            startDate: coupon.startDate ? new Date(coupon.startDate).toISOString().slice(0, 16) : "",
            endDate: coupon.endDate ? new Date(coupon.endDate).toISOString().slice(0, 16) : "",
            isActive: coupon.isActive ?? true,
          });
        } else {
          toast.error("Không tìm thấy mã giảm giá");
          navigate("/coupons");
        }
        setIsFetching(false);
      };
      loadCoupon();
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      ...formData,
      code: formData.code.toUpperCase(),
      startDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
      endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
    };

    const result = isEdit
      ? await updateCoupon(id!, payload)
      : await createCoupon(payload);

    if (result.success) {
      toast.success(result.message);
      setTimeout(() => navigate("/coupons"), 1000);
    } else {
      toast.error(result.message);
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
        <p className="text-sm text-zinc-500">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <Button variant="ghost" onClick={() => navigate("/coupons")} className="mb-4 hover:bg-zinc-100">
        <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại danh sách
      </Button>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader className="bg-zinc-900 text-white py-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-zinc-800 rounded-lg">
                <Ticket size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold">{isEdit ? "Chỉnh sửa mã giảm giá" : "Tạo mã giảm giá mới"}</h3>
                <p className="text-zinc-400 text-xs">Thiết lập thông tin khuyến mãi</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            {/* Row 1: Code + Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-bold text-zinc-700">Mã giảm giá *</Label>
                <Input
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="VD: SUMMER2026"
                  required
                  className="h-12 rounded-xl uppercase font-mono tracking-widest"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold text-zinc-700">Loại giảm giá *</Label>
                <Select
                  value={formData.discountType}
                  onValueChange={(v) => setFormData((prev) => ({ ...prev, discountType: v as any }))}
                >
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">Phần trăm (%)</SelectItem>
                    <SelectItem value="FIXED_AMOUNT">Số tiền cố định (₫)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-sm font-bold text-zinc-700">Mô tả</Label>
              <Input name="description" value={formData.description} onChange={handleChange} placeholder="Giảm giá mùa hè cho tất cả sản phẩm" className="h-12 rounded-xl" />
            </div>

            {/* Row 2: Value + Max Discount */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-bold text-zinc-700">
                  Giá trị giảm {formData.discountType === "PERCENTAGE" ? "(%)" : "(₫)"} *
                </Label>
                <Input name="discountValue" type="number" value={formData.discountValue} onChange={handleChange} min={0} required className="h-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold text-zinc-700">Giảm tối đa (₫)</Label>
                <Input name="maxDiscountAmount" type="number" value={formData.maxDiscountAmount} onChange={handleChange} min={0} className="h-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold text-zinc-700">Đơn tối thiểu (₫)</Label>
                <Input name="minOrderAmount" type="number" value={formData.minOrderAmount} onChange={handleChange} min={0} className="h-12 rounded-xl" />
              </div>
            </div>

            {/* Row 3: Usage limits */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-bold text-zinc-700">Tổng lượt sử dụng tối đa</Label>
                <Input name="usageLimit" type="number" value={formData.usageLimit} onChange={handleChange} min={0} className="h-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold text-zinc-700">Giới hạn/người dùng</Label>
                <Input name="usageLimitPerUser" type="number" value={formData.usageLimitPerUser} onChange={handleChange} min={1} className="h-12 rounded-xl" />
              </div>
            </div>

            {/* Row 4: Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-bold text-zinc-700">Ngày bắt đầu *</Label>
                <Input name="startDate" type="datetime-local" value={formData.startDate} onChange={handleChange} required className="h-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold text-zinc-700">Ngày kết thúc *</Label>
                <Input name="endDate" type="datetime-local" value={formData.endDate} onChange={handleChange} required className="h-12 rounded-xl" />
              </div>
            </div>

            {/* Active toggle */}
            <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
              <div>
                <p className="font-bold text-zinc-800">Kích hoạt mã giảm giá</p>
                <p className="text-xs text-zinc-500">Mã chỉ hoạt động khi được bật</p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-zinc-900 hover:bg-zinc-800 text-white font-black rounded-2xl shadow-xl shadow-zinc-900/20 transition-all active:scale-[0.98]"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  {isEdit ? "CẬP NHẬT MÃ" : "TẠO MÃ GIẢM GIÁ"}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default CouponForm;
