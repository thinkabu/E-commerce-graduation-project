import React from "react";

const Dashboard: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Tổng sản phẩm", value: "1,248", icon: "📦", color: "bg-blue-50 text-blue-600" },
          { label: "Người dùng", value: "3,721", icon: "👥", color: "bg-green-50 text-green-600" },
          { label: "Đơn hàng", value: "856", icon: "🛒", color: "bg-yellow-50 text-yellow-600" },
          { label: "Doanh thu", value: "₫124M", icon: "💰", color: "bg-purple-50 text-purple-600" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg text-xl ${stat.color} mb-3`}>
              {stat.icon}
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>
      <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Hoạt động gần đây</h2>
        <p className="text-gray-500 text-sm">Tính năng sẽ được cập nhật sau khi kết nối API.</p>
      </div>
    </div>
  );
};

export default Dashboard;
