import React, { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { usePageTitle } from "@/contexts/PageTitleContext";
import { logout, getAdminUser } from "@/services/authService";
import { LogOut, ChevronLeft, ChevronRight, LayoutDashboard, Smartphone, Users, Layers, ShoppingCart, Ticket, BarChart3, HelpCircle, Settings } from "lucide-react";

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} />, path: "/dashboard" },
  { id: "products", label: "Products", icon: <Smartphone size={20} />, path: "/products" },
  { id: "users", label: "Users", icon: <Users size={20} />, path: "/users" },
  { id: "category", label: "Categories", icon: <Layers size={20} />, path: "/category" },
  { id: "orders", label: "Orders", icon: <ShoppingCart size={20} />, path: "/orders" },
  { id: "coupons", label: "Coupons", icon: <Ticket size={20} />, path: "/coupons" },
];

const reportItems = [
  { id: "report", label: "Thống kê", icon: <BarChart3 size={20} />, path: "/report" },
  { id: "help", label: "Hỗ trợ kỹ thuật", icon: <HelpCircle size={20} />, path: "/help" },
  { id: "setting", label: "Cấu hình", icon: <Settings size={20} />, path: "/setting" },
];

const Layout: React.FC = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { pageTitle } = usePageTitle();
  const admin = getAdminUser();

  const isActive = (path: string) => {
    if (path === "/products") return location.pathname.startsWith("/products");
    if (path === "/coupons") return location.pathname.startsWith("/coupons");
    return location.pathname === path;
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          collapsed ? "w-16" : "w-60"
        } flex-shrink-0 bg-zinc-900 flex flex-col transition-all duration-300 z-30 shadow-xl`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-zinc-800">
          {!collapsed && (
            <span className="text-lg font-black text-white truncate tracking-tight uppercase">
              Think hearT <span className="text-yellow-500 font-medium italic">DIGITAL</span>
            </span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all ml-auto"
            title={collapsed ? "Mở rộng" : "Thu gọn"}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
          {menuItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                isActive(item.path)
                  ? "bg-yellow-500 text-zinc-900 shadow-lg shadow-yellow-500/20"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
              }`}
            >
              <div className="flex-shrink-0">{item.icon}</div>
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          ))}

          <div className="my-6 border-t border-zinc-800 opacity-50" />

          {reportItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                isActive(item.path)
                  ? "bg-yellow-500 text-zinc-900 shadow-lg shadow-yellow-500/20"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
              }`}
            >
              <div className="flex-shrink-0">{item.icon}</div>
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/50">
          <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-zinc-900 font-black text-sm shadow-lg">
              {admin?.fullName?.charAt(0) || "A"}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{admin?.fullName || "Admin"}</p>
                <p className="text-[10px] text-zinc-500 truncate font-medium uppercase tracking-wider">{admin?.role || "Quản trị viên"}</p>
              </div>
            )}
            {!collapsed && (
              <button 
                onClick={logout}
                className="p-2 rounded-lg text-zinc-500 hover:bg-red-500/10 hover:text-red-500 transition-colors"
                title="Đăng xuất"
              >
                <LogOut size={18} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-zinc-200 flex items-center px-8 justify-between z-20">
          <div className="flex items-center gap-4">
            <div className="h-6 w-1 bg-yellow-500 rounded-full" />
            <h1 className="text-xl font-black text-zinc-900 tracking-tight uppercase">
              {pageTitle}
            </h1>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Thời gian hệ thống</span>
              <span className="text-sm font-black text-zinc-900">
                {new Date().toLocaleDateString("vi-VN", {
                  weekday: "long",
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </span>
            </div>
            
            {collapsed && (
               <button 
               onClick={logout}
               className="p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm"
               title="Đăng xuất"
             >
               <LogOut size={20} />
             </button>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-zinc-50/50 p-8 custom-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
