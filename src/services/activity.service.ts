import { api } from "../api/api";

export const getMyActivity = async () => {
  const { data } = await api.get("/activity");
  return data;
};