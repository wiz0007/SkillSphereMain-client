import { api } from "../api/api";

export const getNotifications = async () => {
  const { data } = await api.get("/notifications");
  return data;
};

export const getUnreadCount = async () => {
  const { data } = await api.get("/notifications/unread-count");
  return data.count;
};

export const markAsRead = async (id: string) => {
  await api.patch(`/notifications/${id}/read`);
};