import axios from "axios";

export const uploadProfilePhoto = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("profilePhoto", file);

  const res = await axios.post(
    "http://localhost:5000/api/profile/upload-photo",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );

  return res.data.imageUrl;
};