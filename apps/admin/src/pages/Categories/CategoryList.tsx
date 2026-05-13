import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Plus, Edit, Trash2 } from "lucide-react";
import { usePageTitle } from "@/contexts/PageTitleContext";
import { toast } from "sonner";
import { fetchCategoryTree, deleteCategory } from "@/services/categoryService";
import type { Category } from "@/services/categoryService";

const CategoryList: React.FC = () => {
  usePageTitle("Quản Lý Danh Mục");

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await fetchCategoryTree();
      
      // Flatten tree for table view if backend returns nested structure
      const flattenCategories = (cats: Category[], level = 0): Category[] => {
        let result: Category[] = [];
        for (const cat of cats) {
          result.push({ ...cat, level });
          if (cat.children && cat.children.length > 0) {
            result = result.concat(flattenCategories(cat.children, level + 1));
          }
        }
        return result;
      };

      // Check if data is already flattened or needs flattening
      const isNested = data.some(cat => cat.children !== undefined);
      if (isNested) {
        setCategories(flattenCategories(data));
      } else {
        setCategories(data);
      }
    } catch (error) {
      toast.error("Lỗi khi tải danh sách danh mục");
    } finally {
      setLoading(false);
    }
  };

  const filtered = categories.filter(cat => cat.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleDelete = async (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
      try {
        await deleteCategory(id);
        toast.success("Đã xóa danh mục!");
        loadCategories(); // Reload the list
      } catch (error: any) {
        toast.error(error.message || "Không thể xóa danh mục");
      }
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div className="flex-1 md:w-[300px]">
                <Input
                  placeholder="Tìm kiếm danh mục..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             <Button asChild>
                <Link to="/category/create">
                  <Plus className="mr-2 h-4 w-4" /> Add Category
                </Link>
             </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Tên danh mục</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Cấp độ (Level)</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">Đang tải...</TableCell>
                </TableRow>
              ) : filtered.length > 0 ? (
                filtered.map((cat) => (
                  <TableRow key={cat._id}>
                    <TableCell className="font-medium">
                       <span style={{ marginLeft: `${(cat.level || 0) * 20}px` }}>
                          {(cat.level || 0) > 0 && "↳ "}{cat.name}
                       </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{cat.slug}</TableCell>
                    <TableCell>Level {cat.level || 0}</TableCell>
                    <TableCell>
                       <Badge variant={cat.isActive ? "outline" : "secondary"} className={cat.isActive ? "text-green-600 border-green-600" : ""}>
                         {cat.isActive ? "Hiển thị" : "Bị ẩn"}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/category/edit/${cat._id}`}>
                          <Edit className="h-4 w-4 text-blue-500" />
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(cat._id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">Không tìm thấy danh mục.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoryList;
