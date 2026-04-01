import axios from "axios";
import { api } from "../components/api/api";

const API = `${api}/profile`;

/* ================= CREATE PROFILE ================= */

export const createProfile = async (data: any) => {
  const token = localStorage.getItem("token");

  const res = await axios.post(API, data, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  console.log("CREATE PROFILE RESPONSE:", res.data);

  return res.data;
};

/* ================= GET PROFILE ================= */

export const getMyProfile = async () => {
  const token = localStorage.getItem("token");

  const res = await axios.get(`${API}/me`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return res.data;
};

/* ================= BECOME TUTOR ================= */

export const becomeTutor = async (data: {
  category: string;
  experience: number;
  hourlyRate: number;
}) => {
  const token = localStorage.getItem("token");

  const res = await axios.patch(`${API}/become-tutor`, data, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  console.log("BECOME TUTOR RESPONSE:", res.data);

  return res.data;
};

