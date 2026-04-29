import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { ProductFormData } from "@/types/addProductTypes";
import { defaultFormData } from "@/types/addProductTypes";

export const useProductForm = (initialData: ProductFormData, mode: "add" | "edit" = "add") => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<ProductFormData>({
    ...defaultFormData,
    ...initialData,
  });

  // Tag management
  const [newTag, setNewTag] = useState("");

  // Spec management
  const [newSpecProperty, setNewSpecProperty] = useState("");
  const [newSpecValue, setNewSpecValue] = useState("");

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generic field change handler
  const handleChange = useCallback((field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  // --- Tags ---
  const addTag = useCallback(() => {
    const trimmed = newTag.trim();
    if (!trimmed) return;
    setFormData((prev) => {
      if (prev.tags.includes(trimmed)) {
        toast.warning("Tag đã tồn tại!");
        return prev;
      }
      return { ...prev, tags: [...prev.tags, trimmed] };
    });
    setNewTag("");
  }, [newTag]);

  const removeTag = useCallback((tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagToRemove),
    }));
  }, []);

  // --- Specs ---
  const updateSpec = useCallback(
    (index: number, field: "key" | "value", value: string) => {
      setFormData((prev) => {
        const newSpecs = [...prev.specs];
        newSpecs[index] = { ...newSpecs[index], [field]: value };
        return { ...prev, specs: newSpecs };
      });
    },
    []
  );

  const deleteSpec = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      specs: prev.specs.filter((_, i) => i !== index),
    }));
  }, []);

  const addNewSpec = useCallback(() => {
    const key = newSpecProperty.trim();
    const value = newSpecValue.trim();
    if (!key || !value) return;
    setFormData((prev) => ({
      ...prev,
      specs: [...prev.specs, { key, value }],
    }));
    setNewSpecProperty("");
    setNewSpecValue("");
  }, [newSpecProperty, newSpecValue]);

  // --- Images ---
  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;
      const fileArray = Array.from(files);
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...fileArray],
      }));
      // Reset input để có thể chọn lại cùng file
      e.target.value = "";
    },
    []
  );

  const removeImage = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  }, []);

  // --- Price calculation ---
  const calculateFinalPrice = useCallback(() => {
    const base = Number(formData.basePrice) || 0;
    const discount = Number(formData.discount) || 0;
    return Math.round(base * (1 - discount / 100));
  }, [formData.basePrice, formData.discount]);

  // --- Navigation ---
  const handleGoBack = useCallback(() => {
    navigate("/products");
  }, [navigate]);

  // --- Submit ---
  const handleSubmit = useCallback(async () => {
    // Basic validation
    if (!formData.name.trim()) {
      toast.error("Vui lòng nhập tên sản phẩm!");
      return;
    }

    setIsSubmitting(true);
    try {
      // Build FormData for multipart upload
      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("description", formData.description);
      if (formData.category) submitData.append("categoryId", formData.category);
      if (formData.manufacturer) submitData.append("manufacturer", formData.manufacturer);
      if (formData.origin) submitData.append("origin", formData.origin);
      submitData.append("basePrice", String(formData.basePrice || 0));
      submitData.append("currency", formData.currency || "VND");
      submitData.append("discount", String(formData.discount || 0));
      submitData.append("finalPrice", String(calculateFinalPrice()));
      submitData.append("stockQuantity", String(formData.stockQuantity || 0));
      submitData.append("stockStatus", formData.stockStatus || "Instock");
      submitData.append("importStatus", formData.importStatus || "Imported");
      if (formData.releaseDate) submitData.append("releaseDate", formData.releaseDate);
      if (formData.warrantyLength) submitData.append("warrantyLength", formData.warrantyLength);

      // Tags
      if (formData.tags.length > 0) {
        submitData.append("tags", JSON.stringify(formData.tags));
      }

      // Specs
      if (formData.specs.length > 0) {
        submitData.append("specs", JSON.stringify(formData.specs));
      }

      // Variants
      if (formData.variants && formData.variants.length > 0) {
        submitData.append("variants", JSON.stringify(formData.variants));
      }

      // Images - File objects (new uploads)
      const existingImageUrls: string[] = [];
      formData.images.forEach((img) => {
        if (img instanceof File) {
          submitData.append("images", img);
        } else if (typeof img === "string") {
          existingImageUrls.push(img);
        }
      });
      if (existingImageUrls.length > 0) {
        submitData.append("existingImages", JSON.stringify(existingImageUrls));
      }

      const url =
        mode === "edit" && formData.id
          ? `http://localhost:5001/api/products/${formData.id}`
          : "http://localhost:5001/api/products";

      const method = mode === "edit" ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        body: submitData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || "Lỗi khi lưu sản phẩm");
      }

      toast.success(
        mode === "edit"
          ? "Cập nhật sản phẩm thành công!"
          : "Thêm sản phẩm thành công!"
      );
      navigate("/products");
    } catch (error: any) {
      console.error("Submit error:", error);
      toast.error(error.message || "Đã xảy ra lỗi khi lưu sản phẩm");
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, mode, navigate, calculateFinalPrice]);

  return {
    formData,
    setFormData,
    newTag,
    setNewTag,
    newSpecProperty,
    setNewSpecProperty,
    newSpecValue,
    setNewSpecValue,
    isSubmitting,
    handleChange,
    addTag,
    removeTag,
    updateSpec,
    deleteSpec,
    addNewSpec,
    handleImageUpload,
    removeImage,
    calculateFinalPrice,
    handleGoBack,
    handleSubmit,
  };
};
