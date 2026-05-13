import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, Eye, EyeOff, LayoutDashboard, ArrowRight } from "lucide-react";
import { loginAdmin } from "@/services/authService";
import { toast } from "sonner";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const result = await loginAdmin(email, password);
    
    if (result.success) {
      toast.success(result.message);
      navigate("/dashboard");
    } else {
      toast.error(result.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6 selection:bg-yellow-500 selection:text-zinc-900">
      <div className="w-full max-w-md">
        {/* --- LOGO & HEADER --- */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-zinc-900 rounded-2xl shadow-xl shadow-zinc-900/20 mb-6">
            <LayoutDashboard className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-zinc-900 mb-2 uppercase tracking-tighter italic">
            Think <span className="text-yellow-600">hearT</span>
          </h1>
          <p className="text-zinc-500 font-medium">Hệ thống quản lý thiết bị công nghệ</p>
        </div>

        {/* --- LOGIN CARD --- */}
        <div className="bg-white rounded-[32px] p-8 shadow-2xl shadow-zinc-200 border border-zinc-100">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700 ml-1">Email quản trị</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-zinc-400 group-focus-within:text-yellow-600 transition-colors" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-4 bg-zinc-50 border border-zinc-100 text-zinc-900 font-bold rounded-2xl focus:ring-4 focus:ring-yellow-500/10 focus:border-yellow-500 outline-none transition-all"
                  placeholder="admin@techshop.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-sm font-bold text-zinc-700">Mật khẩu</label>
                <a href="#" className="text-sm font-bold text-yellow-600 hover:text-yellow-700 transition-colors">Quên mật khẩu?</a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-zinc-400 group-focus-within:text-yellow-600 transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-12 py-4 bg-zinc-50 border border-zinc-100 text-zinc-900 font-bold rounded-2xl focus:ring-4 focus:ring-yellow-500/10 focus:border-yellow-500 outline-none transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white font-black py-4 rounded-2xl shadow-xl shadow-zinc-900/20 transition-all active:scale-[0.98] disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>VÀO HỆ THỐNG</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* --- FOOTER --- */}
        <div className="mt-10 text-center">
          <p className="text-sm text-zinc-400 font-medium">
            &copy; 2026 TechShop Admin Panel. Bảo mật bởi <span className="text-zinc-600 font-bold">SafeShield</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
