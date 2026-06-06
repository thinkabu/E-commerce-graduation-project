import { getAdminUser } from "./authService";

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface CreateCampaignPayload {
  title: string;
  body: string;
  targetType: 'ALL_USERS' | 'SPECIFIC_USERS';
  targetUserIds?: string[];
  data?: Record<string, any>;
  sendType: 'IMMEDIATE' | 'SCHEDULED';
  scheduledAt?: string;
}

export interface Campaign {
  _id: string;
  title: string;
  body: string;
  targetType: 'ALL_USERS' | 'SPECIFIC_USERS';
  targetUserIds: string[];
  status: 'DRAFT' | 'SENT' | 'FAILED' | 'SCHEDULED';
  sentCount: number;
  sentAt?: string;
  scheduledAt?: string;
  createdBy: { fullName: string; email: string } | string;
  createdAt: string;
}

export const createCampaign = async (payload: CreateCampaignPayload): Promise<Campaign> => {
  const admin = getAdminUser();
  const res = await fetch(`${BASE_URL}/campaigns?adminId=${admin?._id || ''}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Tạo campaign thất bại');
  const json = await res.json();
  return json.data ?? json;
};

export const getCampaigns = async (page = 1, limit = 20): Promise<{ data: Campaign[]; total: number }> => {
  try {
    const res = await fetch(`${BASE_URL}/campaigns?page=${page}&limit=${limit}`);
    if (!res.ok) throw new Error('Lỗi lấy danh sách campaigns');
    const json = await res.json();
    return json.data ?? json;
  } catch {
    return { data: [], total: 0 };
  }
};

export const getCampaignById = async (id: string): Promise<Campaign> => {
  const res = await fetch(`${BASE_URL}/campaigns/${id}`);
  if (!res.ok) throw new Error('Không tìm thấy campaign');
  const json = await res.json();
  return json.data ?? json;
};
