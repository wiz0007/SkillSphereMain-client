import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

export const completeProfile = async (data: any) => {
  const token = localStorage.getItem("token");

  const res = await API.put("/users/onboarding", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};