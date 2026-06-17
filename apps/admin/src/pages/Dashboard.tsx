import React, { useState, useEffect } from "react";
import { getAdminDashboardStats } from "@/services/orderService";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, Package, Users, ShoppingCart, DollarSign, ArrowRight } from "lucide-react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { usePageTitle } from "@/contexts/PageTitleContext";

const Dashboard: React.FC = () => {
  usePageTitle("Dashboard");
  const navigate = useNavigate();
  const { startDate, endDate, loading, setLoading } = useOutletContext<{
    startDate: string;
    endDate: string;
    loading: boolean;
    setLoading: (l: boolean) => void;
  }>();
  const [stats, setStats] = useState<any>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      const data = await getAdminDashboardStats(startDate || undefined, endDate || undefined);
      if (data) {
        setStats(data);
      }
      setLoading(false);
      setIsInitialLoad(false);
    };
    fetchStats();
  }, [startDate, endDate]);

  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "₫";
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
      CONFIRMED: "bg-blue-50 text-blue-700 border-blue-200",
      PROCESSING: "bg-indigo-50 text-indigo-700 border-indigo-200",
      SHIPPING: "bg-purple-50 text-purple-700 border-purple-200",
      DELIVERED: "bg-green-50 text-green-700 border-green-200",
      CANCELLED: "bg-red-50 text-red-700 border-red-200",
      RETURNED: "bg-zinc-50 text-zinc-700 border-zinc-200",
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[status] || "bg-gray-50 text-gray-700"}`}>
        {status}
      </span>
    );
  };

  if (isInitialLoad && loading) {
    return (
      <div className="flex h-[80vh] justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground font-medium">Đang tải số liệu thống kê...</span>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6 text-center text-destructive">
        Lỗi: Không thể tải dữ liệu Dashboard. Vui lòng kiểm tra kết nối với Backend.
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Doanh thu</p>
                <h3 className="text-3xl font-extrabold text-foreground">{formatPrice(stats.totalRevenue)}</h3>
              </div>
              <div className="p-3 rounded-2xl bg-purple-50 text-purple-600">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Đơn hàng</p>
                <h3 className="text-3xl font-extrabold text-foreground">{stats.totalOrders}</h3>
              </div>
              <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
                <ShoppingCart className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Khách hàng</p>
                <h3 className="text-3xl font-extrabold text-foreground">{stats.totalUsers}</h3>
              </div>
              <div className="p-3 rounded-2xl bg-green-50 text-green-600">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Sản phẩm</p>
                <h3 className="text-3xl font-extrabold text-foreground">{stats.totalProducts}</h3>
              </div>
              <div className="p-3 rounded-2xl bg-yellow-50 text-yellow-600">
                <Package className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid: Recent Orders and Top Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders Table */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold">Đơn hàng gần đây</CardTitle>
            <button
              onClick={() => navigate("/orders")}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              Xem tất cả <ArrowRight className="h-3 w-3" />
            </button>
          </CardHeader>
          <CardContent>
            {stats.recentOrders && stats.recentOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground text-xs uppercase font-bold">
                      <th className="py-3 px-2">Mã đơn</th>
                      <th className="py-3 px-2">Khách hàng</th>
                      <th className="py-3 px-2">Tổng tiền</th>
                      <th className="py-3 px-2">Trạng thái</th>
                      <th className="py-3 px-2 text-right">Thời gian</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentOrders.map((order: any) => (
                      <tr key={order._id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="py-3.5 px-2 font-mono font-semibold text-xs">{order.orderId}</td>
                        <td className="py-3.5 px-2">
                          <div className="font-semibold">{order.userId?.fullName || "Khách vãng lai"}</div>
                          <div className="text-xs text-muted-foreground">{order.userId?.email || ""}</div>
                        </td>
                        <td className="py-3.5 px-2 font-bold">{formatPrice(order.totalAmount)}</td>
                        <td className="py-3.5 px-2">{getStatusBadge(order.orderStatus)}</td>
                        <td className="py-3.5 px-2 text-right text-muted-foreground text-xs">
                          {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-6 text-sm">Chưa có đơn hàng nào.</p>
            )}
          </CardContent>
        </Card>

        {/* Top Selling Products */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold">Sản phẩm bán chạy</CardTitle>
            <button
              onClick={() => navigate("/products")}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              Xem tất cả <ArrowRight className="h-3 w-3" />
            </button>
          </CardHeader>
          <CardContent>
            {stats.topProducts && stats.topProducts.length > 0 ? (
              <div className="space-y-4">
                {stats.topProducts.map((prod: any) => (
                  <div key={prod._id} className="flex items-center space-x-3 p-2 rounded-xl hover:bg-muted/30 transition-colors">
                    {prod.images?.[0] ? (
                      <img
                        src={prod.images[0]}
                        alt={prod.name}
                        className="w-12 h-12 object-cover rounded-lg bg-muted border border-border"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-muted rounded-lg border border-border flex items-center justify-center text-muted-foreground">
                        📦
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold truncate text-foreground">{prod.name}</h4>
                      <p className="text-xs text-muted-foreground">SKU: {prod.productId}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-yellow-600 dark:text-yellow-500">Đã bán: {prod.soldCount || 0}</div>
                      <div className="text-xs text-muted-foreground">Xem: {prod.viewCount || 0}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-6 text-sm">Chưa có sản phẩm nào có lượt bán.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
