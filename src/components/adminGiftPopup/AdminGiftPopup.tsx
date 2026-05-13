import { useEffect, useMemo, useState } from "react";
import { markAsRead } from "../../services/activity.service";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import styles from "./AdminGiftPopup.module.scss";

type GiftNotification = {
  _id: string;
  type?: string;
  action?: string;
  message?: string;
  createdAt: string;
  isRead?: boolean;
  metadata?: Record<string, unknown>;
};

const AdminGiftPopup = () => {
  const { user } = useAuth();
  const { notifications, markLocalAsRead } = useNotifications();
  const [openedGiftId, setOpenedGiftId] = useState<string | null>(null);
  const [dismissedGiftIds, setDismissedGiftIds] = useState<string[]>([]);

  const pendingGift = useMemo(() => {
    return (notifications as GiftNotification[]).find((notification) => {
      const kind = String(notification.metadata?.kind || "");
      return (
        !notification.isRead &&
        !dismissedGiftIds.includes(notification._id) &&
        notification.type === "SYSTEM" &&
        notification.action === "ADMIN_GIFT" &&
        kind === "admin_skillcoin_gift"
      );
    });
  }, [dismissedGiftIds, notifications]);

  useEffect(() => {
    if (!user?._id) {
      setOpenedGiftId(null);
      setDismissedGiftIds([]);
    }
  }, [user?._id]);

  const openGift = async () => {
    if (!pendingGift) return;

    setOpenedGiftId(pendingGift._id);

    try {
      await markAsRead(pendingGift._id);
      markLocalAsRead(pendingGift._id);
    } catch (error) {
      console.error("Failed to mark admin gift as read:", error);
    }
  };

  const activeGift =
    (notifications as GiftNotification[]).find(
      (notification) => notification._id === openedGiftId
    ) || pendingGift;

  if (!user || !pendingGift) {
    return null;
  }

  const amount = Number(activeGift?.metadata?.amount || 0);
  const note = String(activeGift?.metadata?.note || "").trim();

  return (
    <>
      <button
        type="button"
        className={styles.floatingGift}
        onClick={() => void openGift()}
      >
        <span className={styles.icon}>🎁</span>
        <span>
          <strong>Gift from admin</strong>
          <small>Tap to open</small>
        </span>
      </button>

      {openedGiftId ? (
        <div className={styles.overlay} role="dialog" aria-modal="true">
          <div className={styles.card}>
            <span className={styles.badge}>Admin gift</span>
            <div className={styles.heroIcon}>🎁</div>
            <h2>{amount} SkillCoin added</h2>
            <p>{activeGift?.message || "You received a SkillCoin gift from admin."}</p>

            {note ? (
              <div className={styles.noteBox}>
                <span>Admin note</span>
                <strong>{note}</strong>
              </div>
            ) : null}

            <button
              type="button"
              className={styles.primaryAction}
              onClick={() => {
                setOpenedGiftId(null);
                setDismissedGiftIds((previous) =>
                  activeGift ? [...previous, activeGift._id] : previous
                );
              }}
            >
              Opened
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default AdminGiftPopup;
