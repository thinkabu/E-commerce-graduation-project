import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, ImagePlus, CheckCircle2, Loader2 } from "lucide-react";
import { usePageTitle } from "@/contexts/PageTitleContext";
import { toast } from "sonner";
import {
  fetchBannerById,
  createBanner,
  updateBanner,
} from "@/services/bannerService";

const BannerForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  usePageTitle(isEdit ? "Chỉnh Sửa Banner" : "Thêm Banner Mới");

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEdit);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    image: "",
    link: "",
    position: 0,
    isActive: true,
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    if (id) {
      const loadBanner = async () => {
        setIsFetching(true);
        const banner = await fetchBannerById(id);
        if (banner) {
          setFormData({
            title: banner.title || "",
            subtitle: banner.subtitle || "",
            image: banner.image || "",
            link: banner.link || "",
            position: banner.position || 0,
            isActive: banner.isActive ?? true,
            startDate: banner.startDate
              ? new Date(banner.startDate).toISOString().slice(0, 16)
              : "",
            endDate: banner.endDate
              ? new Date(banner.endDate).toISOString().slice(0, 16)
              : "",
          });
        } else {
          toast.error("Không tìm thấy banner");
          navigate("/banners");
        }
        setIsFetching(false);
      };
      loadBanner();
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
      startDate: formData.startDate
        ? new Date(formData.startDate).toISOString()
        : undefined,
      endDate: formData.endDate
        ? new Date(formData.endDate).toISOString()
        : undefined,
    };

    const result = isEdit
      ? await updateBanner(id!, payload)
      : await createBanner(payload);

    if (result.success) {
      toast.success(result.message);
      setTimeout(() => navigate("/banners"), 1000);
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
      <Button
        variant="ghost"
        onClick={() => navigate("/banners")}
        className="mb-4 hover:bg-zinc-100"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại danh sách
      </Button>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader className="bg-zinc-900 text-white py-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-zinc-800 rounded-lg">
                <ImagePlus size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold">
                  {isEdit ? "Chỉnh sửa banner" : "Tạo banner mới"}
                </h3>
                <p className="text-zinc-400 text-xs">
                  Banner sẽ hiển thị trên trang chủ ứng dụng
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-bold text-zinc-700">
                  Tiêu đề *
                </Label>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Flash Sale 50%"
                  required
                  className="h-12 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold text-zinc-700">
                  Phụ đề
                </Label>
                <Input
                  name="subtitle"
                  value={formData.subtitle}
                  onChange={handleChange}
                  placeholder="Tuần lễ công nghệ"
                  className="h-12 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-bold text-zinc-700">
                URL Hình ảnh *
              </Label>
              <Input
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://res.cloudinary.com/..."
                required
                className="h-12 rounded-xl"
              />
              {formData.image && (
                <div className="mt-3 rounded-2xl overflow-hidden border border-zinc-200 max-h-48">
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-bold text-zinc-700">
                  Link điều hướng
                </Label>
                <Input
                  name="link"
                  value={formData.link}
                  onChange={handleChange}
                  placeholder="/category/sale"
                  className="h-12 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold text-zinc-700">
                  Vị trí hiển thị
                </Label>
                <Input
                  name="position"
                  type="number"
                  value={formData.position}
                  onChange={handleChange}
                  min={0}
                  className="h-12 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-bold text-zinc-700">
                  Ngày bắt đầu
                </Label>
                <Input
                  name="startDate"
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="h-12 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold text-zinc-700">
                  Ngày kết thúc
                </Label>
                <Input
                  name="endDate"
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="h-12 rounded-xl"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
              <div>
                <p className="font-bold text-zinc-800">Hiển thị banner</p>
                <p className="text-xs text-zinc-500">
                  Banner sẽ xuất hiện trên trang chủ khi bật
                </p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isActive: checked }))
                }
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
                  {isEdit ? "CẬP NHẬT BANNER" : "TẠO BANNER"}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default BannerForm;
