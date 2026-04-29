import React, { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { usePageTitle } from "@/contexts/PageTitleContext";
import { Search, Plus, Edit, Trash2, Copy, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
const CouponType = {
  PERCENTAGE: "percentage",
  FIXED_AMOUNT: "fixed_amount",
} as const;

type CouponType = (typeof CouponType)[keyof typeof CouponType];

// Mock data (Normally fetched from API)
const mockCoupons = [
  { _id: "1", code: "WELCOME20", type: CouponType.PERCENTAGE, value: 20, maxDiscount: 500000, usageLimit: 100, usedCount: 45, expiryDate: "2026-12-31", isActive: true },
  { _id: "2", code: "FREESHIP", type: CouponType.FIXED_AMOUNT, value: 30000, maxDiscount: 30000, usageLimit: 500, usedCount: 490, expiryDate: "2026-05-01", isActive: true },
  { _id: "3", code: "FLASH50", type: CouponType.PERCENTAGE, value: 50, maxDiscount: 1000000, usageLimit: 50, usedCount: 50, expiryDate: "2026-04-15", isActive: false },
];

const CouponList: React.FC = () => {
  usePageTitle("Quản Lý Mã Giảm Giá");

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  const filteredCoupons = mockCoupons.filter(c => c.code.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalPages = Math.ceil(filteredCoupons.length / itemsPerPage);
  const paginatedCoupons = filteredCoupons.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Đã copy mã: ${code}`);
  };

  const isExpiredOrDepleted = (coupon: any) => {
    return !coupon.isActive || coupon.usedCount >= coupon.usageLimit || new Date(coupon.expiryDate) < new Date();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
             <div className="relative flex-1 md:w-[350px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm mã giảm giá..."
                  className="pl-8 uppercase"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             <Button asChild className="md:w-auto w-full">
               <a href="/coupons/add">
                 <Plus className="mr-2 h-4 w-4" /> Tạo Mã
               </a>
             </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Mã (Code)</TableHead>
                <TableHead>Chi tiết giảm</TableHead>
                <TableHead className="text-center">Đã dùng</TableHead>
                <TableHead>Ngày hết hạn</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
               {paginatedCoupons.length > 0 ? (
                 paginatedCoupons.map((coupon) => (
                    <TableRow key={coupon._id} className={isExpiredOrDepleted(coupon) ? "bg-muted/30" : ""}>
                      <TableCell className="font-bold text-blue-600">
                        {coupon.code}
                      </TableCell>
                      <TableCell>
                         Giảm {coupon.value}{coupon.type === CouponType.PERCENTAGE ? '%' : '₫'}
                         <br />
                         <span className="text-xs text-muted-foreground">Tối đa: {coupon.maxDiscount.toLocaleString()} ₫</span>
                      </TableCell>
                      <TableCell className="text-center">
                         <Badge variant="secondary" className="font-mono">
                           {coupon.usedCount}/{coupon.usageLimit}
                         </Badge>
                      </TableCell>
                      <TableCell>{coupon.expiryDate}</TableCell>
                      <TableCell>
                         {isExpiredOrDepleted(coupon) ? (
                            <Badge variant="destructive">Hết hiệu lực</Badge>
                         ) : (
                            <Badge variant="default" className="bg-green-600 hover:bg-green-700">Đang chạy</Badge>
                         )}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="icon" onClick={() => handleCopy(coupon.code)}>
                          <Copy className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button variant="outline" size="icon">
                          <Edit className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button variant="outline" size="icon">
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                 ))
               ) : (
                 <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">Không tìm thấy mã giảm giá.</TableCell>
                 </TableRow>
               )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
             <div className="flex items-center justify-end space-x-2 mt-4">
               <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                 <ChevronLeft className="h-4 w-4" /> Prev
               </Button>
               <span className="text-sm">Page {currentPage} of {totalPages}</span>
               <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                 Next <ChevronRight className="h-4 w-4" />
               </Button>
             </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CouponList;
