import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "react-router-dom";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Loader2,
} from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { usePageTitle } from "@/contexts/PageTitleContext";
import { toast } from "sonner";

import { fetchCategories, type Category } from "@/services/categoryService";

const AllProducts: React.FC = () => {
  const { products, isLoading, error, deleteProduct } = useProducts();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortOption, setSortOption] = useState<string>("none");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const itemsPerPage = 11;

  usePageTitle(`Danh Sách Sản Phẩm (${products.length})`);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (err: unknown) {
        console.error("Lỗi fetch categories:", err);
      }
    };
    loadCategories();
  }, []);

  const getCategoryName = (
    categoryId: string | { _id: string; name: string; slug: string } | undefined
  ): string => {
    if (!categoryId) return "N/A";
    if (typeof categoryId === "object" && categoryId.name) return categoryId.name;
    // Lookup from categories list
    const found = categories.find((c) => c._id === categoryId);
    return found ? found.name : String(categoryId);
  };

  let filteredProducts = products
    .filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(
      (product) =>
        categoryFilter === "all" ||
        getCategoryName(product.categoryId) === categoryFilter
    );

  if (sortOption !== "none") {
    filteredProducts = [...filteredProducts].sort((a, b) => {
      const [field, order] = sortOption.split("-");
      const aVal = field === "name" ? a.name.toLowerCase() : a.basePrice;
      const bVal = field === "name" ? b.name.toLowerCase() : b.basePrice;
      if (aVal < bVal) return order === "asc" ? -1 : 1;
      if (aVal > bVal) return order === "asc" ? 1 : -1;
      return 0;
    });
  }

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      deleteProduct(id, {
        onSuccess: () => {
          toast.success("Xóa sản phẩm thành công");
        },
        onError: (error: any) => {
          toast.error(error.message || "Lỗi khi xóa sản phẩm");
        },
      });
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    return (
      <div className="flex items-center justify-center space-x-2 mt-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
          Trước
        </Button>
        {Array.from(
          { length: endPage - startPage + 1 },
          (_, i) => startPage + i
        ).map((page) => (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            size="sm"
            onClick={() => handlePageChange(page)}
          >
            {page}
          </Button>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Sau
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-destructive">
          {error instanceof Error ? error.message : "Lỗi khi tải dữ liệu"}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-end md:space-x-4 md:space-y-0 space-y-4">
            <div className="flex-1 md:w-64">
              <Input
                placeholder="Tìm kiếm theo tên sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả danh mục" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {categories
                    .filter((cat) => cat.isActive)
                    .map((cat) => (
                      <SelectItem key={cat._id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <Select value={sortOption} onValueChange={setSortOption}>
                <SelectTrigger>
                  <SelectValue placeholder="Sắp xếp theo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Không sắp xếp</SelectItem>
                  <SelectItem value="name-asc">Tên A-Z</SelectItem>
                  <SelectItem value="name-desc">Tên Z-A</SelectItem>
                  <SelectItem value="price-asc">Giá thấp đến cao</SelectItem>
                  <SelectItem value="price-desc">Giá cao đến thấp</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button asChild className="md:w-auto w-full">
              <Link to="/products/add">
                <Plus className="mr-2 h-4 w-4" /> Thêm Sản Phẩm
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table className="table-fixed">
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead className="w-28">Mã SP</TableHead>
                <TableHead>Tên sản phẩm</TableHead>
                <TableHead className="w-32">Danh mục</TableHead>
                <TableHead className="w-28 text-right">Giá</TableHead>
                <TableHead className="w-24 text-right">Giảm (%)</TableHead>
                <TableHead className="w-28">Nhà SX</TableHead>
                <TableHead className="w-40 sticky right-0 z-10 bg-background text-center">
                  Thao tác
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedProducts.length > 0 ? (
                paginatedProducts.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell className="w-28 font-mono text-xs truncate">
                      {product.productId || product._id.slice(-6)}
                    </TableCell>
                    <TableCell
                      className="font-medium max-w-xs truncate"
                      title={product.name}
                    >
                      {product.name}
                    </TableCell>
                    <TableCell className="w-32 truncate">
                      {getCategoryName(product.categoryId)}
                    </TableCell>
                    <TableCell className="w-28 text-right font-medium">
                      {product.currency === "USD" ? "$" : "₫"}
                      {(product.basePrice || 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="w-24 text-right">
                      {product.discountPercentage || 0}%
                    </TableCell>
                    <TableCell className="w-28 truncate" title={product.manufacturer}>
                      {product.manufacturer || "N/A"}
                    </TableCell>
                    <TableCell className="w-40 sticky right-0 z-10 bg-background">
                      <div className="flex space-x-2 justify-center">
                        <Button asChild variant="outline" size="sm">
                          <Link to={`/products/edit/${product._id}`}>
                            <Edit className="h-4 w-4 mr-1" />
                            Sửa
                          </Link>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(product._id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Xóa
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    Không có sản phẩm nào phù hợp.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {renderPagination()}
        </CardContent>
      </Card>
    </div>
  );
};
export default AllProducts;
