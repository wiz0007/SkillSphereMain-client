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

  const notificationGift = useMemo(() => {
    return notifications.find((notification: any) => {
      const kind = String(notification?.metadata?.kind || "");
      return kind === "admin_skillcoin_gift" && !notification?.isRead;
    }) as any;
  }, [notifications]);

  const displayGift = useMemo(() => {
    if (pendingGift) {
      return {
        _id: pendingGift._id,
        amount: pendingGift.amount,
        note: pendingGift.note,
        isClaimable: true,
      };
    }

    if (notificationGift) {
      return {
        _id: String(notificationGift.metadata?.giftId || notificationGift._id),
        amount: Number(notificationGift.metadata?.amount || 0),
        note: String(notificationGift.metadata?.note || ""),
        isClaimable: false,
      };
    }

    return null;
  }, [notificationGift, pendingGift]);

  const relatedNotification = useMemo(() => {
    if (!displayGift?._id) return null;

    return notifications.find((notification: any) => {
      const kind = String(notification?.metadata?.kind || "");
      const giftId = String(notification?.metadata?.giftId || "");
      return kind === "admin_skillcoin_gift" && giftId === displayGift._id;
    }) as any;
  }, [displayGift?._id, notifications]);

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
      .then((response) => {
        setGiftFetchError("");
        setPendingGift(response.gift);

        const nextGiftId =
          response.gift?._id ||
          String(notificationGift?.metadata?.giftId || notificationGift?._id || "");

        if (nextGiftId && autoOpenedGiftId !== nextGiftId) {
          setOpened(true);
          setAutoOpenedGiftId(nextGiftId);
        }

        if (!response.gift && !notificationGift) {
          setOpened(false);
          setAutoOpenedGiftId(null);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch pending admin gift:", error);
        setGiftFetchError(
          "Live gift claim could not be confirmed. Showing your gift notification instead."
        );

        if (notificationGift) {
          const fallbackGiftId = String(
            notificationGift?.metadata?.giftId || notificationGift?._id || ""
          );

          if (fallbackGiftId && autoOpenedGiftId !== fallbackGiftId) {
            setOpened(true);
            setAutoOpenedGiftId(fallbackGiftId);
          }
        }
      });
  }, [autoOpenedGiftId, notificationGift, notifications.length, user?._id]);

  const handleClaim = async () => {
    if (!displayGift) return;

    try {
      setClaiming(true);

      if (displayGift.isClaimable) {
        const result = await claimAdminGift(displayGift._id);
        setClaimedAmount(result.gift.amount);
        await refreshUser();
      } else {
        setClaimedAmount(displayGift.amount);
      }

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
      alert(
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
                : displayGift?.isClaimable
                  ? "Admin sent you a gift. Open it to add the SkillCoin to your wallet."
                  : "Admin sent you a gift notification. This fallback view appears when the live claim state could not be confirmed."}
            </p>

            {giftFetchError ? (
              <div className={styles.warningBox}>
                <span>Gift sync notice</span>
                <strong>{giftFetchError}</strong>
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
                {claiming
                  ? "Receiving..."
                  : displayGift?.isClaimable
                    ? "Receive gift"
                    : "Open gift"}
              </button>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
};

export default AdminGiftPopup;
