import React, { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { PageTitleProvider } from "@/contexts/PageTitleContext";

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: "📊", path: "/dashboard" },
  { id: "products", label: "Sản phẩm", icon: "📦", path: "/products" },
  { id: "users", label: "Người dùng", icon: "👥", path: "/users" },
  { id: "addresses", label: "Địa chỉ", icon: "📍", path: "/addresses" },
  { id: "category", label: "Danh mục", icon: "🏷️", path: "/category" },
  { id: "orders", label: "Đơn hàng", icon: "🛒", path: "/orders" },
  { id: "coupons", label: "Mã giảm giá", icon: "🎟️", path: "/coupons" },
];

const reportItems = [
  { id: "report", label: "Báo cáo", icon: "📊", path: "/report" },
  { id: "help", label: "Hỗ trợ", icon: "❓", path: "/help" },
  { id: "setting", label: "Cài đặt", icon: "⚙️", path: "/setting" },
];

const Layout: React.FC = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (path: string) => {
    if (path === "/products") return location.pathname.startsWith("/products");
    if (path === "/coupons") return location.pathname.startsWith("/coupons");
    return location.pathname === path;
  };

  return (
    <PageTitleProvider>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`${
            collapsed ? "w-16" : "w-60"
          } flex-shrink-0 bg-white border-r border-gray-200 flex flex-col transition-all duration-300`}
        >
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            {!collapsed && (
              <span className="text-lg font-bold text-gray-900 truncate">
                🛍️ Admin Panel
              </span>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors ml-auto"
              title={collapsed ? "Mở rộng" : "Thu gọn"}
            >
              {collapsed ? "→" : "←"}
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
            {menuItems.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            ))}

            <div className="my-2 border-t border-gray-100" />

            {reportItems.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            ))}
          </nav>

          {/* Footer */}
          {!collapsed && (
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                  A
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">Admin</p>
                  <p className="text-xs text-gray-500 truncate">admin@shop.com</p>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 gap-4">
            <h1 className="text-lg font-semibold text-gray-800">Admin Panel</h1>
            <div className="ml-auto flex items-center gap-3">
              <span className="text-sm text-gray-500">
                {new Date().toLocaleDateString("vi-VN", {
                  weekday: "long",
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </span>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </PageTitleProvider>
  );
};

export default Layout;
