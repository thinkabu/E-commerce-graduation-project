import api from "./api";

export interface Address {
  _id: string;
  userId: string;
  fullName: string;
  phone: string;
  street: string;
  ward: string;
  city: string;
  type: "HOME" | "OFFICE" | "OTHER";
  isDefault: boolean;
  isActive: boolean;
  createdAt?: string;
}

const mapAddressFromApi = (data: any): Address => ({
  _id: data._id,
  userId: data.userId,
  fullName: data.fullName,
  phone: data.phone,
  street: data.street,
  ward: data.ward?.name || "",
  city: data.province?.name || "",
  type: data.addressType || "HOME",
  isDefault: data.isDefault,
  isActive: data.isActive,
  createdAt: data.createdAt,
});

export const getAddresses = async (userId: string): Promise<Address[]> => {
  try {
    const res = await api.get(`/addresses?userId=${userId}`);
    const data = res.data?.data ?? res.data;
    return Array.isArray(data) ? data.map(mapAddressFromApi) : [];
  } catch (error) {
    console.error("getAddresses error:", error);
    return [];
  }
};

export const getAddressById = async (
  id: string,
  userId: string,
): Promise<Address | null> => {
  try {
    const res = await api.get(`/addresses/${id}?userId=${userId}`);
    const data = res.data?.data ?? res.data;
    return data ? mapAddressFromApi(data) : null;
  } catch (error) {
    console.error("getAddressById error:", error);
    return null;
  }
};

export interface CreateAddressPayload {
  fullName: string;
  phone: string;
  street: string;
  ward: string;
  city: string;
  type: "HOME" | "OFFICE" | "OTHER";
  isDefault?: boolean;
}

const mapPayloadToApi = (payload: Partial<CreateAddressPayload>) => {
  const apiPayload: any = {};
  if (payload.fullName !== undefined) apiPayload.fullName = payload.fullName;
  if (payload.phone !== undefined) apiPayload.phone = payload.phone;
  if (payload.street !== undefined) apiPayload.street = payload.street;
  if (payload.city !== undefined) {
    apiPayload.province = { code: 0, name: payload.city };
    apiPayload.district = { code: 0, name: payload.city }; // Using city as district to pass validation
  }
  if (payload.ward !== undefined) {
    apiPayload.ward = { code: 0, name: payload.ward };
  }
  if (payload.type !== undefined) apiPayload.addressType = payload.type;
  if (payload.isDefault !== undefined) apiPayload.isDefault = payload.isDefault;

  return apiPayload;
};

export const createAddress = async (
  userId: string,
  payload: CreateAddressPayload,
): Promise<Address | null> => {
  try {
    const apiPayload = mapPayloadToApi(payload);
    const res = await api.post(`/addresses?userId=${userId}`, apiPayload);
    const data = res.data?.data ?? res.data;
    return data ? mapAddressFromApi(data) : null;
  } catch (error) {
    console.error("createAddress error:", error);
    return null;
  }
};

export const updateAddress = async (
  id: string,
  userId: string,
  payload: Partial<CreateAddressPayload>,
): Promise<Address | null> => {
  try {
    const apiPayload = mapPayloadToApi(payload);
    const res = await api.patch(
      `/addresses/${id}?userId=${userId}`,
      apiPayload,
    );
    const data = res.data?.data ?? res.data;
    return data ? mapAddressFromApi(data) : null;
  } catch (error) {
    console.error("updateAddress error:", error);
    return null;
  }
};

export const deleteAddress = async (
  id: string,
  userId: string,
): Promise<boolean> => {
  try {
    await api.delete(`/addresses/${id}?userId=${userId}`);
    return true;
  } catch (error) {
    console.error("deleteAddress error:", error);
    return false;
  }
};
