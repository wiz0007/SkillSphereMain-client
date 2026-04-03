import { api } from "../api/api";

/* ================= GET MY COURSES ================= */
export const getMyCourses = async () => {
  try {
    const res = await api.get("/courses/my");
    return res.data;
  } catch (error: any) {
    console.error("getMyCourses error:", error.response?.data || error.message);
    throw error;
  }
};

/* ================= CREATE COURSE ================= */
export const createCourse = async (data: {
  title: string;
  category: string;
  level: string;
}) => {
  try {
    const res = await api.post("/courses", data);
    return res.data;
  } catch (error: any) {
    console.error("createCourse error:", error.response?.data || error.message);
    throw error;
  }
};

/* ================= UPDATE COURSE ================= */
export const updateCourse = async (
  id: string,
  data: {
    title?: string;
    category?: string;
    level?: string;
  }
) => {
  try {
    const res = await api.put(`/courses/${id}`, data);
    return res.data;
  } catch (error: any) {
    console.error("updateCourse error:", error.response?.data || error.message);
    throw error;
  }
};

/* ================= DELETE COURSE ================= */
export const deleteCourse = async (id: string) => {
  try {
    const res = await api.delete(`/courses/${id}`);
    return res.data;
  } catch (error: any) {
    console.error("deleteCourse error:", error.response?.data || error.message);
    throw error;
  }
};