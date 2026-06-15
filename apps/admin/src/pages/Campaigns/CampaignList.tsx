import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePageTitle } from "@/contexts/PageTitleContext";
import {
  Bell,
  Plus,
  Loader2,
  CheckCircle2,
  XCircle,
  FileText,
  X,
  Clock,
} from "lucide-react";
import { getCampaigns, createCampaign } from "@/services/campaignService";
import type {
  Campaign,
  CreateCampaignPayload,
} from "@/services/campaignService";

// ── Status Badge ───────────────────────────────────────────────────

const StatusBadge: React.FC<{ status: Campaign["status"] }> = ({ status }) => {
  switch (status) {
    case "SENT":
      return (
        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 gap-1 border-green-200">
          <CheckCircle2 className="w-3 h-3" /> Đã gửi
        </Badge>
      );
    case "FAILED":
      return (
        <Badge className="bg-red-100 text-red-700 hover:bg-red-100 gap-1 border-red-200">
          <XCircle className="w-3 h-3" /> Thất bại
        </Badge>
      );
    case "SCHEDULED":
      return (
        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 gap-1 border-blue-200">
          <Clock className="w-3 h-3" /> Đặt lịch
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="gap-1">
          <FileText className="w-3 h-3" /> Nháp
        </Badge>
      );
  }
};

// ── Create Campaign Modal (custom, không dùng Dialog component) ───

interface CreateModalProps {
  onCreated: () => void;
}

