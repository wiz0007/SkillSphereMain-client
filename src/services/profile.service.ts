import { api } from "../api/api";

export interface ProfileSettings {
  theme?: "dark" | "light";
  notifications?: {
    sessionUpdates?: boolean;
    courseRecommendations?: boolean;
    marketingEmails?: boolean;
  };
}

export const createProfile = async (data: any) => {
  const res = await api.post("/profile", data);
  return res.data;
};

export const getMyProfile = async () => {
  const res = await api.get("/profile/me");
  return res.data;
};

export const updateProfile = async (data: any) => {
  const res = await api.put("/profile", data);
  return res.data;
};

export const becomeTutor = async (data: any) => {
  const res = await api.post("/profile/become-tutor", data);
  return res.data;
};

export const getPublicProfile = async (userId: string) => {
  const res = await api.get(`/profile/public/${userId}`);
  return res.data;
};
