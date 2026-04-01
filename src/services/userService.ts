import axios from "axios";

import { api } from "../components/api/api";

const API = axios.create({
  baseURL: `${api}`,
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