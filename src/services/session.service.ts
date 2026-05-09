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

export const hideSession = async (sessionId: string) => {
  const { data } = await api.post(`/sessions/${sessionId}/hide`);
  return data;
};

export const updateSessionStatus = async (
  sessionId: string,
  status: "accepted" | "completed" | "cancelled"
) => {
  const { data } = await api.put(`/sessions/${sessionId}`, { status });
  return data;
};

export const confirmSessionCompletion = async (sessionId: string) => {
  const { data } = await api.post(
    `/sessions/${sessionId}/confirm-completion`
  );
  return data;
};
