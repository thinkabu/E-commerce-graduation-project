import React, { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Plus, Edit, Trash2 } from "lucide-react";
import { usePageTitle } from "@/contexts/PageTitleContext";
import { toast } from "sonner";

const CategoryList: React.FC = () => {
  usePageTitle("Quản Lý Danh Mục");

  const [searchTerm, setSearchTerm] = useState<string>("");

  const mockCategories = [
    { _id: "1", name: "Điện thoại di động", slug: "dien-thoai-di-dong", level: 0, isActive: true },
    { _id: "2", name: "iPhone", slug: "iphone", level: 1, isActive: true },
    { _id: "3", name: "Laptop", slug: "laptop", level: 0, isActive: true },
    { _id: "4", name: "Đồng hồ thông minh", slug: "smartwatch", level: 0, isActive: false },
  ];

  const filtered = mockCategories.filter(cat => cat.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleDelete = () => {
    if (window.confirm("Bạn muốn xóa danh mục này?")) {
      toast.success("Đã xóa danh mục!");
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
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length > 0 ? (
                filtered.map((cat) => (
                  <TableRow key={cat._id}>
                    <TableCell className="font-medium">
                       {/* Thụt lề hiển thị trực quan cấp bậc con */}
                       <span style={{ marginLeft: `${cat.level * 20}px` }}>
                          {cat.level > 0 && "↳ "}{cat.name}
                       </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{cat.slug}</TableCell>
                    <TableCell>Level {cat.level}</TableCell>
                    <TableCell>
                       <Badge variant={cat.isActive ? "outline" : "secondary"} className={cat.isActive ? "text-green-600 border-green-600" : ""}>
                         {cat.isActive ? "Hiển thị" : "Bị ẩn"}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 text-blue-500" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleDelete}>
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
