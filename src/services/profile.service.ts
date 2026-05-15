import { api } from "../api/api";

export interface ProfileSettings {
  theme?: "dark" | "light";
  notifications?: {
    sessionUpdates?: boolean;
    courseRecommendations?: boolean;
    marketingEmails?: boolean;
  };
}

export type VerificationStatus =
  | "not_started"
  | "pending"
  | "approved"
  | "rejected"
  | "resubmission_required";

export interface VerificationRequestRecord {
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
  assets: {
    documentFrontUrl: string | null;
    documentBackUrl: string | null;
    selfieUrl: string | null;
    supportingDocumentUrl: string | null;
    supportingDocumentName: string | null;
    supportingDocumentMimeType: string | null;
  };
}

export const createProfile = async (data: any) => {
  const res = await api.post("/profile", data);
  return res.data;
};

export const getMyProfile = async () => {
  const res = await api.get("/profile/me");
  return res.data;
};

export const updateProfile = async (data: any) => {
  const res = await api.put("/profile", data);
  return res.data;
};

export const becomeTutor = async (data: any) => {
  const res = await api.post("/profile/become-tutor", data);
  return res.data;
};

export const getPublicProfile = async (userId: string) => {
  const res = await api.get(`/profile/public/${userId}`);
  return res.data;
};

export const getVerificationSummary = async () => {
  const res = await api.get("/profile/verification");
  return res.data as {
    summary: {
      emailVerified: boolean;
      identityVerificationStatus: VerificationStatus;
      tutorVerificationStatus: VerificationStatus;
      verifiedBadgeLevel: "none" | "basic" | "identity" | "tutor";
    };
    requests: VerificationRequestRecord[];
  };
};

export const submitIdentityVerification = async (payload: {
  documentType: string;
  note?: string;
  documentFront: File;
  documentBack?: File | null;
  selfie: File;
}) => {
  const formData = new FormData();
  formData.append("documentType", payload.documentType);
  if (payload.note?.trim()) {
    formData.append("note", payload.note.trim());
  }
  formData.append("documentFront", payload.documentFront);
  if (payload.documentBack) {
    formData.append("documentBack", payload.documentBack);
  }
  formData.append("selfie", payload.selfie);

  const res = await api.post("/profile/verification/identity", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};

export const submitTutorVerification = async (payload: {
  note?: string;
  supportingDocument: File;
}) => {
  const formData = new FormData();
  if (payload.note?.trim()) {
    formData.append("note", payload.note.trim());
  }
  formData.append("supportingDocument", payload.supportingDocument);

  const res = await api.post("/profile/verification/tutor", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};
