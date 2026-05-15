import { api } from "../api/api";

export interface AdminUser {
  _id: string;
  username: string;
  email: string;
  fullName?: string;
  profilePhoto?: string;
  isTutor: boolean;
  isAdmin: boolean;
  profileCompleted: boolean;
  isVerified: boolean;
  skillCoinBalance: number;
  lockedSkillCoins: number;
  createdAt: string;
}

export interface AdminCourse {
  _id: string;
  title: string;
  type: "live" | "recorded";
  category: string;
  level: string;
  price: number;
  duration: string;
  isPublished: boolean;
  averageRating: number;
  totalRatings: number;
  createdAt: string;
  tutor: AdminUser;
}

export interface AdminSession {
  _id: string;
  title: string;
  status: string;
  price: number;
  skillCoinAmount: number;
  coinStatus: string;
  date: string;
  duration: number;
  student: AdminUser;
  tutor: AdminUser;
  course: null | {
    _id: string;
    title: string;
    type: "live" | "recorded";
  };
}

export interface AdminSupportConversation {
  _id: string;
  topic: string;
  subject: string;
  status: "open" | "waiting_on_support" | "waiting_on_user" | "resolved";
  lastMessageAt: string;
  createdAt: string;
  requester: AdminUser;
  assignedTo: AdminUser | null;
}

export interface AdminSupportMessage {
  _id: string;
  text: string;
  createdAt: string;
  readAt: string | null;
  senderRole: "user" | "support";
  sender: AdminUser;
  attachment: null | {
    url: string;
    name: string;
    mimeType: string;
  };
}

export interface AdminReview {
  _id: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt?: string;
  user: AdminUser;
  course: null | {
    _id: string;
    title: string;
    type: "live" | "recorded";
  };
}

export interface AdminVerificationRequest {
  _id: string;
  type: "identity" | "tutor";
  provider: "manual";
  status: "pending" | "approved" | "rejected" | "resubmission_required";
  documentType: string;
  note: string;
  reviewNote: string;
  createdAt: string;
  updatedAt: string;
  reviewedAt: string | null;
  user: AdminUser | null;
  reviewedBy: AdminUser | null;
  assets: {
    documentFrontUrl: string | null;
    documentBackUrl: string | null;
    selfieUrl: string | null;
    supportingDocumentUrl: string | null;
    supportingDocumentName: string | null;
    supportingDocumentMimeType: string | null;
  };
}

export interface AdminWalletTransaction {
  _id: string;
  type: string;
  amount: number;
  description: string;
  balanceAfter: number;
  lockedAfter: number;
  auditStatus: "pending" | "anchored" | "failed";
  chainTxHash: string | null;
  createdAt: string;
  user: AdminUser;
}

export interface AdminOverview {
  metrics: {
    totalUsers: number;
    totalTutors: number;
    totalCourses: number;
    liveCourses: number;
    recordedCourses: number;
    totalSessions: number;
    pendingSessions: number;
    totalSupportThreads: number;
    pendingSupportThreads: number;
    totalReviews: number;
    totalWalletTransactions: number;
  };
  recentUsers: AdminUser[];
  recentActivities: Array<{
    _id: string;
    type: string;
    action: string;
    message: string;
    createdAt: string;
  }>;
}

const handleError = (error: any, context: string): never => {
  const message =
    error.response?.data?.message ||
    error.message ||
    "Something went wrong";

  console.error(`${context} error:`, message);
  throw new Error(message);
};

export const getAdminOverview = async (): Promise<AdminOverview> => {
  try {
    const res = await api.get("/admin/overview");
    return res.data;
  } catch (error: any) {
    return handleError(error, "getAdminOverview");
  }
};

export const getAdminUsers = async (search = ""): Promise<AdminUser[]> => {
  try {
    const res = await api.get("/admin/users", {
      params: search ? { search } : undefined,
    });
    return res.data;
  } catch (error: any) {
    return handleError(error, "getAdminUsers");
  }
};

export const adjustAdminUserWallet = async (
  userId: string,
  payload: {
    action: "credit" | "debit";
    amount: number;
    note?: string;
  }
) => {
  try {
    const res = await api.patch(`/admin/users/${userId}/wallet`, payload);
    return res.data as {
      message: string;
      wallet: null | {
        skillCoinBalance: number;
        lockedSkillCoins: number;
        availableSkillCoins: number;
      };
      gift: null | {
        amount: number;
        note: string;
      };
    };
  } catch (error: any) {
    return handleError(error, "adjustAdminUserWallet");
  }
};

