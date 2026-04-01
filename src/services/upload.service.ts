import axios from "axios";

import { api } from "../components/api/api";

const API = `${api}/profile`;

export const uploadProfilePhoto = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("profilePhoto", file);

  const token = localStorage.getItem("token"); // ✅ ADD

  const res = await axios.post(
    `${API}/upload-photo`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`, // ✅ CRITICAL
      }
    }
  );

  return res.data.imageUrl;
};