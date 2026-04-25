import { api } from "../api/api";

export const loginUser = async (data: {
  email: string;
  password: string;
}) => {
  const res = await api.post("/auth/login", data);
  return res.data;
};

export const registerUser = async (data: {
  username: string;
  email: string;
  password: string;
}) => {
  const res = await api.post("/auth/register", data);
  return res.data;
};

export const verifyOTP = async (data: {
  userId: string;
  otp: string;
}) => {
  const res = await api.post("/auth/verify-otp", data);
  return res.data;
};

export const resendOTP = async (data: {
  userId: string;
}) => {
  const res = await api.post("/auth/resend-otp", data);
  return res.data;
};

export const checkUsername = async (username: string) => {
  const res = await api.get(`/auth/check-username/${username}`);
  return res.data as { available: boolean };
};

export const changePassword = async (data: {
  currentPassword: string;
  newPassword: string;
}) => {
  const res = await api.post("/auth/change-password", data);
  return res.data;
};

export const deleteAccount = async (data: {
  currentPassword: string;
  confirmationText: string;
}) => {
  const res = await api.post("/auth/delete-account", data);
  return res.data;
};
