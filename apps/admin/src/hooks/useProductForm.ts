import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { ProductFormData } from "@/types/addProductTypes";
import { defaultFormData } from "@/types/addProductTypes";
import { createProduct, updateProduct, generateSlug, uploadImages } from "@/services/productService";

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
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };
      
      // Tự động tính tổng tồn kho nếu thay đổi variants
      if (field === "variants" && Array.isArray(value) && value.length > 0) {
        newData.stockQuantity = value.reduce((sum, v) => sum + (Number(v.stockQuantity) || 0), 0);
      }
      
      return newData;
    });
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

  const setCoverImage = useCallback((index: number) => {
    if (index <= 0) return; // Already cover or invalid
    setFormData((prev) => {
      const newImages = [...prev.images];
      const [movedImage] = newImages.splice(index, 1);
      newImages.unshift(movedImage); // Put at the beginning
      return { ...prev, images: newImages };
    });
  }, []);

  // --- Price calculation ---
  const calculateFinalPrice = useCallback(() => {
    const base = Number(formData.basePrice) || 0;
    const discount = Number(formData.discountPercentage) || 0;
    return Math.round(base * (1 - discount / 100));
  }, [formData.basePrice, formData.discountPercentage]);

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
    if (!formData.manufacturer.trim()) {
      toast.error("Vui lòng nhập nhà sản xuất!");
      return;
    }
    if (!formData.productId.trim()) {
      toast.error("Vui lòng nhập mã sản phẩm!");
      return;
    }
    if (!formData.categoryId) {
      toast.error("Vui lòng chọn danh mục!");
      return;
    }
    if (!formData.countryOfOrigin.trim()) {
      toast.error("Vui lòng nhập quốc gia xuất xứ!");
      return;
    }
    if (formData.basePrice <= 0) {
      toast.error("Giá sản phẩm phải lớn hơn 0!");
      return;
    }

    setIsSubmitting(true);
    try {
      // Convert specs array -> specifications object
      const specifications: Record<string, any> = {};
      formData.specs.forEach((spec) => {
        if (spec.key.trim() && spec.value.trim()) {
          specifications[spec.key.trim()] = spec.value.trim();
        }
      });

      // Build variants for backend
      const hasVariants = formData.variants.length > 0;
      const variantAttributes = hasVariants
        ? [...new Set(formData.variants.flatMap((v) => v.attributes.map((a) => a.name)))]
        : [];

      const variants = formData.variants.map((v) => {
        const mappedVariant: Record<string, any> = {
          sku: v.sku,
          variantName: v.variantName,
          attributes: v.attributes,
          price: Number(v.price) || 0,
          discountPercentage: Number(v.discountPercentage) || 0,
          stockQuantity: Number(v.stockQuantity) || 0,
          images: v.images || [],
        };
        if (v._id) {
          mappedVariant._id = v._id;
        }
        return mappedVariant;
      });

      // Tải ảnh cho sản phẩm chính
      const newFiles = formData.images.filter((img) => img && typeof img !== "string");
      const existingUrls = formData.images.filter((img) => typeof img === "string");
      
      let uploadedUrls: string[] = [];
      if (newFiles.length > 0) {
        toast.info(`Đang tải lên ${newFiles.length} ảnh sản phẩm...`);
        try {
          uploadedUrls = await uploadImages(newFiles as File[]);
          toast.success("Tải ảnh sản phẩm thành công!");
        } catch (uploadErr: any) {
          toast.error("Lỗi tải ảnh sản phẩm: " + uploadErr.message);
          throw uploadErr;
        }
      }
      
      const finalImages = [...existingUrls, ...uploadedUrls];

      // Tải ảnh cho từng variant (nếu có File)
      for (let i = 0; i < variants.length; i++) {
        const v = variants[i];
        const vNewFiles = v.images.filter((img: any) => img && typeof img !== "string");
        const vExistingUrls = v.images.filter((img: any) => typeof img === "string");
        
        if (vNewFiles.length > 0) {
          toast.info(`Đang tải ảnh cho biến thể ${v.variantName || i}...`);
          try {
            const vUploadedUrls = await uploadImages(vNewFiles as File[]);
            v.images = [...vExistingUrls, ...vUploadedUrls];
            toast.success(`Tải ảnh biến thể ${v.variantName || i} thành công!`);
          } catch (uploadErr: any) {
            toast.error(`Lỗi tải ảnh biến thể ${v.variantName || i}: ` + uploadErr.message);
            throw uploadErr;
          }
        } else {
          v.images = vExistingUrls;
        }
      }

      console.log("👉 Dữ liệu chuẩn bị gửi lên Backend (Payload):", {
        finalImages,
        variants,
      });

      const payload: Record<string, any> = {
        name: formData.name.trim(),
        manufacturer: formData.manufacturer.trim(),
        productId: formData.productId.trim().toUpperCase(),
        categoryId: formData.categoryId,
        slug: generateSlug(formData.name),
        tags: formData.tags,
        images: finalImages,
        basePrice: Number(formData.basePrice),
        currency: formData.currency || "VND",
        discountPercentage: Number(formData.discountPercentage) || 0,
        description: formData.description || "",
        importStatus: formData.importStatus || "Imported",
        countryOfOrigin: formData.countryOfOrigin.trim(),
        specifications,
        hasVariants,
        variantAttributes,
        isFeatured: formData.isFeatured || false,
      };

      // Optional fields
      if (formData.releaseDate) {
        payload.releaseDate = new Date(formData.releaseDate).toISOString();
      }
      if (formData.warrantyLength) {
        payload.warrantyLength = formData.warrantyLength;
      }

      // Include variants
      if (variants.length > 0) {
        payload.variants = variants;
      }

      if (mode === "edit" && formData.productId) {
        // For edit mode, use the MongoDB _id which should be passed separately
        await updateProduct(formData._id || formData.productId, payload);
        toast.success("Cập nhật sản phẩm thành công!");
      } else {
        await createProduct(payload);
        toast.success("Thêm sản phẩm thành công!");
      }

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
    setCoverImage,
    calculateFinalPrice,
    handleGoBack,
    handleSubmit,
  };
};
