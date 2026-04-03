import { api } from "../api/api";

export const uploadProfilePhoto = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("profilePhoto", file);

  const res = await api.post("/profile/upload-photo", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data.imageUrl;
};