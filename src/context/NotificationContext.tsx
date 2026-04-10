import { createContext, useContext, useEffect, useState } from "react";
import {
  getNotifications,
  getUnreadCount,
} from "../services/activity.service";
import { socket } from "../utils/socket";
import { useAuth } from "./AuthContext";

interface Notification {
  _id: string;
  message?: string;
  action?: string;
  createdAt: string;
  entityId?: string;
  isRead?: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  count: number;
  refresh: () => Promise<void>;
  markLocalAsRead: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const NotificationProvider = ({ children }: any) => {
  const { user } = useAuth();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [count, setCount] = useState(0);

  // ✅ Fetch both list + count
  const fetchAll = async () => {
    try {
      const [n, c] = await Promise.all([
        getNotifications(),
        getUnreadCount(),
      ]);

      setNotifications(n);
      setCount(c);
    } catch (err) {
      console.error("Notification fetch failed:", err);
    }
  };

  useEffect(() => {
    if (!user?._id) return;

    fetchAll();

    // ✅ socket listener (SINGLE SOURCE)
    const handler = (data: any) => {
      const newNotification: Notification = {
        _id: Date.now().toString(),
        message: data.message || data.action,
        action: data.action,
        createdAt: new Date().toISOString(),
        entityId: data.entityId,
        isRead: false,
      };

      setNotifications((prev) => [newNotification, ...prev]);
      setCount((prev) => prev + 1);
    };

    socket.on("notification", handler);

    return () => {
      socket.off("notification", handler);
    };
  }, [user]);

  // ✅ Optimistic update when marking read
  const markLocalAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n._id === id ? { ...n, isRead: true } : n
      )
    );

    setCount((prev) => Math.max(prev - 1, 0));
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        count,
        refresh: fetchAll,
        markLocalAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// ✅ Hook
export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotifications must be used inside NotificationProvider");
  }
  return ctx;
};