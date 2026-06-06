import api from './api';

export const updateProfile = async (id: string, payload: { fullName?: string; phone?: string; avatar?: string }) => {
  try {
    const response = await api.patch(`/users/${id}`, payload);
    return response.data?.data ?? response.data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

export const changePassword = async (id: string, payload: any) => {
  try {
    const response = await api.patch(`/users/${id}/password`, payload);
    return response.data?.data ?? response.data;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};
