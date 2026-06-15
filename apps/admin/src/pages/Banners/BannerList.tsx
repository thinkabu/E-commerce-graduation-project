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
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { usePageTitle } from "@/contexts/PageTitleContext";
import { toast } from "sonner";
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  RefreshCw,
  ImageIcon,
} from "lucide-react";
import {
  fetchBanners,
  deleteBanner,
  type Banner,
} from "@/services/bannerService";

const BannerList: React.FC = () => {
  usePageTitle("Quản Lý Banner");

  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    setIsLoading(true);
    const data = await fetchBanners();
    setBanners(data);
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa banner này?")) {
      const success = await deleteBanner(id);
      if (success) {
        toast.success("Xóa banner thành công!");
        loadBanners();
      } else {
        toast.error("Lỗi khi xóa banner.");
      }
    }
  };

  const filteredBanners = banners.filter((b) =>
    b.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("vi-VN");
  };

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-sm">
        <CardHeader className="border-b border-zinc-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Input
                  placeholder="Tìm banner theo tiêu đề..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="rounded-xl h-11"
                />
              </div>
              <Button
                variant="outline"
                onClick={loadBanners}
                className="rounded-xl h-11"
                disabled={isLoading}
              >
                <RefreshCw
                  className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
            <Button
              asChild
              className="rounded-xl h-11 bg-zinc-900 hover:bg-zinc-800"
            >
              <Link to="/banners/add">
                <Plus className="mr-2 h-4 w-4" /> Thêm Banner
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-zinc-50/50">
                <TableRow>
                  <TableHead className="py-4 font-bold text-zinc-900 w-16">
                    Ảnh
                  </TableHead>
                  <TableHead className="py-4 font-bold text-zinc-900">
                    Tiêu đề
                  </TableHead>
                  <TableHead className="py-4 font-bold text-zinc-900">
                    Phụ đề
                  </TableHead>
                  <TableHead className="py-4 font-bold text-zinc-900 text-center">
                    Vị trí
                  </TableHead>
                  <TableHead className="py-4 font-bold text-zinc-900">
                    Hiệu lực
                  </TableHead>
                  <TableHead className="py-4 font-bold text-zinc-900">
                    Trạng thái
                  </TableHead>
                  <TableHead className="py-4 font-bold text-zinc-900 text-right pr-6">
                    Hành động
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-48 text-center">
                      <div className="flex flex-col items-center gap-2 text-zinc-400">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <p className="text-sm font-medium">
                          Đang tải dữ liệu...
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredBanners.length > 0 ? (
                  filteredBanners.map((banner) => (
                    <TableRow
                      key={banner._id}
                      className="hover:bg-zinc-50/50 transition-colors"
                    >
                      <TableCell>
                        {banner.image ? (
                          <img
                            src={banner.image}
                            alt={banner.title}
                            className="w-16 h-10 object-cover rounded-lg border border-zinc-200"
                          />
                        ) : (
                          <div className="w-16 h-10 bg-zinc-100 rounded-lg flex items-center justify-center">
                            <ImageIcon className="h-4 w-4 text-zinc-400" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-semibold text-zinc-900">
                        {banner.title}
                      </TableCell>
                      <TableCell className="text-zinc-500 text-sm">
                        {banner.subtitle || "—"}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="secondary"
                          className="font-mono rounded-lg"
                        >
                          {banner.position}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-zinc-500">
                        {formatDate(banner.startDate)} -{" "}
                        {formatDate(banner.endDate)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={banner.isActive ? "outline" : "destructive"}
                          className={`rounded-lg px-3 py-1 ${banner.isActive ? "text-green-600 border-green-200 bg-green-50" : ""}`}
                        >
                          {banner.isActive ? "Hiển thị" : "Ẩn"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2 pr-6">
                        <Button
                          asChild
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-lg hover:bg-blue-50 text-blue-600"
                        >
                          <Link to={`/banners/edit/${banner._id}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(banner._id)}
                          className="h-9 w-9 rounded-lg hover:bg-red-50 text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="h-48 text-center text-zinc-400"
                    >
                      Chưa có banner nào.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BannerList;