export const deleteAdminUser = async (userId: string) => {
  try {
    const res = await api.delete(`/admin/users/${userId}`);
    return res.data;
  } catch (error: any) {
    return handleError(error, "deleteAdminUser");
  }
};

export const getAdminCourses = async (): Promise<AdminCourse[]> => {
  try {
    const res = await api.get("/admin/courses");
    return res.data;
  } catch (error: any) {
    return handleError(error, "getAdminCourses");
  }
};

export const setAdminCoursePublishStatus = async (
  courseId: string,
  isPublished: boolean
) => {
  try {
    const res = await api.patch(`/admin/courses/${courseId}/publish`, {
      isPublished,
    });
    return res.data;
  } catch (error: any) {
    return handleError(error, "setAdminCoursePublishStatus");
  }
};

export const deleteAdminCourse = async (courseId: string) => {
  try {
    const res = await api.delete(`/admin/courses/${courseId}`);
    return res.data;
  } catch (error: any) {
    return handleError(error, "deleteAdminCourse");
  }
};

export const getAdminSessions = async (): Promise<AdminSession[]> => {
  try {
    const res = await api.get("/admin/sessions");
    return res.data;
  } catch (error: any) {
    return handleError(error, "getAdminSessions");
  }
};

export const getAdminSupportConversations = async (): Promise<
  AdminSupportConversation[]
> => {
  try {
    const res = await api.get("/admin/support");
    return res.data;
  } catch (error: any) {
    return handleError(error, "getAdminSupportConversations");
  }
};

export const updateAdminSupportStatus = async (
  conversationId: string,
  status: AdminSupportConversation["status"]
) => {
  try {
    const res = await api.patch(`/admin/support/${conversationId}/status`, {
      status,
    });
    return res.data;
  } catch (error: any) {
    return handleError(error, "updateAdminSupportStatus");
  }
};

export const getAdminSupportMessages = async (conversationId: string) => {
  try {
    const res = await api.get(`/admin/support/${conversationId}/messages`);
    return res.data as {
      conversation: AdminSupportConversation;
      messages: AdminSupportMessage[];
    };
  } catch (error: any) {
    return handleError(error, "getAdminSupportMessages");
  }
};

export const getAdminVerificationRequests = async (): Promise<
  AdminVerificationRequest[]
> => {
  try {
    const res = await api.get("/admin/verifications");
    return res.data;
  } catch (error: any) {
    return handleError(error, "getAdminVerificationRequests");
  }
};

export const reviewAdminVerificationRequest = async (
  requestId: string,
  payload: {
    status: "approved" | "rejected" | "resubmission_required";
    reviewNote?: string;
  }
) => {
  try {
    const res = await api.patch(`/admin/verifications/${requestId}/review`, payload);
    return res.data as {
      message: string;
      request: AdminVerificationRequest;
      summary: {
        emailVerified: boolean;
        identityVerificationStatus: string;
        tutorVerificationStatus: string;
        verifiedBadgeLevel: string;
      };
    };
  } catch (error: any) {
    return handleError(error, "reviewAdminVerificationRequest");
  }
};

export const sendAdminSupportMessage = async (
  conversationId: string,
  payload: {
    text?: string;
    attachment?: File | null;
  }
) => {
  try {
    const formData = new FormData();

    if (payload.text?.trim()) {
      formData.append("text", payload.text.trim());
    }

    if (payload.attachment) {
      formData.append("attachment", payload.attachment);
    }

    const res = await api.post(`/admin/support/${conversationId}/messages`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data as {
      conversation: AdminSupportConversation;
      message: AdminSupportMessage;
    };
  } catch (error: any) {
    return handleError(error, "sendAdminSupportMessage");
  }
};

export const getAdminReviews = async (): Promise<AdminReview[]> => {
  try {
    const res = await api.get("/admin/reviews");
    return res.data;
  } catch (error: any) {
    return handleError(error, "getAdminReviews");
  }
};

export const deleteAdminReview = async (reviewId: string) => {
  try {
    const res = await api.delete(`/admin/reviews/${reviewId}`);
    return res.data;
  } catch (error: any) {
    return handleError(error, "deleteAdminReview");
  }
};

export const getAdminWalletTransactions = async (): Promise<
  AdminWalletTransaction[]
> => {
  try {
    const res = await api.get("/admin/wallet");
    return res.data;
  } catch (error: any) {
    return handleError(error, "getAdminWalletTransactions");
  }
};
