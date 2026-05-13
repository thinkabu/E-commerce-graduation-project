import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Upload, Trash2, ArrowLeft, Save } from "lucide-react";
import { usePageTitle } from "@/contexts/PageTitleContext";
import {
  fetchCategories,
  getCategoryById,
  createCategory,
  updateCategory,
} from "@/services/categoryService";
import type { Category } from "@/services/categoryService";
import { uploadImages } from "@/services/productService"; // Reuse upload service
import { generateSlug } from "@/services/productService"; // Reuse slug generator

const CategoryForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();

  usePageTitle(isEditMode ? "Sửa Danh Mục" : "Thêm Danh Mục");

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    parentId: "none", // 'none' means null
    isActive: true,
    sortOrder: 0,
    image: null as File | string | null,
  });

  useEffect(() => {
    loadCategories();
    if (isEditMode && id) {
      loadCategoryData(id);
    }
  }, [id, isEditMode]);

  const loadCategories = async () => {
    try {
      const data = await fetchCategories();
      // Filter out current category from parents to avoid circular dependency
      setCategories(data.filter((c) => c._id !== id));
    } catch (error) {
      toast.error("Không thể tải danh sách danh mục");
    }
  };

  const loadCategoryData = async (categoryId: string) => {
    try {
      setLoading(true);
      const data = await getCategoryById(categoryId);
      if (data) {
        setFormData({
          name: data.name || "",
          slug: data.slug || "",
          description: data.description || "",
          parentId: data.parentId || "none",
          isActive: data.isActive !== undefined ? data.isActive : true,
          sortOrder: data.sortOrder || 0,
          image: data.image || null,
        });
      }
    } catch (error) {
      toast.error("Không thể tải dữ liệu danh mục");
      navigate("/category");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };
      if (field === "name" && !isEditMode) {
        newData.slug = generateSlug(value);
      }
      return newData;
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setFormData((prev) => ({ ...prev, image: files[0] }));
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Vui lòng nhập tên danh mục!");
      return;
    }

    setLoading(true);
    try {
      let imageUrl = typeof formData.image === "string" ? formData.image : "";

      // Upload new image if it's a file
      if (formData.image instanceof File) {
        toast.info("Đang tải ảnh lên...");
        const uploadedUrls = await uploadImages([formData.image]);
        if (uploadedUrls.length > 0) {
          imageUrl = uploadedUrls[0];
        }
      }

      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim() || generateSlug(formData.name),
        description: formData.description.trim(),
        parentId: formData.parentId === "none" ? null : formData.parentId,
        isActive: formData.isActive,
        sortOrder: Number(formData.sortOrder) || 0,
        image: imageUrl,
      };

      if (isEditMode && id) {
        await updateCategory(id, payload);
        toast.success("Cập nhật danh mục thành công!");
      } else {
        await createCategory(payload);
        toast.success("Thêm danh mục thành công!");
      }

      navigate("/category");
    } catch (error: any) {
      toast.error(error.message || "Đã xảy ra lỗi khi lưu danh mục");
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode && !formData.name) {
    return <div className="p-8 text-center text-muted-foreground">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/category")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl font-bold tracking-tight">
            {isEditMode ? "Sửa Danh Mục" : "Thêm Danh Mục Mới"}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate("/category")}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {isEditMode ? "Cập Nhật" : "Thêm Mới"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin chung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Tên danh mục <span className="text-destructive">*</span></Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Nhập tên danh mục..."
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="slug">Đường dẫn (Slug)</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => handleChange("slug", e.target.value)}
                  placeholder="e.g., dien-thoai-di-dong"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Đường dẫn sẽ được tạo tự động nếu để trống.
                </p>
              </div>

              <div>
                <Label htmlFor="description">Mô tả</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Mô tả ngắn gọn về danh mục..."
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Phân cấp & Sắp xếp</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Danh mục cha</Label>
                  <Select
                    value={formData.parentId || "none"}
                    onValueChange={(val) => handleChange("parentId", val)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Chọn danh mục cha" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">-- Không có (Danh mục gốc) --</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat._id} value={cat._id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="sortOrder">Thứ tự hiển thị</Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    min={0}
                    value={formData.sortOrder || ""}
                    onChange={(e) => handleChange("sortOrder", Number(e.target.value))}
                    placeholder="0"
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Trạng thái</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Hiển thị danh mục</Label>
                  <p className="text-xs text-muted-foreground">
                    Bật để hiển thị trên website
                  </p>
                </div>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(val) => handleChange("isActive", val)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hình Ảnh</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-input rounded-lg p-6 text-center hover:border-primary transition-colors">
                {!formData.image ? (
                  <>
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-4">Tải lên ảnh minh họa</p>
                    <Button type="button" variant="outline" size="sm" asChild>
                      <label htmlFor="category-image">
                        Chọn file
                        <Input
                          id="category-image"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                      </label>
                    </Button>
                  </>
                ) : (
                  <div className="relative">
                    <img
                      src={
                        typeof formData.image === "string"
                          ? formData.image
                          : URL.createObjectURL(formData.image)
                      }
                      alt="Category Preview"
                      className="w-full h-40 object-cover rounded-md"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6"
                      onClick={removeImage}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CategoryForm;
