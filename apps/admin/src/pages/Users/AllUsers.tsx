import React, { useState } from "react";
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
import { Plus, ChevronLeft, ChevronRight, Edit, Trash2, Ban } from "lucide-react";
import { usePageTitle } from "@/contexts/PageTitleContext";
import { toast } from "sonner";
const UserRole = {
  USER: 'user',
  ADMIN: 'admin',
} as const;

type UserRole = (typeof UserRole)[keyof typeof UserRole];

const AllUsers: React.FC = () => {
  usePageTitle("Danh Sách Người Dùng");

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Mock data for UI presentation
  const mockUsers = [
    { _id: "1", fullName: "Nguyễn Văn A", email: "a.nguyen@example.com", phone: "0901234567", role: UserRole.USER, isActive: true },
    { _id: "2", fullName: "Trần Thị B", email: "b.tran@example.com", phone: "0912345678", role: UserRole.ADMIN, isActive: true },
    { _id: "3", fullName: "Lê Văn C", email: "c.le@example.com", phone: "0923456789", role: UserRole.USER, isActive: false },
  ];

  const filteredUsers = mockUsers
    .filter(user => user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(user => roleFilter === "all" || user.role === roleFilter);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleDelete = (_id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa user này?")) {
      toast.success("Đã xóa user thành công (Mock)!");
    }
  };

  const handleBan = (_id: string) => {
    if (window.confirm("Bạn muốn vô hiệu hóa tài khoản này?")) {
      toast.success("Tài khoản đã bị vô hiệu hóa (Mock)!");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-end md:space-x-4 md:space-y-0 space-y-4">
            <div className="flex-1 md:w-64">
              <Input
                placeholder="Tìm user theo tên hoặc email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Lọc theo Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                  <SelectItem value={UserRole.USER}>User</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button asChild className="md:w-auto w-full">
              <Link to="/users/add">
                <Plus className="mr-2 h-4 w-4" /> Add User
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Tên</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>SĐT</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell className="font-medium">{user.fullName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === UserRole.ADMIN ? "default" : "secondary"}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? "outline" : "destructive"} className={user.isActive ? "text-green-600 border-green-600" : ""}>
                        {user.isActive ? "Active" : "Banned"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                       <Button variant="outline" size="sm" onClick={() => handleBan(user._id)}>
                        <Ban className="h-4 w-4 text-orange-500" />
                      </Button>
                      <Button asChild variant="outline" size="sm">
                        <Link to={`/users/edit/${user._id}`}>
                          <Edit className="h-4 w-4 text-blue-500" />
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(user._id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">Không tìm thấy người dùng phù hợp.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          
          {totalPages > 1 && (
             <div className="flex items-center justify-end space-x-2 mt-4">
               <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                 <ChevronLeft className="h-4 w-4" /> Prev
               </Button>
               <span className="text-sm">Page {currentPage} of {totalPages}</span>
               <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                 Next <ChevronRight className="h-4 w-4" />
               </Button>
             </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AllUsers;
