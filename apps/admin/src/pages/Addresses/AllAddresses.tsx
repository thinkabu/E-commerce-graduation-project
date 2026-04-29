import React, { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { usePageTitle } from "@/contexts/PageTitleContext";
import { Edit, Trash2, MapPin, ChevronLeft, ChevronRight } from "lucide-react";

const AllAddresses: React.FC = () => {
  usePageTitle("Danh Sách Địa Chỉ");

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  const mockAddresses = [
    { _id: "1", user: "Nguyễn Văn A", phone: "0901234567", fullAddress: "123 Đường Điện Biên Phủ, Phường 15, Bình Thạnh, TP.HCM", isDefault: true, type: "home" },
    { _id: "2", user: "Trần Thị B", phone: "0912345678", fullAddress: "Tòa nhà Bitexco, Bến Nghé, Quận 1, TP.HCM", isDefault: false, type: "office" },
  ];

  const filteredAddresses = mockAddresses.filter(addr => 
    addr.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
    addr.fullAddress.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredAddresses.length / itemsPerPage);
  const paginatedAddresses = filteredAddresses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
             <div className="flex-1 max-w-md">
                <Input
                  placeholder="Tìm theo chủ sở hữu hoặc địa chỉ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Chủ sở hữu</TableHead>
                <TableHead>Số điện thoại</TableHead>
                <TableHead>Địa chỉ chi tiết</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Mặc định</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedAddresses.length > 0 ? (
                paginatedAddresses.map((addr) => (
                   <TableRow key={addr._id}>
                      <TableCell className="font-medium">{addr.user}</TableCell>
                      <TableCell>{addr.phone}</TableCell>
                      <TableCell className="max-w-[250px] truncate" title={addr.fullAddress}>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                          {addr.fullAddress}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{addr.type}</Badge>
                      </TableCell>
                      <TableCell>
                        {addr.isDefault ? (
                           <Badge variant="default" className="bg-green-500 hover:bg-green-600">Mặc định</Badge>
                        ) : (
                           <span className="text-gray-400 text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                   </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">Không tìm thấy dữ liệu.</TableCell>
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
export default AllAddresses;
