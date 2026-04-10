import { api } from "../api/api";

/* ================= GET MY SESSIONS ================= */
export const getMySessions = async () => {
  const { data } = await api.get("/sessions");
  return data;
};

/* ================= CREATE SESSION ================= */
export const createSession = async (payload: {
  courseId: string;
  date: string;
  duration: number;
  message?: string;
}) => {
  const { data } = await api.post("/sessions", payload);
  return data;
};