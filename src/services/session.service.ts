import { api } from "./api";

export const getMySessions = async () => {
  const { data } = await api.get("/sessions");
  return data;
};