import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, ImagePlus, CheckCircle2, Loader2, Upload, Trash2 } from "lucide-react";
import { usePageTitle } from "@/contexts/PageTitleContext";
import { toast } from "sonner";
import {
  fetchBannerById,
  createBanner,
  updateBanner,
} from "@/services/bannerService";
import { uploadImages } from "@/services/productService";

const BannerForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  usePageTitle(isEdit ? "Chỉnh Sửa Banner" : "Thêm Banner Mới");

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEdit);
  const [formData, setFormData] = useState<{
    title: string;
    subtitle: string;
    image: string | File;
    link: string;
    position: number;
    isActive: boolean;
    startDate: string;
    endDate: string;
  }>({
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setFormData((prev) => ({ ...prev, image: files[0] }));
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image) {
      toast.error("Vui lòng tải lên hình ảnh banner!");
      return;
    }

    setIsLoading(true);

    try {
      let imageUrl = typeof formData.image === "string" ? formData.image : "";

      if (formData.image instanceof File) {
        toast.info("Đang tải ảnh lên Cloudinary...");
        const uploadedUrls = await uploadImages([formData.image]);
        if (uploadedUrls.length > 0) {
          imageUrl = uploadedUrls[0];
        } else {
          toast.error("Tải ảnh thất bại!");
          setIsLoading(false);
          return;
        }
      }

      const payload = {
        ...formData,
        image: imageUrl,
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
    } catch (error: any) {
      toast.error("Đã xảy ra lỗi: " + error.message);
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
                Hình ảnh banner *
              </Label>
              <div className="border-2 border-dashed border-zinc-200 hover:border-zinc-400 rounded-2xl p-6 text-center transition-colors relative bg-zinc-50/50">
                {!formData.image ? (
                  <div className="py-4">
                    <Upload className="mx-auto h-10 w-10 text-zinc-400 mb-2" />
                    <p className="text-sm text-zinc-500 mb-4 font-medium">
                      Chọn file ảnh từ thiết bị của bạn
                    </p>
                    <Button type="button" variant="outline" size="sm" asChild className="rounded-xl">
                      <label htmlFor="banner-image-file" className="cursor-pointer">
                        Chọn file
                        <input
                          id="banner-image-file"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                      </label>
                    </Button>
                  </div>
                ) : (
                  <div className="relative rounded-xl overflow-hidden max-h-60 border border-zinc-200">
                    <img
                      src={
                        typeof formData.image === "string"
                          ? formData.image
                          : URL.createObjectURL(formData.image)
                      }
                      alt="Banner Preview"
                      className="w-full h-48 object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-3 right-3 h-8 w-8 rounded-full shadow-lg shadow-red-500/20 hover:scale-105 active:scale-95 transition-transform"
                      onClick={removeImage}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
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
