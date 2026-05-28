import { api } from "../api/api";

export const uploadProfilePhoto = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("profilePhoto", file);

  const res = await api.post("/profile/upload-photo", formData);

  return res.data.imageUrl;
};
