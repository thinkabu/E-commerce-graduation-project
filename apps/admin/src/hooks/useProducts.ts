import { useState, useEffect, useCallback } from "react";
import type { Product } from "@/types/product";
import { fetchProducts, deleteProductApi } from "@/services/productService";

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchProducts({ limit: 100 });
      setProducts(result.items || []);
    } catch (err: any) {
      console.error("Lỗi tải sản phẩm:", err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const deleteProduct = useCallback(
    async (
      id: string,
      callbacks?: { onSuccess?: () => void; onError?: (error: any) => void }
    ) => {
      try {
        await deleteProductApi(id);
        setProducts((prev) => prev.filter((p) => p._id !== id));
        callbacks?.onSuccess?.();
      } catch (err: any) {
        console.error("Lỗi xóa sản phẩm:", err);
        callbacks?.onError?.(err);
      }
    },
    []
  );

  return { products, isLoading, error, deleteProduct, refetch: loadProducts };
};
