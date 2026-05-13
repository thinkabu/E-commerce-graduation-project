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
import { Link } from "react-router-dom";
import { Plus, ChevronLeft, ChevronRight, Edit, Trash2, Ban, Loader2, RefreshCw } from "lucide-react";
import { usePageTitle } from "@/contexts/PageTitleContext";
import { toast } from "sonner";
import { fetchUsers, deleteUser, updateUserStatus, type User } from "@/services/userService";

const AllUsers: React.FC = () => {
  usePageTitle("Danh Sách Người Dùng");

  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    const data = await fetchUsers();
    setUsers(data);
    setIsLoading(false);
  };

  const sortedUsers = [...users].sort((a, b) => {
    // 1. Đưa Admin lên đầu
    if (a.role === 'admin' && b.role !== 'admin') return -1;
    if (a.role !== 'admin' && b.role === 'admin') return 1;
    
    // 2. Sắp xếp theo ngày tạo (mới nhất lên trước)
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  });

  const filteredUsers = sortedUsers
    .filter(user => 
      (user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
       user.email?.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .filter(user => roleFilter === "all" || user.role === roleFilter);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa user này?")) {
      const success = await deleteUser(id);
      if (success) {
        toast.success("Xóa người dùng thành công!");
        loadUsers();
      } else {
        toast.error("Lỗi khi xóa người dùng.");
      }
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const action = currentStatus ? "vô hiệu hóa" : "kích hoạt";
    if (window.confirm(`Bạn muốn ${action} tài khoản này?`)) {
      const success = await updateUserStatus(id, !currentStatus);
      if (success) {
        toast.success(`Đã ${action} tài khoản thành công!`);
        loadUsers();
      } else {
        toast.error("Lỗi khi cập nhật trạng thái.");
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-sm">
        <CardHeader className="border-b border-zinc-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Input
                  placeholder="Tìm user theo tên hoặc email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="rounded-xl h-11"
                />
              </div>
              <div className="w-full md:w-48">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="rounded-xl h-11">
                    <SelectValue placeholder="Lọc theo Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả vai trò</SelectItem>
                    <SelectItem value="admin">Quản trị viên</SelectItem>
                    <SelectItem value="moderator">Người kiểm duyệt</SelectItem>
                    <SelectItem value="user">Khách hàng</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                variant="outline" 
                onClick={loadUsers} 
                className="rounded-xl h-11"
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            <Button asChild className="rounded-xl h-11 bg-zinc-900 hover:bg-zinc-800">
              <Link to="/users/add">
                <Plus className="mr-2 h-4 w-4" /> Thêm người dùng
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-zinc-50/50">
                <TableRow>
                  <TableHead className="py-4 font-bold text-zinc-900">Tên người dùng</TableHead>
                  <TableHead className="py-4 font-bold text-zinc-900">Email</TableHead>
                  <TableHead className="py-4 font-bold text-zinc-900">Vai trò</TableHead>
                  <TableHead className="py-4 font-bold text-zinc-900">Trạng thái</TableHead>
                  <TableHead className="py-4 font-bold text-zinc-900 text-right pr-6">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-48 text-center">
                      <div className="flex flex-col items-center gap-2 text-zinc-400">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <p className="text-sm font-medium">Đang tải dữ liệu...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : paginatedUsers.length > 0 ? (
                  paginatedUsers.map((user) => (
                    <TableRow key={user._id} className="hover:bg-zinc-50/50 transition-colors">
                      <TableCell className="font-semibold text-zinc-900">{user.fullName}</TableCell>
                      <TableCell className="text-zinc-500">{user.email}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={user.role === 'admin' ? "default" : "secondary"}
                          className="capitalize rounded-lg px-3 py-1"
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={user.isActive ? "outline" : "destructive"} 
                          className={`rounded-lg px-3 py-1 ${user.isActive ? "text-green-600 border-green-200 bg-green-50" : ""}`}
                        >
                          {user.isActive ? "Hoạt động" : "Bị khóa"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2 pr-6">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleToggleStatus(user._id, user.isActive)}
                          className={`h-9 w-9 rounded-lg ${user.isActive ? 'hover:bg-orange-50 text-orange-600' : 'hover:bg-green-50 text-green-600'}`}
                          title={user.isActive ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                        <Button asChild variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-blue-50 text-blue-600">
                          <Link to={`/users/edit/${user._id}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDelete(user._id)}
                          className="h-9 w-9 rounded-lg hover:bg-red-50 text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-48 text-center text-zinc-400">
                      Không tìm thấy người dùng nào phù hợp.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {totalPages > 1 && (
             <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-100">
               <p className="text-sm text-zinc-500">
                 Hiển thị trang {currentPage} trên tổng số {totalPages}
               </p>
               <div className="flex items-center gap-2">
                 <Button 
                   variant="outline" 
                   size="sm" 
                   onClick={() => handlePageChange(currentPage - 1)} 
                   disabled={currentPage === 1}
                   className="rounded-lg"
                 >
                   <ChevronLeft className="h-4 w-4 mr-1" /> Trước
                 </Button>
                 <Button 
                   variant="outline" 
                   size="sm" 
                   onClick={() => handlePageChange(currentPage + 1)} 
                   disabled={currentPage === totalPages}
                   className="rounded-lg"
                 >
                   Sau <ChevronRight className="h-4 w-4 ml-1" />
                 </Button>
               </div>
             </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AllUsers;
