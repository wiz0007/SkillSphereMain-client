import {
  Bell,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Inbox,
} from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../context/NotificationContext";
import { markAsRead } from "../../services/activity.service";
import styles from "./NotificationLayout.module.scss";

const NotificationsLayout = () => {
  const { notifications, markLocalAsRead, refresh } = useNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    void refresh();
  }, []);

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  const latestActivity = notifications[0]?.createdAt
    ? new Date(notifications[0].createdAt).toLocaleString([], {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "No recent activity";

  const formatTimestamp = (value?: string) =>
    value
      ? new Date(value).toLocaleString([], {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "Just now";

  const handleClick = async (
    notification: (typeof notifications)[number]
  ) => {
    if (!notification?._id) return;

    try {
      await markAsRead(notification._id);
      markLocalAsRead(notification._id);
    } catch (err) {
      console.error(err);
    }

    if (notification.entityId) {
      navigate(`/sessions?sessionId=${notification.entityId}`);
    } else {
      navigate("/sessions");
    }
  };

  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <div>
          <span className={styles.kicker}>Notifications</span>
          <h1>Keep tabs on every session update</h1>
          <p>
            Track requests, status changes, and follow-up activity
            from one clean inbox.
          </p>
        </div>

        <div className={styles.snapshot}>
          <span className={styles.snapshotLabel}>Inbox status</span>
          <strong>
            {unreadCount
              ? `${unreadCount} unread notifications`
              : "You're all caught up"}
          </strong>
          <span className={styles.snapshotHint}>
            Latest activity: {latestActivity}
          </span>
        </div>
      </div>

      <div className={styles.statRow}>
        <div className={styles.statCard}>
          <span>Total activity</span>
          <strong>{notifications.length}</strong>
        </div>
        <div className={styles.statCard}>
          <span>Needs attention</span>
          <strong>{unreadCount}</strong>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <Inbox size={26} />
          </div>
          <strong>No notifications yet</strong>
          <span>
            New session activity and status changes will show up
            here automatically.
          </span>
        </div>
      ) : (
        <div className={styles.list}>
          {notifications.map((notification) => (
            <button
              key={notification._id}
              type="button"
              className={`${styles.card} ${
                !notification.isRead ? styles.unread : ""
              }`}
              onClick={() => void handleClick(notification)}
            >
              <div className={styles.iconWrap}>
                {!notification.isRead ? (
                  <Bell size={18} />
                ) : (
                  <CheckCircle2 size={18} />
                )}
              </div>

              <div className={styles.content}>
                <div className={styles.cardTop}>
                  <strong>
                    {notification.message ||
                      notification.action ||
                      "New notification"}
                  </strong>
                  {!notification.isRead ? (
                    <span className={styles.status}>Unread</span>
                  ) : null}
                </div>

                <p>
                  {notification.entityId
                    ? "Open the related session to review details and take action."
                    : "Open your sessions feed to see the latest context."}
                </p>

                <span className={styles.timestamp}>
                  <Clock3 size={14} />
                  {formatTimestamp(notification.createdAt)}
                </span>
              </div>

              <ChevronRight size={18} className={styles.chevron} />
            </button>
          ))}
        </div>
      )}
    </section>
  );
};

export default NotificationsLayout;
