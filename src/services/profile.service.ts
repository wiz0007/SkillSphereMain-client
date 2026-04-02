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
export const becomeTutorAPI = async (data: any) => {
  const response = await api.post("/profile/become-tutor", data);
  return response.data;
};

