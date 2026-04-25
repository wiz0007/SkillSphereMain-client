import { api } from "../api/api";

export interface ChatParticipant {
  _id: string;
  username: string;
  fullName?: string;
  profilePhoto?: string;
  isTutor?: boolean;
}

export interface ChatMessage {
  _id: string;
  text: string;
  createdAt: string;
  readAt?: string | null;
  isMine: boolean;
  sender: ChatParticipant;
  recipient: ChatParticipant;
}

export interface ConversationSummary {
  participant: ChatParticipant;
  unreadCount: number;
  lastMessage: ChatMessage;
}

export const getConversations = async () => {
  const { data } = await api.get("/messages");
  return data as ConversationSummary[];
};

export const getChatContacts = async () => {
  const { data } = await api.get("/messages/contacts");
  return data as ChatParticipant[];
};

export const getConversationMessages = async (userId: string) => {
  const { data } = await api.get(`/messages/${userId}`);
  return data as ChatMessage[];
};

export const sendChatMessage = async (
  userId: string,
  text: string
) => {
  const { data } = await api.post(`/messages/${userId}`, { text });
  return data as ChatMessage;
};
