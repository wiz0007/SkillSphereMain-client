import { api } from "../api/api";

export interface SupportParticipant {
  _id: string;
  username: string;
  email?: string;
  fullName?: string;
  profilePhoto?: string;
  isAdmin?: boolean;
  isTutor?: boolean;
  identityVerificationStatus?:
    | "not_started"
    | "pending"
    | "approved"
    | "rejected"
    | "resubmission_required";
  tutorVerificationStatus?:
    | "not_started"
    | "pending"
    | "approved"
    | "rejected"
    | "resubmission_required";
  verifiedBadgeLevel?: "none" | "basic" | "identity" | "tutor";
}

export interface SupportConversation {
  _id: string;
  topic: string;
  subject: string;
  status: "open" | "waiting_on_support" | "waiting_on_user" | "resolved";
  lastMessageAt: string;
  createdAt: string;
  unreadCount: number;
  requester: SupportParticipant;
  assignedTo: SupportParticipant | null;
}

export interface SupportMessage {
  _id: string;
  text: string;
  createdAt: string;
  readAt?: string | null;
  senderRole: "user" | "support";
  sender: SupportParticipant;
  attachment?: {
    url: string;
    name: string;
    mimeType: string;
  } | null;
  isMine: boolean;
}

export interface SupportBootstrap {
  isExecutive: boolean;
  topics: string[];
  conversations: SupportConversation[];
}

export const getSupportBootstrap = async () => {
  const { data } = await api.get("/support");
  return data as SupportBootstrap;
};

export const createSupportConversation = async (payload: {
  topic: string;
  subject: string;
  text: string;
  attachment?: File | null;
}) => {
  const formData = new FormData();
  formData.append("topic", payload.topic);
  formData.append("subject", payload.subject);
  formData.append("text", payload.text);
  if (payload.attachment) {
    formData.append("attachment", payload.attachment);
  }

  const { data } = await api.post("/support", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data as {
    conversation: SupportConversation;
    message: SupportMessage;
  };
};

export const getSupportMessages = async (conversationId: string) => {
  const { data } = await api.get(
    `/support/${conversationId}/messages`
  );
  return data as SupportMessage[];
};

export const sendSupportMessage = async (
  conversationId: string,
  payload: {
    text: string;
    attachment?: File | null;
  }
) => {
  const formData = new FormData();
  formData.append("text", payload.text);
  if (payload.attachment) {
    formData.append("attachment", payload.attachment);
  }

  const { data } = await api.post(`/support/${conversationId}/messages`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data as {
    conversation: SupportConversation;
    message: SupportMessage;
  };
};

export const updateSupportConversationStatus = async (
  conversationId: string,
  status: SupportConversation["status"]
) => {
  const { data } = await api.patch(
    `/support/${conversationId}/status`,
    { status }
  );
  return data as Omit<SupportConversation, "unreadCount">;
};
