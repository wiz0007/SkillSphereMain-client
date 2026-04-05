import { api } from "../api/api";

/* ================= TYPES ================= */

export interface Course {
  _id: string;
  title: string;
  description?: string;
  category?: string;
  level?: "Beginner" | "Intermediate" | "Advanced";
  skills?: string[];
  price?: number;
  duration?: string;
  tutor?: string;
}

export interface CoursePayload {
  title: string;
  description?: string;
  category?: string;
  level?: string;
  skills?: string[];
  price?: number;
  duration?: string;
}

/* ================= ERROR HANDLER ================= */

const handleError = (error: any, context: string): never => {
  const message =
    error.response?.data?.message ||
    error.message ||
    "Something went wrong";

  console.error(`${context} error:`, message);
  throw new Error(message);
};

/* ================= PUBLIC COURSES ================= */

export const getAllCourses = async (): Promise<Course[]> => {
  try {
    const res = await api.get("/courses");
    return res.data;
  } catch (error: any) {
    return handleError(error, "getAllCourses");
  }
};

/* ================= TUTOR COURSES ================= */

export const getMyCourses = async (): Promise<Course[]> => {
  try {
    const res = await api.get("/courses/my");
    return res.data;
  } catch (error: any) {
    return handleError(error, "getMyCourses");
  }
};

/* ================= GET SINGLE COURSE ================= */

export const getCourseById = async (id: string): Promise<Course> => {
  try {
    const res = await api.get(`/courses/${id}`);
    return res.data;
  } catch (error: any) {
    return handleError(error, "getCourseById");
  }
};

/* ================= CREATE COURSE ================= */

export const createCourse = async (
  data: CoursePayload
): Promise<Course> => {
  try {
    const res = await api.post("/courses", data);
    return res.data;
  } catch (error: any) {
    return handleError(error, "createCourse");
  }
};

/* ================= UPDATE COURSE ================= */

export const updateCourse = async (
  id: string,
  data: CoursePayload
): Promise<Course> => {
  try {
    const res = await api.put(`/courses/${id}`, data);
    return res.data;
  } catch (error: any) {
    return handleError(error, "updateCourse");
  }
};

/* ================= DELETE COURSE ================= */

export const deleteCourse = async (
  id: string
): Promise<{ message: string }> => {
  try {
    const res = await api.delete(`/courses/${id}`);
    return res.data;
  } catch (error: any) {
    return handleError(error, "deleteCourse");
  }
};