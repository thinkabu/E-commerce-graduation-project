import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { usePageTitle } from "@/contexts/PageTitleContext";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Copy, ChevronLeft, ChevronRight, Loader2, RefreshCw } from "lucide-react";
import { fetchCoupons, deleteCoupon, type Coupon } from "@/services/couponService";

const CouponList: React.FC = () => {
  usePageTitle("Quản Lý Mã Giảm Giá");

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    setIsLoading(true);
    const data = await fetchCoupons();
    setCoupons(data);
    setIsLoading(false);
  };

  const filteredCoupons = coupons.filter(c => c.code.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalPages = Math.ceil(filteredCoupons.length / itemsPerPage);
  const paginatedCoupons = filteredCoupons.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Đã copy mã: ${code}`);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa mã giảm giá này?")) {
      const success = await deleteCoupon(id);
      if (success) {
        toast.success("Xóa mã giảm giá thành công!");
        loadCoupons();
      } else {
        toast.error("Lỗi khi xóa mã giảm giá.");
      }
    }
  };

  const isExpiredOrDepleted = (coupon: Coupon) => {
    return !coupon.isActive ||
      (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) ||
      new Date(coupon.endDate) < new Date();
  };

  const formatPrice = (value: number) => {
    return value.toLocaleString("vi-VN");
  };

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-sm">
        <CardHeader className="border-b border-zinc-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Input
                  placeholder="Tìm mã giảm giá..."
                  className="rounded-xl h-11 uppercase"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                onClick={loadCoupons}
                className="rounded-xl h-11"
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
            </div>
            <Button asChild className="rounded-xl h-11 bg-zinc-900 hover:bg-zinc-800">
              <Link to="/coupons/add">
                <Plus className="mr-2 h-4 w-4" /> Tạo Mã
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-zinc-50/50">
                <TableRow>
                  <TableHead className="py-4 font-bold text-zinc-900">Mã (Code)</TableHead>
                  <TableHead className="py-4 font-bold text-zinc-900">Chi tiết giảm</TableHead>
                  <TableHead className="py-4 font-bold text-zinc-900 text-center">Đã dùng</TableHead>
                  <TableHead className="py-4 font-bold text-zinc-900">Ngày hết hạn</TableHead>
                  <TableHead className="py-4 font-bold text-zinc-900">Trạng thái</TableHead>
                  <TableHead className="py-4 font-bold text-zinc-900 text-right pr-6">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-48 text-center">
                      <div className="flex flex-col items-center gap-2 text-zinc-400">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <p className="text-sm font-medium">Đang tải dữ liệu...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : paginatedCoupons.length > 0 ? (
                  paginatedCoupons.map((coupon) => (
                    <TableRow key={coupon._id} className={`hover:bg-zinc-50/50 transition-colors ${isExpiredOrDepleted(coupon) ? "bg-zinc-50/30" : ""}`}>
                      <TableCell className="font-bold text-blue-600 font-mono">{coupon.code}</TableCell>
                      <TableCell>
                        <span className="font-semibold">
                          Giảm {coupon.discountValue}{coupon.discountType === "PERCENTAGE" ? "%" : "₫"}
                        </span>
                        {coupon.maxDiscountAmount ? (
                          <>
                            <br />
                            <span className="text-xs text-zinc-500">Tối đa: {formatPrice(coupon.maxDiscountAmount)} ₫</span>
                          </>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="font-mono rounded-lg">
                          {coupon.usedCount}/{coupon.usageLimit || "∞"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-zinc-500">
                        {new Date(coupon.endDate).toLocaleDateString("vi-VN")}
                      </TableCell>
                      <TableCell>
                        {isExpiredOrDepleted(coupon) ? (
                          <Badge variant="destructive" className="rounded-lg px-3 py-1">Hết hiệu lực</Badge>
                        ) : (
                          <Badge variant="outline" className="rounded-lg px-3 py-1 text-green-600 border-green-200 bg-green-50">Đang chạy</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right space-x-2 pr-6">
                        <Button variant="ghost" size="icon" onClick={() => handleCopy(coupon.code)} className="h-9 w-9 rounded-lg hover:bg-green-50 text-green-600">
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button asChild variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-blue-50 text-blue-600">
                          <Link to={`/coupons/edit/${coupon._id}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(coupon._id)}
                          className="h-9 w-9 rounded-lg hover:bg-red-50 text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-48 text-center text-zinc-400">
                      Không tìm thấy mã giảm giá nào.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-100">
              <p className="text-sm text-zinc-500">
                Hiển thị trang {currentPage} trên tổng số {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="rounded-lg">
                  <ChevronLeft className="h-4 w-4 mr-1" /> Trước
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="rounded-lg">
                  Sau <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CouponList;
