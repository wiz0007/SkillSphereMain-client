import styles from "../dashboard/Dashboard.module.scss";

interface ActivityItem {
  _id: string;
  action: string;
  type: string;
  message?: string;
  isRead?: boolean;
  createdAt: string;
}

const getActivityTone = (action: string) => {
  switch (action) {
    case "REQUESTED":
      return styles.activityPending;
    case "ACCEPTED":
      return styles.activitySuccess;
    case "COMPLETED":
      return styles.activityAccent;
    case "CANCELLED":
      return styles.activityDanger;
    default:
      return "";
  }
};

const getRelativeTime = (value: string) => {
  const date = new Date(value).getTime();
  const diffMinutes = Math.round((Date.now() - date) / 60000);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d ago`;
};

const ActivityFeed = ({ activity }: { activity: ActivityItem[] }) => {
  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <div>
          <h2>Recent Activity</h2>
          <p>Your newest session and platform updates.</p>
        </div>
        <span className={styles.panelBadge}>{activity.length}</span>
      </div>

      {activity.length === 0 ? (
        <div className={styles.emptyState}>
          <strong>No recent activity</strong>
          <span>When sessions move forward, you’ll see the timeline here.</span>
        </div>
      ) : (
        <div className={styles.activityList}>
          {activity.slice(0, 6).map((item) => (
            <div key={item._id} className={styles.activityItem}>
              <div
                className={`${styles.activityIndicator} ${getActivityTone(
                  item.action
                )}`}
              />
              <div className={styles.activityContent}>
                <strong>{item.message || "Activity updated"}</strong>
                <span>
                  {item.type} • {getRelativeTime(item.createdAt)}
                </span>
              </div>
              {!item.isRead ? (
                <span className={styles.unreadDot} aria-hidden="true" />
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;
