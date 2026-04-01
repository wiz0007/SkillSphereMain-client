import { api } from "../components/api/api";

/* ================= CREATE PROFILE ================= */
export const createProfile = async (data: any) => {
  const res = await api.post("/profile", data);

  console.log("CREATE PROFILE RESPONSE:", res.data);

  return res.data;
};

/* ================= GET PROFILE ================= */
export const getMyProfile = async () => {
  const res = await api.get("/profile/me");
  return res.data;
};

/* ================= BECOME TUTOR ================= */
export const becomeTutor = async (data: {
  category: string;
  experience: number;
  hourlyRate: number;
}) => {
  const res = await api.patch("/profile/become-tutor", data);

  console.log("BECOME TUTOR RESPONSE:", res.data);

  return res.data;
};

