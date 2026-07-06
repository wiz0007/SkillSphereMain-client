import { api } from "../api/api";

export interface Tutor {
  _id: string;
  username: string;
  fullName?: string;
  profilePhoto?: string | null;
  isTutor?: boolean;
  isAdmin?: boolean;
  verifiedBadgeLevel?: "none" | "basic" | "identity" | "tutor";
  tutorVerificationStatus?: "not_started" | "pending" | "approved" | "rejected" | "resubmission_required";
}

export interface ReviewUser {
  _id: string;
  name?: string;
  username?: string;
  avatar?: string;
  profilePhoto?: string;
}

export interface Review {
  _id?: string;
  user: string | ReviewUser;
  comment: string;
  createdAt: string;
  updatedAt?: string;
}

export interface RatingBreakdownItem {
  star: number;
  count: number;
}

export interface RecordedAccessSummary {
  hasAccess: boolean;
  hasPendingRequest: boolean;
  status: "none" | "pending" | "approved" | "rejected";
  requestId: string | null;
  canPurchase: boolean;
  contentDriveLink: string;
}

export interface RecordedAccessRequest {
  _id: string;
  student: Tutor;
  status: "pending" | "approved" | "rejected";
  coinStatus: "locked" | "settled" | "released";
  skillCoinAmount: number;
  price: number;
  createdAt: string;
  approvedAt?: string | null;
  rejectedAt?: string | null;
}

export interface TuitionEnrollmentSummary {
  hasEnrollment: boolean;
  hasPendingRequest: boolean;
  status: "none" | "pending" | "approved" | "paused" | "rejected" | "cancelled";
  requestId: string | null;
  canRequest: boolean;
  nextSessionDate: string | null;
  canPause: boolean;
  canResume: boolean;
  canCancel: boolean;
}

export interface TuitionEnrollmentRequest {
  _id: string;
  student: Tutor;
  status: "pending" | "approved" | "paused" | "rejected" | "cancelled";
  coinStatus: "locked" | "settled" | "released";
  skillCoinAmount: number;
  price: number;
  createdAt: string;
  approvedAt?: string | null;
  pausedAt?: string | null;
  rejectedAt?: string | null;
  cancelledAt?: string | null;
  generatedUntil?: string | null;
  scheduleSnapshot: TuitionSchedule & {
    duration: string;
    durationMinutes: number;
  };
}

export interface TuitionEnrollmentListItem {
  _id: string;
  role: "student" | "tutor";
  status: "pending" | "approved" | "paused" | "rejected" | "cancelled";
  coinStatus: "locked" | "settled" | "released";
  skillCoinAmount: number;
  price: number;
  createdAt?: string | null;
  approvedAt?: string | null;
  pausedAt?: string | null;
  rejectedAt?: string | null;
  cancelledAt?: string | null;
  generatedUntil?: string | null;
  nextSessionDate?: string | null;
  student: Tutor;
  tutor: Tutor;
  course: {
    _id: string;
    title: string;
    category?: string;
    duration?: string;
    price?: number;
  };
  scheduleSnapshot: TuitionEnrollmentRequest["scheduleSnapshot"];
}

export interface TuitionSchedule {
  days: string[];
  weeks: number[];
  startTime: string;
}

export interface Course {
  _id: string;
  slug?: string;
  seoStatus?: "draft" | "pending-review" | "public-noindex" | "public-indexable" | "suspended" | "archived";
  title: string;
  description?: string;
  type: "live" | "recorded" | "tuition";
  category?: string;
  level?: string;
  skills?: string[];
  price?: number;
  duration?: string;
  contentDriveLink?: string;
  demoVideoUrl?: string;
  tuitionSchedule?: TuitionSchedule;
  isPublished?: boolean;
  tutor: Tutor;
  averageRating?: number;
  totalRatings?: number;
  ratingBreakdown?: RatingBreakdownItem[];
  reviews?: Review[];
  reviewEligibility?: {
    canReview: boolean;
    hasEnrolled: boolean;
    hasReviewed: boolean;
  };
  recordedAccess?: RecordedAccessSummary | null;
  recordedRequests?: RecordedAccessRequest[];
  tuitionEnrollment?: TuitionEnrollmentSummary | null;
  tuitionRequests?: TuitionEnrollmentRequest[];
}

export interface CoursePayload {
  title: string;
  description?: string;
  type: "live" | "recorded" | "tuition";
  category?: string;
  level?: string;
  skills?: string[];
  price?: number;
  duration?: string;
  contentDriveLink?: string;
  demoVideoUrl?: string;
  tuitionSchedule?: TuitionSchedule;
  isPublished?: boolean;
}

