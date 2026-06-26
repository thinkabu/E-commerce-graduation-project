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
import { Badge } from "@/components/ui/badge";
import { usePageTitle } from "@/contexts/PageTitleContext";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  DollarSign,
  ShoppingCart,
  Clock,
  X,
} from "lucide-react";
import {
  getAdminOrders,
  updateOrderStatus,
  getAdminOrderSummary,
} from "@/services/orderService";

// Mock enums
const OrderStatus = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  PROCESSING: "PROCESSING",
  SHIPPING: "SHIPPING",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
  RETURNED: "RETURNED",
  RETURN_REQUESTED: "RETURN_REQUESTED",
} as const;

type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

const isStatusTransitionDisabled = (currentStatus: string, targetStatus: string): boolean => {
  const levels: Record<string, number> = {
    PENDING: 1,
    CONFIRMED: 2,
    PROCESSING: 3,
    SHIPPING: 4,
    DELIVERED: 5,
  };

  if (currentStatus === targetStatus) return false;

  const currentLevel = levels[currentStatus];
  const targetLevel = levels[targetStatus];

  if (currentLevel && targetLevel) {
    return targetLevel < currentLevel;
  }

  if (targetStatus === 'CANCELLED') {
    return currentStatus === 'SHIPPING' || currentStatus === 'DELIVERED' || currentStatus === 'RETURNED' || currentStatus === 'RETURN_REQUESTED';
  }

  if (targetStatus === 'RETURNED') {
    return currentStatus !== 'DELIVERED' && currentStatus !== 'RETURN_REQUESTED';
  }

  if (targetStatus === 'RETURN_REQUESTED') {
    return currentStatus !== 'DELIVERED';
  }

  return true;
};

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
      case OrderStatus.PENDING:
        return (
          <Badge
            variant="outline"
            className="text-yellow-600 border-yellow-600"
          >
            Chờ duyệt
          </Badge>
        );
      case OrderStatus.CONFIRMED:
        return (
          <Badge variant="secondary" className="bg-purple-100 text-purple-700">
            Đã xác nhận
          </Badge>
        );
      case OrderStatus.PROCESSING:
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            Đang xử lý
          </Badge>
        );
      case OrderStatus.SHIPPING:
        return (
          <Badge variant="secondary" className="bg-orange-100 text-orange-700">
            Đang giao
          </Badge>
        );
      case OrderStatus.DELIVERED:
        return (
          <Badge variant="default" className="bg-green-600 hover:bg-green-700">
            Đã giao
          </Badge>
        );
      case OrderStatus.CANCELLED:
        return <Badge variant="destructive">Đã hủy</Badge>;
      case OrderStatus.RETURNED:
        return (
          <Badge variant="outline" className="text-red-600 border-red-600">
            Đã trả hàng
          </Badge>
        );
      case OrderStatus.RETURN_REQUESTED:
        return (
          <Badge variant="outline" className="text-orange-500 border-orange-500 bg-orange-50">
            Yêu cầu trả hàng
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getOrderItemsCount = (order: any) => {
    return (
      order.items?.reduce(
        (sum: number, item: any) => sum + (item.quantity || 0),
        0,
      ) || 0
    );
  };

  const formatOrderTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const time = d.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const date = d.toLocaleDateString("vi-VN");
    return `${time} - ${date}`;
  };

  const getPaymentMethodBadge = (method: string) => {
    switch (method) {
      case "COD":
        return (
          <Badge
            variant="outline"
            className="text-zinc-600 border-zinc-300 bg-zinc-50 font-normal"
          >
            COD (Tiền mặt)
          </Badge>
        );
      case "BANKING":
        return (
          <Badge
            variant="outline"
            className="text-blue-600 border-blue-300 bg-blue-50/50 font-normal"
          >
            Chuyển khoản
          </Badge>
        );
      case "CRYPTO":
        return (
          <Badge
            variant="outline"
            className="text-purple-600 border-purple-300 bg-purple-50/50 font-normal"
          >
            Crypto 🌐
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="font-normal">
            {method}
          </Badge>
        );
    }
  };

  const [orders, setOrders] = useState<any[]>([]);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [summary, setSummary] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

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
      const res = await getAdminOrderSummary(
        startDate || undefined,
        endDate || undefined,
      );
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

  // Modals state
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus>(OrderStatus.PENDING);
  const [cancelReason, setCancelReason] = useState("");
  const [modalLoading, setModalLoading] = useState(false);

  const [viewingOrder, setViewingOrder] = useState<any | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const handleOpenDetailModal = (order: any) => {
    setViewingOrder(order);
    setIsDetailModalOpen(true);
  };

  const handleOpenEditModal = (order: any) => {
    setSelectedOrder(order);
    setNewStatus(order.orderStatus);
    setIsEditModalOpen(true);
  };

  const handleOpenCancelModal = (order: any) => {
    setSelectedOrder(order);
    setCancelReason("");
    setIsCancelModalOpen(true);
  };

  const handleSaveStatus = async () => {
    if (!selectedOrder) return;
    setModalLoading(true);
    try {
      await updateOrderStatus(selectedOrder._id, newStatus);
      setOrders((prevOrders) =>
        prevOrders.map((o) =>
          o._id === selectedOrder._id ? { ...o, orderStatus: newStatus } : o,
        ),
      );
      setIsEditModalOpen(false);
      setSelectedOrder(null);
    } catch (error) {
      console.error("Failed to update status", error);
      alert("Cập nhật trạng thái thất bại");
    } finally {
      setModalLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder) return;
    if (!cancelReason.trim()) {
      alert("Vui lòng nhập lý do hủy đơn hàng");
      return;
    }
    setModalLoading(true);
    try {
      await updateOrderStatus(
        selectedOrder._id,
        OrderStatus.CANCELLED,
        cancelReason.trim(),
      );
      setOrders((prevOrders) =>
        prevOrders.map((o) =>
          o._id === selectedOrder._id
            ? { ...o, orderStatus: OrderStatus.CANCELLED }
            : o,
        ),
      );
      setIsCancelModalOpen(false);
      setSelectedOrder(null);
    } catch (error) {
      console.error("Failed to cancel order", error);
      alert("Hủy đơn hàng thất bại");
    } finally {
      setModalLoading(false);
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
              <p className="text-sm font-medium text-muted-foreground">
                Doanh thu
              </p>
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
              <p className="text-sm font-medium text-muted-foreground">
                Tổng đơn hàng
              </p>
              <h3 className="text-2xl font-bold mt-2">
                {summary?.totalOrders || 0}
              </h3>
            </div>
            <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
              <ShoppingCart className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Đơn chờ duyệt
              </p>
              <h3 className="text-2xl font-bold mt-2">
                {summary?.pendingOrders || 0}
              </h3>
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
              <span className="text-xs text-muted-foreground mb-1 block">
                Tìm kiếm
              </span>
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
              <span className="text-xs text-muted-foreground mb-1 block">
                Từ ngày
              </span>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="w-full md:w-[150px]">
              <span className="text-xs text-muted-foreground mb-1 block">
                Đến ngày
              </span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="w-full md:w-[160px]">
              <span className="text-xs text-muted-foreground mb-1 block">
                Trạng thái
              </span>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Lọc theo trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value={OrderStatus.PENDING}>Chờ duyệt</SelectItem>
                  <SelectItem value={OrderStatus.CONFIRMED}>
                    Đã xác nhận
                  </SelectItem>
                  <SelectItem value={OrderStatus.PROCESSING}>
                    Đang xử lý
                  </SelectItem>
                  <SelectItem value={OrderStatus.SHIPPING}>
                    Đang giao
                  </SelectItem>
                  <SelectItem value={OrderStatus.DELIVERED}>Đã giao</SelectItem>
                  <SelectItem value={OrderStatus.CANCELLED}>Đã hủy</SelectItem>
                  <SelectItem value={OrderStatus.RETURNED}>
                    Đã trả hàng
                  </SelectItem>
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
                <TableHead className="text-center">Số lượng</TableHead>
                <TableHead>Giờ đặt</TableHead>
                <TableHead>Thanh toán</TableHead>
                <TableHead className="text-right">Tổng tiền</TableHead>
                <TableHead className="text-center">Trạng thái</TableHead>
                <TableHead className="text-center">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-zinc-400" />
                  </TableCell>
                </TableRow>
              ) : orders.length > 0 ? (
                orders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell 
                      className="font-semibold text-xs text-blue-600 hover:underline cursor-pointer"
                      onClick={() => handleOpenDetailModal(order)}
                    >
                      {order.orderId}
                    </TableCell>
                    <TableCell>
                      {order.shippingAddressSnapshot?.fullName || "N/A"}
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {getOrderItemsCount(order)} món
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatOrderTime(order.createdAt)}
                    </TableCell>
                    <TableCell>
                      {getPaymentMethodBadge(order.paymentMethod)}
                    </TableCell>
                    <TableCell className="text-right font-medium text-blue-600">
                      {order.totalAmount?.toLocaleString()} ₫
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        {getStatusBadge(order.orderStatus)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 justify-center">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-zinc-700 border-zinc-200 hover:bg-zinc-50 hover:text-zinc-950 h-8 px-3"
                          onClick={() => handleOpenDetailModal(order)}
                        >
                          Xem
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 h-8 px-3"
                          onClick={() => handleOpenEditModal(order)}
                          disabled={
                            order.orderStatus === OrderStatus.DELIVERED ||
                            order.orderStatus === OrderStatus.CANCELLED ||
                            order.orderStatus === OrderStatus.RETURNED ||
                            order.orderStatus === OrderStatus.RETURN_REQUESTED
                          }
                        >
                          Sửa
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 h-8 px-3"
                          onClick={() => handleOpenCancelModal(order)}
                          disabled={
                            order.orderStatus === OrderStatus.DELIVERED ||
                            order.orderStatus === OrderStatus.CANCELLED ||
                            order.orderStatus === OrderStatus.RETURNED ||
                            order.orderStatus === OrderStatus.RETURN_REQUESTED
                          }
                        >
                          Hủy
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    Không tìm thấy đơn hàng.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex items-center justify-end space-x-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" /> Prev
              </Button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Cập Nhật Trạng Thái */}
      {isEditModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-background border rounded-2xl shadow-xl max-w-md w-full overflow-hidden animate-in fade-in-50 zoom-in-95 duration-200">
            <div className="p-6">
              <h3 className="text-lg font-bold text-foreground">
                Cập nhật trạng thái đơn hàng
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Đơn hàng:{" "}
                <span className="font-semibold text-primary">
                  {selectedOrder.orderId}
                </span>
              </p>

              <div className="mt-4 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Trạng thái mới
                  </label>
                  <Select
                    value={newStatus}
                    onValueChange={(val) => setNewStatus(val as OrderStatus)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        value={OrderStatus.PENDING}
                        disabled={isStatusTransitionDisabled(selectedOrder.orderStatus, OrderStatus.PENDING)}
                      >
                        Chờ duyệt
                      </SelectItem>
                      <SelectItem
                        value={OrderStatus.CONFIRMED}
                        disabled={isStatusTransitionDisabled(selectedOrder.orderStatus, OrderStatus.CONFIRMED)}
                      >
                        Đã xác nhận
                      </SelectItem>
                      <SelectItem
                        value={OrderStatus.PROCESSING}
                        disabled={isStatusTransitionDisabled(selectedOrder.orderStatus, OrderStatus.PROCESSING)}
                      >
                        Đang xử lý
                      </SelectItem>
                      <SelectItem
                        value={OrderStatus.SHIPPING}
                        disabled={isStatusTransitionDisabled(selectedOrder.orderStatus, OrderStatus.SHIPPING)}
                      >
                        Đang giao
                      </SelectItem>
                      <SelectItem
                        value={OrderStatus.DELIVERED}
                        disabled={isStatusTransitionDisabled(selectedOrder.orderStatus, OrderStatus.DELIVERED)}
                      >
                        Đã giao
                      </SelectItem>
                      <SelectItem
                        value={OrderStatus.CANCELLED}
                        disabled={isStatusTransitionDisabled(selectedOrder.orderStatus, OrderStatus.CANCELLED)}
                      >
                        Đã hủy
                      </SelectItem>
                      <SelectItem
                        value={OrderStatus.RETURNED}
                        disabled={isStatusTransitionDisabled(selectedOrder.orderStatus, OrderStatus.RETURNED)}
                      >
                        Đã trả hàng
                      </SelectItem>
                      <SelectItem
                        value={OrderStatus.RETURN_REQUESTED}
                        disabled={isStatusTransitionDisabled(selectedOrder.orderStatus, OrderStatus.RETURN_REQUESTED)}
                      >
                        Yêu cầu trả hàng
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 bg-muted/40 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedOrder(null);
                }}
                disabled={modalLoading}
              >
                Hủy bỏ
              </Button>
              <Button onClick={handleSaveStatus} disabled={modalLoading}>
                {modalLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Lưu thay đổi
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Chi Tiết Đơn Hàng */}
      {isDetailModalOpen && viewingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-background border rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden animate-in fade-in-50 zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  Chi tiết đơn hàng
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  ID: <span className="font-semibold text-primary uppercase">{viewingOrder.orderId}</span>
                </p>
              </div>
              <button
                onClick={() => {
                  setIsDetailModalOpen(false);
                  setViewingOrder(null);
                }}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Order Status & Payment summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/40 p-4 rounded-xl border">
                <div>
                  <span className="text-xs text-muted-foreground block mb-1">Trạng thái đơn hàng</span>
                  {getStatusBadge(viewingOrder.orderStatus)}
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block mb-1">Thanh toán</span>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      {getPaymentMethodBadge(viewingOrder.paymentMethod)}
                      <Badge variant="outline" className={viewingOrder.paymentStatus === 'COMPLETED' ? "text-green-600 border-green-600 bg-green-50" : "text-yellow-600 border-yellow-600 bg-yellow-50"}>
                        {viewingOrder.paymentStatus}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">Thông tin nhận hàng</h4>
                <div className="bg-muted/20 p-4 rounded-xl border text-sm space-y-1.5">
                  <p><strong>Người nhận:</strong> {viewingOrder.shippingAddressSnapshot?.fullName || "N/A"}</p>
                  <p><strong>Số điện thoại:</strong> {viewingOrder.shippingAddressSnapshot?.phone || "N/A"}</p>
                  <p>
                    <strong>Địa chỉ:</strong> {viewingOrder.shippingAddressSnapshot?.street},{" "}
                    {viewingOrder.shippingAddressSnapshot?.ward},{" "}
                    {viewingOrder.shippingAddressSnapshot?.district},{" "}
                    {viewingOrder.shippingAddressSnapshot?.province}
                  </p>
                  {viewingOrder.shippingAddressSnapshot?.note && (
                    <p className="text-xs text-muted-foreground italic mt-1">
                      * Ghi chú: {viewingOrder.shippingAddressSnapshot.note}
                    </p>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">Danh sách sản phẩm</h4>
                <div className="border rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b">
                      <tr>
                        <th className="py-2 px-3 text-left">Sản phẩm</th>
                        <th className="py-2 px-3 text-center">SL</th>
                        <th className="py-2 px-3 text-right">Đơn giá</th>
                        <th className="py-2 px-3 text-right">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {viewingOrder.items?.map((item: any, idx: number) => (
                        <tr key={idx}>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-3">
                              {item.productSnapshot?.image && (
                                <img
                                  src={item.productSnapshot.image}
                                  alt={item.productSnapshot.name}
                                  className="w-10 h-10 object-cover rounded-lg bg-zinc-100"
                                />
                              )}
                              <div>
                                <p className="font-medium line-clamp-1">{item.productSnapshot?.name}</p>
                                {item.productSnapshot?.variantName && (
                                  <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-muted-foreground px-1.5 py-0.5 rounded font-medium">
                                    Phân loại: {item.productSnapshot.variantName}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-center font-medium">{item.quantity}</td>
                          <td className="py-3 px-3 text-right text-muted-foreground">{item.unitPrice?.toLocaleString()} ₫</td>
                          <td className="py-3 px-3 text-right font-medium">{item.totalPrice?.toLocaleString()} ₫</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payment Details info (VNPay or Blockchain if exists) */}
              {viewingOrder.paymentMethod === "VNPAY" && viewingOrder.vnpayPayment && (
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">Chi tiết thanh toán VNPay</h4>
                  <div className="bg-muted/20 p-4 rounded-xl border text-sm space-y-1.5">
                    <p><strong>Mã giao dịch VNPay:</strong> {viewingOrder.vnpayPayment.vnpayTxNo || "N/A"}</p>
                    <p><strong>Mã ngân hàng:</strong> {viewingOrder.vnpayPayment.bankCode || "N/A"}</p>
                    <p><strong>Loại thẻ:</strong> {viewingOrder.vnpayPayment.cardType || "N/A"}</p>
                    {viewingOrder.vnpayPayment.payDate && (
                      <p><strong>Thời gian thanh toán:</strong> {new Date(viewingOrder.vnpayPayment.payDate).toLocaleString("vi-VN")}</p>
                    )}
                  </div>
                </div>
              )}

              {viewingOrder.paymentMethod === "CRYPTO" && viewingOrder.blockchainPayment && (
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">Chi tiết thanh toán Blockchain</h4>
                  <div className="bg-muted/20 p-4 rounded-xl border text-sm space-y-1.5 font-mono break-all text-xs">
                    <p><strong className="font-sans text-sm text-foreground">Tx Hash:</strong> {viewingOrder.blockchainPayment.transactionHash}</p>
                    <p><strong className="font-sans text-sm text-foreground">Ví thanh toán:</strong> {viewingOrder.blockchainPayment.walletAddress}</p>
                    <p><strong className="font-sans text-sm text-foreground">Số lượng:</strong> {viewingOrder.blockchainPayment.cryptoAmount} {viewingOrder.blockchainPayment.cryptoSymbol || "ETH"}</p>
                    <p><strong className="font-sans text-sm text-foreground">Mạng lưới:</strong> {viewingOrder.blockchainPayment.network}</p>
                    <p><strong className="font-sans text-sm text-foreground">Tỷ giá:</strong> {viewingOrder.blockchainPayment.exchangeRate?.toLocaleString()} ₫/ETH</p>
                  </div>
                </div>
              )}

              {/* Financial Calculation Summary */}
              <div className="flex flex-col items-end space-y-1.5 text-sm pt-4 border-t">
                <div className="flex justify-between w-64">
                  <span className="text-muted-foreground">Tạm tính:</span>
                  <span className="font-medium">{(viewingOrder.subtotal || 0).toLocaleString()} ₫</span>
                </div>
                <div className="flex justify-between w-64">
                  <span className="text-muted-foreground">Phí vận chuyển:</span>
                  <span className="font-medium">{(viewingOrder.shippingFee || 0).toLocaleString()} ₫</span>
                </div>
                {viewingOrder.discount > 0 && (
                  <div className="flex justify-between w-64 text-green-600">
                    <span>Mã giảm giá:</span>
                    <span>-{viewingOrder.discount.toLocaleString()} ₫</span>
                  </div>
                )}
                <div className="flex justify-between w-64 font-bold text-lg text-blue-600 pt-1.5 border-t">
                  <span>Tổng thanh toán:</span>
                  <span>{(viewingOrder.totalAmount || 0).toLocaleString()} ₫</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end px-6 py-4 bg-muted/40 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDetailModalOpen(false);
                  setViewingOrder(null);
                }}
              >
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Modal Hủy Đơn Hàng (Xóa) */}
      {isCancelModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-background border border-destructive/20 rounded-2xl shadow-xl max-w-md w-full overflow-hidden animate-in fade-in-50 zoom-in-95 duration-200">
            <div className="p-6">
              <h3 className="text-lg font-bold text-destructive flex items-center gap-2">
                ⚠️ Hủy đơn hàng
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Bạn đang thực hiện hủy đơn hàng{" "}
                <span className="font-semibold text-foreground">
                  {selectedOrder.orderId}
                </span>
                .
              </p>

              <div className="mt-4 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Lý do hủy đơn hàng <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className="w-full min-h-[100px] p-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-destructive/50 resize-none"
                    placeholder="Nhập lý do chi tiết hủy đơn..."
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                  />
                  <p className="text-[11px] text-muted-foreground italic">
                    * Lý do này sẽ được hiển thị cho khách hàng xem trong phần
                    chi tiết đơn hàng của họ.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 bg-muted/40 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCancelModalOpen(false);
                  setSelectedOrder(null);
                }}
                disabled={modalLoading}
              >
                Hủy bỏ
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancelOrder}
                disabled={modalLoading}
              >
                {modalLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Xác nhận hủy
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default OrderList;
