import { api } from "../api/api";

/* ================= INTERCEPTOR ================= */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/* ================= CREATE PROFILE ================= */
export const createProfile = async (data: any) => {
  const res = await api.post("/profile", data);
  return res.data;
};

/* ================= GET PROFILE ================= */
export const getMyProfile = async () => {
  const res = await api.get("/profile/me");
  return res.data;
};

/* ================= UPDATE PROFILE ================= */
export const updateProfile = async (data: any) => {
  const res = await api.put("/profile", data);
  return res.data;
};

/* ================= BECOME TUTOR ================= */
export const becomeTutor = async (data: any) => {
  const res = await api.post("/profile/become-tutor", data);
  return res.data;
};

export const getPublicProfile = async (userId: string) => {
  const res = await api.get(`/profile/public/${userId}`);
  return res.data;
};