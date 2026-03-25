import axios from "axios";

export const uploadProfilePhoto = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("profilePhoto", file);

  const token = localStorage.getItem("token"); // ✅ ADD

  const res = await axios.post(
    "https://skillspheremain-server-1.onrender.com/api/profile/upload-photo",
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`, // ✅ CRITICAL
      }
    }
  );

  return res.data.imageUrl;
};