import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Layout from "@/components/layout/Layout";
import Login from "@/pages/auth/Login";
import Dashboard from "@/pages/Dashboard";

// Products
import AllProducts from "@/pages/Products/AllProducts";
import AddProduct from "@/pages/Products/AddProduct";
import EditProduct from "@/pages/Products/EditProduct";

// Users
import AllUsers from "@/pages/Users/AllUsers";

// Addresses
import AllAddresses from "@/pages/Addresses/AllAddresses";

// Categories
import CategoryList from "@/pages/Categories/CategoryList";

// Orders
import OrderList from "@/pages/Orders/OrderList";

// Coupons
import CouponList from "@/pages/Coupons/CouponList";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public route */}
        <Route path="/login" element={<Login />} />

        {/* Protected routes — bọc trong Layout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* Redirect root => /dashboard */}
          <Route index element={<Navigate to="/dashboard" replace />} />

          {/* Dashboard */}
          <Route path="dashboard" element={<Dashboard />} />

          {/* Products */}
          <Route path="products" element={<AllProducts />} />
          <Route path="products/add" element={<AddProduct />} />
          <Route path="products/edit/:id" element={<EditProduct />} />

          {/* Users */}
          <Route path="users" element={<AllUsers />} />

          {/* Addresses */}
          <Route path="addresses" element={<AllAddresses />} />

          {/* Categories */}
          <Route path="category" element={<CategoryList />} />

          {/* Orders */}
          <Route path="orders" element={<OrderList />} />

          {/* Coupons */}
          <Route path="coupons" element={<CouponList />} />

          {/* Placeholder pages */}
          <Route path="report" element={<ComingSoon title="Báo cáo" />} />
          <Route path="help" element={<ComingSoon title="Hỗ trợ" />} />
          <Route path="setting" element={<ComingSoon title="Cài đặt" />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </Router>
  );
};

const ComingSoon: React.FC<{ title: string }> = ({ title }) => (
  <div className="flex flex-col items-center justify-center h-64 gap-3">
    <div className="text-5xl">🚧</div>
    <h2 className="text-xl font-semibold text-gray-700">{title}</h2>
    <p className="text-gray-400 text-sm">Tính năng đang được phát triển...</p>
  </div>
);

export default App;
