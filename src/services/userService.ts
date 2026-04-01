import { api } from "../components/api/api";

export const completeProfile = async (data: any) => {
  const res = await api.put("/users/onboarding", data);
  return res.data;
};