const CreateCampaignModal: React.FC<CreateModalProps> = ({ onCreated }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<CreateCampaignPayload>({
    title: "",
    body: "",
    targetType: "ALL_USERS",
    targetUserIds: [],
    sendType: "IMMEDIATE",
    scheduledAt: "",
  });
  const overlayRef = useRef<HTMLDivElement>(null);

  // Đóng modal khi click ra ngoài
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) setOpen(false);
  };

  const getLocalDatetimeString = () => {
    const tzoffset = new Date().getTimezoneOffset() * 60000;
    return new Date(Date.now() - tzoffset).toISOString().slice(0, 16);
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.body.trim()) {
      setError("Vui lòng nhập đầy đủ tiêu đề và nội dung");
      return;
    }
    if (form.sendType === "SCHEDULED") {
      if (!form.scheduledAt) {
        setError("Vui lòng chọn thời gian đặt lịch gửi");
        return;
      }
      const schedTime = new Date(form.scheduledAt).getTime();
      if (schedTime <= Date.now()) {
        setError("Thời gian đặt lịch gửi phải nằm trong tương lai");
        return;
      }
    }
    setError("");
    setLoading(true);
    try {
      await createCampaign(form);
      setOpen(false);
      setForm({
        title: "",
        body: "",
        targetType: "ALL_USERS",
        targetUserIds: [],
        sendType: "IMMEDIATE",
        scheduledAt: "",
      });
      onCreated();
    } catch (e: any) {
      setError(e?.message ?? "Có lỗi xảy ra, thử lại sau");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="gap-2 bg-yellow-500 hover:bg-yellow-600 text-zinc-900 font-bold shadow-sm"
      >
        <Plus className="w-4 h-4" />
        Tạo Campaign
      </Button>

      {open && (
        <div
          ref={overlayRef}
          onClick={handleOverlayClick}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 animate-in fade-in-0 zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Bell className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-zinc-900">
                    Tạo Campaign
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Push notification tới người dùng
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <div className="space-y-4">
              {/* Tiêu đề */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-zinc-700">
                  Tiêu đề <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="VD: 🎉 Flash Sale 50% hôm nay!"
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  maxLength={200}
                />
                <p className="text-[11px] text-zinc-400">
                  {form.title.length}/200 ký tự
                </p>
              </div>

              {/* Nội dung – dùng textarea HTML thuần */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-zinc-700">
                  Nội dung <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full min-h-[90px] px-3 py-2 text-sm border border-zinc-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent placeholder:text-zinc-400"
                  placeholder="VD: Giảm đến 50% tất cả sản phẩm hôm nay. Nhanh tay mua ngay!"
                  value={form.body}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, body: e.target.value }))
                  }
                  maxLength={500}
                  rows={3}
                />
                <p className="text-[11px] text-zinc-400">
                  {form.body.length}/500 ký tự
                </p>
              </div>

              {/* Đối tượng */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-zinc-700">
                  Đối tượng nhận
                </label>
                <Select
                  value={form.targetType}
                  onValueChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      targetType: v as "ALL_USERS" | "SPECIFIC_USERS",
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL_USERS">
                      🌐 Tất cả người dùng
                    </SelectItem>
                    <SelectItem value="SPECIFIC_USERS">
                      👥 Chọn người dùng cụ thể
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Chế độ gửi */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-zinc-700">
                  Chế độ gửi
                </label>
                <Select
                  value={form.sendType}
                  onValueChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      sendType: v as "IMMEDIATE" | "SCHEDULED",
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IMMEDIATE">
                      ⚡ Gửi ngay lập tức
                    </SelectItem>
                    <SelectItem value="SCHEDULED">
                      📅 Đặt lịch gửi theo ngày giờ
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Đặt ngày giờ - chỉ hiện khi chọn SCHEDULED */}
              {form.sendType === "SCHEDULED" && (
                <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                  <label className="text-sm font-semibold text-zinc-700">
                    Thời gian gửi <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="datetime-local"
                    value={form.scheduledAt || ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, scheduledAt: e.target.value }))
                    }
                    min={getLocalDatetimeString()}
                  />
                </div>
              )}

              {/* Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
                <strong>Lưu ý:</strong>{" "}
                {form.sendType === "SCHEDULED" ? (
                  <>
                    Thông báo sẽ được tự động gửi đến người dùng vào đúng thời
                    gian đã đặt lịch.
                  </>
                ) : (
                  <>
                    Thông báo sẽ được gửi <strong>ngay lập tức</strong> đến tất
                    cả thiết bị đã đăng ký push notification.
                  </>
                )}
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 mt-6 pt-5 border-t border-zinc-100">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Hủy
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-yellow-500 hover:bg-yellow-600 text-zinc-900 font-bold gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {form.sendType === "SCHEDULED"
                      ? "Đang đặt lịch..."
                      : "Đang gửi..."}
                  </>
                ) : (
                  <>
                    {form.sendType === "SCHEDULED" ? (
                      <>
                        <Clock className="w-4 h-4" />
                        Đặt lịch gửi
                      </>
                    ) : (
                      <>
                        <Bell className="w-4 h-4" />
                        Gửi ngay
                      </>
                    )}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ── Main Page ──────────────────────────────────────────────────────

const CampaignList: React.FC = () => {
  usePageTitle("Quản Lý Campaign");

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await getCampaigns(1, 50);
      setCampaigns(res.data ?? []);
      setTotal(res.total ?? 0);
    } catch {
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const getCreatorName = (createdBy: Campaign["createdBy"]): string => {
    if (typeof createdBy === "string") return "Admin";
    return (
      (createdBy as { fullName?: string; email?: string })?.fullName ?? "Admin"
    );
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Tổng campaigns
              </p>
              <h3 className="text-2xl font-bold mt-1">{total}</h3>
            </div>
            <div className="h-12 w-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center">
              <Bell className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Đã gửi thành công
              </p>
              <h3 className="text-2xl font-bold mt-1 text-green-600">
                {campaigns.filter((c) => c.status === "SENT").length}
              </h3>
            </div>
            <div className="h-12 w-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Tổng thiết bị nhận
              </p>
              <h3 className="text-2xl font-bold mt-1 text-blue-600">
                {campaigns
                  .reduce((sum, c) => sum + (c.sentCount ?? 0), 0)
                  .toLocaleString()}
              </h3>
            </div>
            <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
              <Bell className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <h2 className="text-base font-bold">Danh sách Campaigns</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Push notification campaigns gửi đến người dùng mobile
            </p>
          </div>
          <CreateCampaignModal onCreated={fetchCampaigns} />
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Tiêu đề</TableHead>
                <TableHead>Đối tượng</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thiết bị nhận</TableHead>
                <TableHead>Thời gian gửi</TableHead>
                <TableHead>Tạo bởi</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-zinc-400" />
                  </TableCell>
                </TableRow>
              ) : campaigns.length > 0 ? (
                campaigns.map((campaign) => (
                  <TableRow key={campaign._id}>
                    <TableCell>
                      <div className="max-w-[220px]">
                        <p className="font-semibold text-sm truncate">
                          {campaign.title}
                        </p>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {campaign.body}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {campaign.targetType === "ALL_USERS"
                          ? "🌐 Tất cả"
                          : "👥 Chọn lọc"}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <StatusBadge status={campaign.status} />
                    </TableCell>

                    <TableCell className="text-right font-semibold text-blue-600">
                      {(campaign.sentCount ?? 0).toLocaleString()}
                    </TableCell>

                    <TableCell className="text-sm text-muted-foreground">
                      {campaign.status === "SCHEDULED" &&
                      campaign.scheduledAt ? (
                        <span className="text-blue-600 font-medium">
                          Lịch gửi:{" "}
                          {new Date(campaign.scheduledAt).toLocaleString(
                            "vi-VN",
                          )}
                        </span>
                      ) : campaign.sentAt ? (
                        new Date(campaign.sentAt).toLocaleString("vi-VN")
                      ) : (
                        "—"
                      )}
                    </TableCell>

                    <TableCell className="text-sm">
                      {getCreatorName(campaign.createdBy)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Bell className="h-8 w-8 opacity-30" />
                      <p className="text-sm">
                        Chưa có campaign nào. Tạo campaign đầu tiên!
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default CampaignList;
