import styles from "../dashboard/Dashboard.module.scss";

const UpcomingSessions = ({ sessions }: any) => {
  if (!sessions.length) {
    return <div className={styles.panel}>No upcoming sessions</div>;
  }

  return (
    <div className={styles.panel}>
      <h2>Upcoming Sessions</h2>

      {sessions.slice(0, 5).map((s: any) => (
        <div key={s._id} className={styles.sessionItem}>
          <span>{s.title}</span>
          <span>{new Date(s.date).toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

export default UpcomingSessions;