import axios from "axios";

const API = "https://skillspheremain-server-1.onrender.com/api/profile";

export const createProfile = async (data: any) => {
  const token = localStorage.getItem("token");

  const res = await axios.post(API, data, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  console.log("CREATE PROFILE RESPONSE:", res.data);

  // 🔥 IMPORTANT: adjust based on backend response
  return res.data.profile || res.data.user || res.data;
};

export const getMyProfile = async () => {
  const token = localStorage.getItem("token");

  const res = await axios.get(`${API}/me`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return res.data.profile || res.data.user || res.data;
};