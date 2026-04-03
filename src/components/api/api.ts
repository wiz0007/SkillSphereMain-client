import axios from "axios";

const API_BASE_URL = "https://skillspheremain-server-1.onrender.com/api";
// const API_BASE_URL = "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

// 🔐 REQUEST INTERCEPTOR (FINAL FIX)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    // console.log("TOKEN:", token); // DEBUG

    if (token) {
      // ✅ THIS LINE FIXES EVERYTHING
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ⚠️ RESPONSE INTERCEPTOR
api.interceptors.response.use(
  (res) => res,
  (error) => {
    console.error("API ERROR:", error.response?.data || error.message);

    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);