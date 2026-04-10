import { useNavigate } from "react-router-dom";
import { markAsRead } from "../../services/activity.service";
import styles from "./NotificationLayout.module.scss";
import { useNotifications } from "../../context/NotificationContext";

const NotificationsLayout = () => {
  const { notifications, markLocalAsRead } = useNotifications();
  const navigate = useNavigate();

  const handleClick = async (n: any) => {
    if (!n?._id) return;

    try {
      await markAsRead(n._id);
      markLocalAsRead(n._id); // 🔥 instant UI update
    } catch (err) {
      console.error(err);
    }

    if (n.entityId) {
      navigate(`/sessions?sessionId=${n.entityId}`);
    } else {
      navigate("/sessions");
    }
  };

  return (
    <div className={styles.container}>
      <h1>🔔 Notifications</h1>

      {notifications.length === 0 ? (
        <p>No notifications</p>
      ) : (
        notifications.map((n) => (
          <div
            key={n._id}
            onClick={() => handleClick(n)}
            className={`${styles.card} ${
              !n.isRead ? styles.unread : ""
            }`}
          >
            <p>{n.message || n.action}</p>
            <span>
              {new Date(n.createdAt).toLocaleString()}
            </span>
          </div>
        ))
      )}
    </div>
  );
};

export default NotificationsLayout;