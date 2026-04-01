import styles from "../dashboard/Dashboard.module.scss";

const formatActivity = (a: any) => {
  switch (a.action) {
    case "BOOKED":
      return `Booked session: ${a.metadata?.title}`;

    case "ACCEPTED":
      return "Session accepted";

    case "COMPLETED":
      return "Session completed";

    case "BECAME_TUTOR":
      return "You became a tutor 🎉";

    default:
      return "Activity updated";
  }
};

const ActivityFeed = ({ activity }: any) => {
  if (!activity.length) {
    return <div className={styles.panel}>No recent activity</div>;
  }

  return (
    <div className={styles.panel}>
      <h2>Recent Activity</h2>

      <ul>
        {activity.map((a: any) => (
          <li key={a._id}>{formatActivity(a)}</li>
        ))}
      </ul>
    </div>
  );
};

export default ActivityFeed;