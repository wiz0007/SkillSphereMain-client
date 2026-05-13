import { useEffect, useMemo, useState } from "react";
import { claimAdminGift, getPendingAdminGift } from "../../services/auth.service";
import { markAsRead } from "../../services/activity.service";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import styles from "./AdminGiftPopup.module.scss";

type PendingGift = {
  _id: string;
  amount: number;
  note: string;
  createdAt: string;
};

const AdminGiftPopup = () => {
  const { user, refreshUser } = useAuth();
  const { notifications, markLocalAsRead, refresh } = useNotifications();
  const [pendingGift, setPendingGift] = useState<PendingGift | null>(null);
  const [opened, setOpened] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [claimedAmount, setClaimedAmount] = useState<number | null>(null);

  const relatedNotification = useMemo(() => {
    if (!pendingGift?._id) return null;

    return notifications.find((notification: any) => {
      const kind = String(notification?.metadata?.kind || "");
      const giftId = String(notification?.metadata?.giftId || "");
      return (
        kind === "admin_skillcoin_gift" &&
        giftId === pendingGift._id
      );
    }) as any;
  }, [notifications, pendingGift?._id]);

  useEffect(() => {
    if (!user?._id) {
      setPendingGift(null);
      setOpened(false);
      setClaimedAmount(null);
      return;
    }

    void getPendingAdminGift()
      .then((response) => {
        setPendingGift(response.gift);
        if (!response.gift) {
          setOpened(false);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch pending admin gift:", error);
      });
  }, [user?._id, notifications.length]);

  const handleClaim = async () => {
    if (!pendingGift) return;

    try {
      setClaiming(true);
      const result = await claimAdminGift(pendingGift._id);
      setClaimedAmount(result.gift.amount);
      await refreshUser();

      if (relatedNotification?._id) {
        try {
          await markAsRead(relatedNotification._id);
          markLocalAsRead(relatedNotification._id);
        } catch (error) {
          console.error("Failed to mark gift notification as read:", error);
        }
      }

      await refresh();
      setPendingGift(null);
    } catch (error: any) {
      alert(
        error?.response?.data?.message ||
          error?.message ||
          "The gift could not be claimed right now"
      );
    } finally {
      setClaiming(false);
    }
  };

  if (!user || (!pendingGift && !claimedAmount)) {
    return null;
  }

  return (
    <>
      {pendingGift ? (
        <button
          type="button"
          className={styles.floatingGift}
          onClick={() => setOpened(true)}
        >
          <span className={styles.icon}>🎁</span>
          <span>
            <strong>Gift from admin</strong>
            <small>Tap to receive</small>
          </span>
        </button>
      ) : null}

      {opened ? (
        <div className={styles.overlay} role="dialog" aria-modal="true">
          <div className={styles.card}>
            <span className={styles.badge}>Admin gift</span>
            <div className={styles.heroIcon}>🎁</div>
            <h2>
              {claimedAmount
                ? `${claimedAmount} SkillCoin received`
                : `${pendingGift?.amount || 0} SkillCoin waiting`}
            </h2>
            <p>
              {claimedAmount
                ? "The gift has been added to your wallet."
                : "Admin sent you a gift. Open it to add the SkillCoin to your wallet."}
            </p>

            {pendingGift?.note ? (
              <div className={styles.noteBox}>
                <span>Admin note</span>
                <strong>{pendingGift.note}</strong>
              </div>
            ) : null}

            {claimedAmount ? (
              <button
                type="button"
                className={styles.primaryAction}
                onClick={() => {
                  setOpened(false);
                  setClaimedAmount(null);
                }}
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                className={styles.primaryAction}
                onClick={() => void handleClaim()}
                disabled={claiming}
              >
                {claiming ? "Receiving..." : "Receive gift"}
              </button>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
};

export default AdminGiftPopup;
