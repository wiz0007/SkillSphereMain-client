import axios from "axios";

const API = "https://skillspheremain-server-1.onrender.com/api/auth";

export const loginUser = async (data: {
  email: string;
  password: string;
}) => {
  const res = await axios.post(`${API}/login`, data);
  return res.data;
};

export const registerUser = async (data: {
  name: string;
  email: string;
  password: string;
}) => {
  const res = await axios.post(`${API}/register`, data);
  return res.data;
};