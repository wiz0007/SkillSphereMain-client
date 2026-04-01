import axios from "axios";

const API_BASE_URL = "https://skillspheremain-server-1.onrender.com/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});


// 🔐 REQUEST INTERCEPTOR (AUTO TOKEN ATTACH)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});


// ⚠️ RESPONSE INTERCEPTOR (OPTIONAL)
api.interceptors.response.use(
  (res) => res,
  (error) => {
    console.error("API ERROR:", error.response?.data || error.message);

    // optional: auto logout on 401
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);