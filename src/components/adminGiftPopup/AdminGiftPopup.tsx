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
  const [autoOpenedGiftId, setAutoOpenedGiftId] = useState<string | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [claimedAmount, setClaimedAmount] = useState<number | null>(null);
  const [giftFetchError, setGiftFetchError] = useState("");
  const [claimError, setClaimError] = useState("");

  const notificationGift = useMemo(() => {
    return notifications.find((notification: any) => {
      const kind = String(notification?.metadata?.kind || "");
      return kind === "admin_skillcoin_gift" && !notification?.isRead;
    }) as any;
  }, [notifications]);

  const displayGift = useMemo(() => {
    if (!pendingGift) {
      return null;
    }

    return {
      _id: pendingGift._id,
      amount: pendingGift.amount,
      note: pendingGift.note,
    };
  }, [pendingGift]);

  const relatedNotification = useMemo(() => {
    const targetGiftId =
      displayGift?._id || String(notificationGift?.metadata?.giftId || "");
    if (!targetGiftId) return null;

    return notifications.find((notification: any) => {
      const kind = String(notification?.metadata?.kind || "");
      const notificationGiftId = String(notification?.metadata?.giftId || "");
      return (
        kind === "admin_skillcoin_gift" &&
        notificationGiftId === targetGiftId
      );
    }) as any;
  }, [displayGift?._id, notificationGift, notifications]);

  useEffect(() => {
    if (!user?._id) {
      setPendingGift(null);
      setOpened(false);
      setAutoOpenedGiftId(null);
      setClaimedAmount(null);
      setGiftFetchError("");
      return;
    }

    void getPendingAdminGift()
      .then(async (response) => {
      setGiftFetchError("");
      setClaimError("");
      setPendingGift(response.gift);

        if (response.gift) {
          const nextGiftId = response.gift._id;

          if (autoOpenedGiftId !== nextGiftId) {
            setOpened(true);
            setAutoOpenedGiftId(nextGiftId);
          }
        } else {
          setOpened(false);
          setAutoOpenedGiftId(null);

          if (notificationGift?._id) {
            try {
              await markAsRead(notificationGift._id);
              markLocalAsRead(notificationGift._id);
              await refresh();
            } catch (error) {
              console.error("Failed to clear stale admin gift notification:", error);
            }
          }
        }
      })
      .catch((error) => {
        console.error("Failed to fetch pending admin gift:", error);
        setGiftFetchError(
          "The gift server could not be reached. Please refresh and try again."
        );
        setPendingGift(null);
        setOpened(false);
        setAutoOpenedGiftId(null);
      });
  }, [autoOpenedGiftId, markLocalAsRead, notificationGift, refresh, user?._id]);

  const handleClaim = async () => {
    if (!displayGift) return;

    try {
      setClaiming(true);
      setClaimError("");
      const result = await claimAdminGift(displayGift._id);
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
      setAutoOpenedGiftId(null);
    } catch (error: any) {
      setClaimError(
        error?.response?.data?.message ||
          error?.message ||
          "The gift could not be claimed right now"
      );
    } finally {
      setClaiming(false);
    }
  };

  if (!user || (!displayGift && !claimedAmount)) {
    return null;
  }

  return (
    <>
      {displayGift && !opened ? (
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
                : `${displayGift?.amount || 0} SkillCoin waiting`}
            </h2>
            <p>
              {claimedAmount
                ? "The gift has been added to your wallet."
                : "Admin sent you a gift. Open it to add the SkillCoin to your wallet."}
            </p>

            {giftFetchError ? (
              <div className={styles.warningBox}>
                <span>Gift sync notice</span>
                <strong>{giftFetchError}</strong>
              </div>
            ) : null}

            {claimError ? (
              <div className={styles.warningBox}>
                <span>Claim issue</span>
                <strong>{claimError}</strong>
              </div>
            ) : null}

            {displayGift?.note ? (
              <div className={styles.noteBox}>
                <span>Admin note</span>
                <strong>{displayGift.note}</strong>
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
