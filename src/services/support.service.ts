import { api } from "../api/api";

export interface SupportParticipant {
  _id: string;
  username: string;
  email?: string;
  fullName?: string;
  profilePhoto?: string;
  isTutor?: boolean;
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
}) => {
  const { data } = await api.post("/support", payload);
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
  text: string
) => {
  const { data } = await api.post(
    `/support/${conversationId}/messages`,
    { text }
  );
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