const handleError = (error: any, context: string): never => {
  const message =
    error.response?.data?.message ||
    error.message ||
    "Something went wrong";

  console.error(`${context} error:`, message);
  throw new Error(message);
};

export const getAllCourses = async (): Promise<Course[]> => {
  try {
    const res = await api.get("/courses");
    return res.data;
  } catch (error: any) {
    return handleError(error, "getAllCourses");
  }
};

export const getMyCourses = async (): Promise<Course[]> => {
  try {
    const res = await api.get("/courses/my");
    return res.data;
  } catch (error: any) {
    return handleError(error, "getMyCourses");
  }
};

export const getCourseById = async (id: string): Promise<Course> => {
  try {
    const res = await api.get(`/courses/${id}`);
    return res.data;
  } catch (error: any) {
    return handleError(error, "getCourseById");
  }
};

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

export const setCoursePublishStatus = async (
  id: string,
  isPublished: boolean
): Promise<Course> => {
  try {
    const res = await api.patch(`/courses/${id}/publish`, {
      isPublished,
    });
    return res.data;
  } catch (error: any) {
    return handleError(error, "setCoursePublishStatus");
  }
};

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

export const requestRecordedCourseAccess = async (courseId: string) => {
  try {
    const res = await api.post(`/courses/${courseId}/recorded-access`);
    return res.data;
  } catch (error: any) {
    return handleError(error, "requestRecordedCourseAccess");
  }
};

export const approveRecordedCourseAccess = async (accessId: string) => {
  try {
    const res = await api.patch(`/courses/recorded-access/${accessId}/approve`);
    return res.data;
  } catch (error: any) {
    return handleError(error, "approveRecordedCourseAccess");
  }
};

export const requestTuitionEnrollment = async (courseId: string) => {
  try {
    const res = await api.post(`/courses/${courseId}/tuition-enrollments`);
    return res.data;
  } catch (error: any) {
    return handleError(error, "requestTuitionEnrollment");
  }
};

export const approveTuitionEnrollment = async (enrollmentId: string) => {
  try {
    const res = await api.patch(
      `/courses/tuition-enrollments/${enrollmentId}/approve`
    );
    return res.data;
  } catch (error: any) {
    return handleError(error, "approveTuitionEnrollment");
  }
};

export const rejectTuitionEnrollment = async (enrollmentId: string) => {
  try {
    const res = await api.patch(
      `/courses/tuition-enrollments/${enrollmentId}/reject`
    );
    return res.data;
  } catch (error: any) {
    return handleError(error, "rejectTuitionEnrollment");
  }
};

export const pauseTuitionEnrollment = async (enrollmentId: string) => {
  try {
    const res = await api.patch(
      `/courses/tuition-enrollments/${enrollmentId}/pause`
    );
    return res.data;
  } catch (error: any) {
    return handleError(error, "pauseTuitionEnrollment");
  }
};

export const resumeTuitionEnrollment = async (enrollmentId: string) => {
  try {
    const res = await api.patch(
      `/courses/tuition-enrollments/${enrollmentId}/resume`
    );
    return res.data;
  } catch (error: any) {
    return handleError(error, "resumeTuitionEnrollment");
  }
};

export const cancelTuitionEnrollment = async (enrollmentId: string) => {
  try {
    const res = await api.patch(
      `/courses/tuition-enrollments/${enrollmentId}/cancel`
    );
    return res.data;
  } catch (error: any) {
    return handleError(error, "cancelTuitionEnrollment");
  }
};

export const getMyTuitionEnrollments = async (): Promise<
  TuitionEnrollmentListItem[]
> => {
  try {
    const res = await api.get("/courses/tuition-enrollments/mine");
    return res.data;
  } catch (error: any) {
    return handleError(error, "getMyTuitionEnrollments");
  }
};

export const rejectRecordedCourseAccess = async (accessId: string) => {
  try {
    const res = await api.patch(`/courses/recorded-access/${accessId}/reject`);
    return res.data;
  } catch (error: any) {
    return handleError(error, "rejectRecordedCourseAccess");
  }
};

export const rateCourse = async (id: string, value: number) => {
  const res = await api.post(`/courses/${id}/rate`, { value });
  return res.data;
};

export const addReview = async (
  id: string,
  comment: string
) => {
  const res = await api.post(`/courses/${id}/review`, {
    comment,
  });
  return res.data;
};

export const getSavedCourses = async () => {
  const res = await api.get("/courses/saved");
  return res.data;
};

export const saveCourse = async (courseId: string) => {
  const res = await api.post(`/courses/${courseId}/save`);
  return res.data;
};

export const unsaveCourse = async (courseId: string) => {
  const res = await api.delete(`/courses/${courseId}/save`);
  return res.data;
};
