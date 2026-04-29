import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trash2, Plus, Upload, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { fetchCategories, type Category } from "@/services/categoryService";
import { useProductForm } from "@/hooks/useProductForm";
import { usePageTitle } from "@/contexts/PageTitleContext";
import { RichTextEditor } from "@/components/products/RichTextEditor";
import { SpecRow } from "@/components/products/SpecRow";
import { VariantSection } from "@/components/products/VariantSection";
import { defaultFormData } from "@/types/addProductTypes";

const EditProduct: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  usePageTitle("Chỉnh Sửa Sản Phẩm");

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);

  const {
    formData, setFormData, newTag, setNewTag, newSpecProperty, setNewSpecProperty,
    newSpecValue, setNewSpecValue, isSubmitting, handleChange, addTag,
    removeTag, updateSpec, deleteSpec, addNewSpec, handleImageUpload,
    removeImage, calculateFinalPrice, handleGoBack, handleSubmit,
  } = useProductForm(defaultFormData, "edit");

  useEffect(() => {
    const initData = async () => {
      try {
        const catData = await fetchCategories();
        setCategories(catData);

        if (id) {
          const res = await fetch(`http://localhost:5001/api/products/${id}`);
          const productProps = await res.json();

          if (setFormData && productProps.data) {
            setFormData({
              ...defaultFormData,
              ...productProps.data,
              id: productProps.data._id || id,
              category: productProps.data.categoryId?._id || productProps.data.categoryId || "",
            });
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Lỗi khi tải dữ liệu sản phẩm");
      } finally {
        setLoadingCategories(false);
        setIsLoadingProduct(false);
      }
    };
    initData();
  }, [id, setFormData]);

  if (isLoadingProduct) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 md:p-6 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" onClick={handleGoBack} className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Quay trở về</span>
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Chỉnh Sửa Sản Phẩm</h1>
          <div className="w-32" />
        </div>

        <Card className="shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold">Thông Tin Sản Phẩm</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Thông Tin Cơ Bản */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-muted/20">
                <CardTitle className="text-lg">Thông Tin Cơ Bản</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-4">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Tên sản phẩm:</Label>
                        <Input id="name" value={formData.name || ""} onChange={(e) => handleChange("name", e.target.value)} className="mt-1" required />
                      </div>
                      <div>
                        <Label htmlFor="manufacturer">Nhà sản xuất:</Label>
                        <Input id="manufacturer" value={formData.manufacturer || ""} onChange={(e) => handleChange("manufacturer", e.target.value)} className="mt-1" required />
                      </div>
                      <div>
                        <Label htmlFor="id">Mã sản phẩm:</Label>
                        <Input id="id" value={formData.id || ""} onChange={(e) => handleChange("id", e.target.value)} className="mt-1" disabled />
                      </div>
                      <div>
                        <Label>Thẻ tag:</Label>
                        <div className="flex space-x-2 mt-1">
                          <Input value={newTag} onChange={(e) => setNewTag(e.target.value)} onKeyPress={(e) => e.key === "Enter" && addTag()} placeholder="Thêm từ khóa (Enter để thêm)" className="flex-1" />
                          <Button type="button" onClick={addTag} variant="secondary">Thêm</Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {formData.tags?.map((tag: string) => (
                            <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                              {tag}
                              <Button variant="ghost" size="sm" onClick={() => removeTag(tag)} className="h-4 w-4 p-0 hover:bg-destructive/10" type="button">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-md font-medium">Loại Sản Phẩm</h4>
                    <div>
                      <Label>Danh mục:</Label>
                      {loadingCategories ? (
                        <div className="mt-1 text-sm text-muted-foreground">Đang tải danh mục...</div>
                      ) : (
                        <Select value={formData.category} onValueChange={(value) => handleChange("category", value)}>
                          <SelectTrigger className="mt-1"><SelectValue placeholder="Chọn danh mục" /></SelectTrigger>
                          <SelectContent>
                            {categories.filter((cat) => cat.isActive).map((cat) => (
                              <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="stockQuantity">Số lượng trong kho:</Label>
                        <Input id="stockQuantity" type="number" min={0} value={formData.stockQuantity || 0} onChange={(e) => handleChange("stockQuantity", e.target.value)} className="mt-1" />
                      </div>
                      <div>
                        <Label>Trạng thái kho:</Label>
                        <Select value={formData.stockStatus || "Instock"} onValueChange={(value) => handleChange("stockStatus", value)}>
                          <SelectTrigger className="mt-1"><SelectValue placeholder="Chọn" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Instock">Có sẵn</SelectItem>
                            <SelectItem value="Outofstock">Không có</SelectItem>
                            <SelectItem value="Preorder">Sắp có</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Biến Thể Sản Phẩm */}
            <VariantSection 
              variants={formData.variants || []} 
              onChange={(variants) => handleChange("variants", variants)} 
              basePrice={formData.basePrice || 0} 
            />

            {/* Hình Ảnh */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-muted/20">
                <CardTitle className="text-lg">Hình Ảnh</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="border-2 border-dashed border-input rounded-lg p-8 text-center hover:border-primary transition-colors">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground mb-2">Kéo thả hình ảnh vào đây hoặc</p>
                  <Button type="button" variant="outline" asChild className="mt-2">
                    <label htmlFor="image-upload-edit">
                      Duyệt file
                      <Input id="image-upload-edit" type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                  </Button>
                  {formData.images?.length > 0 && (
                    <div className="mb-6">
                      <h5 className="text-sm font-medium mb-3">Hình ảnh đã chọn:</h5>
                      <div className="grid grid-cols-6 gap-6">
                        {formData.images.map((img: any, idx: number) => (
                          <div key={idx} className="relative w-40 h-40 rounded-md shadow-sm overflow-hidden">
                            <img src={typeof img === "string" ? img : URL.createObjectURL(img)} alt="Preview" className="w-full h-full object-cover" />
                            <Button type="button" variant="ghost" size="sm" className="absolute top-1 right-1 h-5 w-5 p-0 bg-destructive text-destructive-foreground z-10" onClick={() => removeImage(idx)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Chi Tiết */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-muted/20">
                <CardTitle className="text-lg">Chi Tiết</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <Label>Mô tả sản phẩm:</Label>
                  <RichTextEditor value={formData.description || ""} onChange={(value: string) => handleChange("description", value)} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="importStatus">Trạng thái nhập khẩu:</Label>
                    <Select value={formData.importStatus || "Imported"} onValueChange={(value) => handleChange("importStatus", value)}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Chọn" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Imported">Đã nhập khẩu</SelectItem>
                        <SelectItem value="Processing">Hàng gia công</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="origin">Quốc gia gốc:</Label>
                    <Select value={formData.origin || "vietnam"} onValueChange={(value) => handleChange("origin", value)}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Chọn" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vietnam">Việt Nam</SelectItem>
                        <SelectItem value="china">Trung Quốc</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="releaseDate">Ngày phát hành:</Label>
                    <Input id="releaseDate" type="date" value={formData.releaseDate || ""} onChange={(e) => handleChange("releaseDate", e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="warrantyLength">Độ dài bảo hành:</Label>
                    <Input id="warrantyLength" value={formData.warrantyLength || ""} onChange={(e) => handleChange("warrantyLength", e.target.value)} placeholder="e.g., 1 năm" className="mt-1" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Thông Số Kỹ Thuật */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-muted/20">
                <CardTitle className="text-lg">Thông Số Kỹ Thuật</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-0">
                  {formData.specs?.map((spec: any, index: number) => (
                    <SpecRow key={index} index={index} spec={spec} onUpdate={updateSpec} onDelete={deleteSpec} />
                  ))}
                </div>
                <Separator className="my-4" />
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Input placeholder="Thuộc tính (e.g., Processor)" value={newSpecProperty} onChange={(e) => setNewSpecProperty(e.target.value)} className="flex-1" />
                    <Input placeholder="Giá trị (e.g., 2.3GHz quad-core)" value={newSpecValue} onChange={(e) => setNewSpecValue(e.target.value)} className="flex-1" />
                    <Button type="button" variant="outline" size="sm" onClick={addNewSpec} disabled={!newSpecProperty.trim() || !newSpecValue.trim()}>
                      <Plus className="h-4 w-4 mr-2" />Thêm
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground">Nhập thuộc tính và giá trị, sau đó nhấn Thêm để lưu vào danh sách.</div>
                </div>
              </CardContent>
            </Card>

            {/* Giá Cả */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-muted/20">
                <CardTitle className="text-lg">Giá Cả</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-end space-x-4">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="basePrice" className="text-sm font-medium">Giá gốc:</Label>
                    <div className="flex items-center space-x-2">
                      <Input id="basePrice" type="number" value={formData.basePrice || 0} onChange={(e) => handleChange("basePrice", e.target.value)} className="flex-1" required />
                      <Select value={formData.currency || "VND"} onValueChange={(value) => handleChange("currency", value)}>
                        <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="VND">VND</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="discount" className="text-sm font-medium">Giảm giá (%):</Label>
                    <Input id="discount" type="number" min={0} max={100} value={formData.discount || 0} onChange={(e) => handleChange("discount", e.target.value)} className="w-full" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="finalPrice" className="text-sm font-medium">Giá cuối:</Label>
                    <Input id="finalPrice" type="number" value={calculateFinalPrice()} readOnly className="w-full bg-muted/50" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Buttons */}
            <div className="flex justify-between pt-6 border-t">
              <Button type="button" variant="outline" onClick={handleGoBack} className="px-6">
                <ArrowLeft className="h-4 w-4 mr-2" />Hủy
              </Button>
              <Button type="button" onClick={handleSubmit} disabled={isSubmitting || loadingCategories} className="px-8 bg-blue-600 hover:bg-blue-700 text-white">
                {isSubmitting ? "Đang lưu..." : "Lưu Thay Đổi"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditProduct;
