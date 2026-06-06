import React, { useState, useEffect } from "react";
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
import { Eye, Search, ChevronLeft, ChevronRight, Loader2, DollarSign, ShoppingCart, Clock } from "lucide-react";
import { getAdminOrders, updateOrderStatus, getAdminOrderSummary } from "@/services/orderService";

// Mock enums
const OrderStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PROCESSING: 'PROCESSING',
  SHIPPING: 'SHIPPING',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  RETURNED: 'RETURNED',
} as const;

type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

const OrderList: React.FC = () => {
  usePageTitle("Quản Lý Đơn Hàng");

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Date range filters (empty by default to load all historical orders)
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING: return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Chờ duyệt</Badge>;
      case OrderStatus.CONFIRMED: return <Badge variant="secondary" className="bg-purple-100 text-purple-700">Đã xác nhận</Badge>;
      case OrderStatus.PROCESSING: return <Badge variant="secondary" className="bg-blue-100 text-blue-700">Đang xử lý</Badge>;
      case OrderStatus.SHIPPING: return <Badge variant="secondary" className="bg-orange-100 text-orange-700">Đang giao</Badge>;
      case OrderStatus.DELIVERED: return <Badge variant="default" className="bg-green-600 hover:bg-green-700">Đã giao</Badge>;
      case OrderStatus.CANCELLED: return <Badge variant="destructive">Đã hủy</Badge>;
      case OrderStatus.RETURNED: return <Badge variant="outline" className="text-red-600 border-red-600">Đã trả hàng</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const [orders, setOrders] = useState<any[]>([]);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [summary, setSummary] = useState({ totalOrders: 0, totalRevenue: 0, pendingOrders: 0 });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await getAdminOrders({
        page: currentPage,
        limit: itemsPerPage,
        status: statusFilter,
        search: searchTerm,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      if (response && response.data) {
        setOrders(response.data);
        setTotalOrders(response.total);
      } else {
        setOrders([]);
        setTotalOrders(0);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await getAdminOrderSummary(startDate || undefined, endDate || undefined);
      if (res) setSummary(res);
    } catch (error) {
      console.error("Error fetching summary", error);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchOrders();
      fetchSummary();
    }, 500); // debounce search

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, statusFilter, currentPage, startDate, endDate]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setIsUpdating(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders(prevOrders => 
        prevOrders.map(o => o._id === orderId ? { ...o, orderStatus: newStatus } : o)
      );
    } catch (error) {
      console.error("Failed to update status", error);
      alert("Cập nhật trạng thái thất bại");
    } finally {
      setIsUpdating(null);
    }
  };

  const totalPages = Math.ceil(totalOrders / itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Doanh thu</p>
              <h3 className="text-2xl font-bold mt-2">
                {(summary?.totalRevenue || 0).toLocaleString()} ₫
              </h3>
            </div>
            <div className="h-12 w-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
              <DollarSign className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tổng đơn hàng</p>
              <h3 className="text-2xl font-bold mt-2">{summary?.totalOrders || 0}</h3>
            </div>
            <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
              <ShoppingCart className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Đơn chờ duyệt</p>
              <h3 className="text-2xl font-bold mt-2">{summary?.pendingOrders || 0}</h3>
            </div>
            <div className="h-12 w-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center">
              <Clock className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="relative flex-1">
              <span className="text-xs text-muted-foreground mb-1 block">Tìm kiếm</span>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Mã đơn hàng, khách hàng..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="w-full md:w-[150px]">
              <span className="text-xs text-muted-foreground mb-1 block">Từ ngày</span>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="w-full md:w-[150px]">
              <span className="text-xs text-muted-foreground mb-1 block">Đến ngày</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="w-full md:w-[160px]">
              <span className="text-xs text-muted-foreground mb-1 block">Trạng thái</span>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Lọc theo trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value={OrderStatus.PENDING}>Chờ duyệt</SelectItem>
                  <SelectItem value={OrderStatus.CONFIRMED}>Đã xác nhận</SelectItem>
                  <SelectItem value={OrderStatus.PROCESSING}>Đang xử lý</SelectItem>
                  <SelectItem value={OrderStatus.SHIPPING}>Đang giao</SelectItem>
                  <SelectItem value={OrderStatus.DELIVERED}>Đã giao</SelectItem>
                  <SelectItem value={OrderStatus.CANCELLED}>Đã hủy</SelectItem>
                  <SelectItem value={OrderStatus.RETURNED}>Đã trả hàng</SelectItem>
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
               {isLoading ? (
                 <TableRow>
                   <TableCell colSpan={6} className="h-24 text-center">
                     <Loader2 className="h-6 w-6 animate-spin mx-auto text-zinc-400" />
                   </TableCell>
                 </TableRow>
               ) : orders.length > 0 ? (
                 orders.map((order) => (
                    <TableRow key={order._id}>
                      <TableCell className="font-semibold text-xs">{order.orderId}</TableCell>
                      <TableCell>{order.shippingAddressSnapshot?.fullName || 'N/A'}</TableCell>
                      <TableCell>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                      <TableCell className="text-right font-medium text-blue-600">
                         {order.totalAmount?.toLocaleString()} ₫
                      </TableCell>
                      <TableCell>
                         <Select 
                           value={order.orderStatus} 
                           onValueChange={(val) => handleStatusChange(order._id, val as OrderStatus)}
                           disabled={isUpdating === order._id}
                         >
                           <SelectTrigger className="h-8 border-none bg-transparent shadow-none focus:ring-0 p-0 w-auto">
                              {isUpdating === order._id ? (
                                <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
                              ) : (
                                getStatusBadge(order.orderStatus)
                              )}
                           </SelectTrigger>
                           <SelectContent>
                             <SelectItem value={OrderStatus.PENDING}>Chờ duyệt</SelectItem>
                             <SelectItem value={OrderStatus.CONFIRMED}>Đã xác nhận</SelectItem>
                             <SelectItem value={OrderStatus.PROCESSING}>Đang xử lý</SelectItem>
                             <SelectItem value={OrderStatus.SHIPPING}>Đang giao</SelectItem>
                             <SelectItem value={OrderStatus.DELIVERED}>Đã giao</SelectItem>
                             <SelectItem value={OrderStatus.CANCELLED}>Đã hủy</SelectItem>
                             <SelectItem value={OrderStatus.RETURNED}>Đã trả hàng</SelectItem>
                           </SelectContent>
                         </Select>
                      </TableCell>
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
