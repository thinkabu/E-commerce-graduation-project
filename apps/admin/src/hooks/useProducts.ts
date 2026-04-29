import { useState, useEffect } from "react";
import type { Product } from "@/types/product";

// Mock data — thay bằng API call sau
const mockProducts: Product[] = [];

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: fetch từ API
    setTimeout(() => {
      setProducts(mockProducts);
      setLoading(false);
    }, 500);
  }, []);

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p._id !== id));
  };

  return { products, loading, deleteProduct };
};
