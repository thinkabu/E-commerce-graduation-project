import React, { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { usePageTitle } from "@/contexts/PageTitleContext";
import { Eye, Search, ChevronLeft, ChevronRight } from "lucide-react";

// Mock enums
const OrderStatus = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

const OrderList: React.FC = () => {
  usePageTitle("Quản Lý Đơn Hàng");

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING: return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Chờ duyệt</Badge>;
      case OrderStatus.PROCESSING: return <Badge variant="secondary" className="bg-blue-100 text-blue-700">Đang xử lý</Badge>;
      case OrderStatus.SHIPPED: return <Badge variant="secondary" className="bg-orange-100 text-orange-700">Đang giao</Badge>;
      case OrderStatus.DELIVERED: return <Badge variant="default" className="bg-green-600 hover:bg-green-700">Đã giao</Badge>;
      case OrderStatus.CANCELLED: return <Badge variant="destructive">Đã hủy</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const mockOrders = [
    { _id: "ORD-001", customer: "Nguyễn Văn A", total: 15000000, items: 2, status: OrderStatus.PENDING, date: "2026-04-20" },
    { _id: "ORD-002", customer: "Trần Thị B", total: 32000000, items: 1, status: OrderStatus.SHIPPED, date: "2026-04-21" },
    { _id: "ORD-003", customer: "Lê Văn C", total: 4500000, items: 3, status: OrderStatus.DELIVERED, date: "2026-04-22" },
    { _id: "ORD-004", customer: "Tạ Thị D", total: 800000, items: 1, status: OrderStatus.CANCELLED, date: "2026-04-23" },
  ];

  const filteredOrders = mockOrders
    .filter(o => o._id.includes(searchTerm) || o.customer.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(o => statusFilter === "all" || o.status === statusFilter);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 md:w-[350px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm mã đơn hàng hoặc tên khách..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-[200px]">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Lọc theo trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value={OrderStatus.PENDING}>Chờ duyệt</SelectItem>
                  <SelectItem value={OrderStatus.PROCESSING}>Đang xử lý</SelectItem>
                  <SelectItem value={OrderStatus.SHIPPED}>Đang giao hảng</SelectItem>
                  <SelectItem value={OrderStatus.DELIVERED}>Đã giao hàng</SelectItem>
                  <SelectItem value={OrderStatus.CANCELLED}>Đã hủy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Mã ĐH</TableHead>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Ngày đặt</TableHead>
                <TableHead className="text-right">Tổng thanh toán</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Chi tiết</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
               {paginatedOrders.length > 0 ? (
                 paginatedOrders.map((order) => (
                    <TableRow key={order._id}>
                      <TableCell className="font-semibold">{order._id}</TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell>{order.date}</TableCell>
                      <TableCell className="text-right font-medium text-blue-600">
                         {order.total.toLocaleString()} ₫
                      </TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="text-right">
                         <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                           <Eye className="h-4 w-4" />
                         </Button>
                      </TableCell>
                    </TableRow>
                 ))
               ) : (
                 <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">Không tìm thấy đơn hàng.</TableCell>
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
export default OrderList;
