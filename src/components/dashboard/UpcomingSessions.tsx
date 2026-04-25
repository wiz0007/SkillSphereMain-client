import styles from "../dashboard/Dashboard.module.scss";

interface SessionUser {
  _id: string;
  username: string;
}

interface SessionItem {
  _id: string;
  title: string;
  date: string;
  duration: number;
  price: number;
  student: SessionUser;
  tutor: SessionUser;
}

interface UpcomingSessionsProps {
  sessions: SessionItem[];
  userId: string;
}

const UpcomingSessions = ({
  sessions,
  userId,
}: UpcomingSessionsProps) => {
  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <div>
          <h2>Upcoming Sessions</h2>
          <p>Stay ready for the next meetings already on your calendar.</p>
        </div>
        <span className={styles.panelBadge}>{sessions.length}</span>
      </div>

      {sessions.length === 0 ? (
        <div className={styles.emptyState}>
          <strong>No upcoming sessions</strong>
          <span>
            Accepted sessions will appear here once they are scheduled.
          </span>
        </div>
      ) : (
        <div className={styles.sessionList}>
          {sessions.slice(0, 5).map((session) => {
            const counterpart =
              session.tutor?._id === userId
                ? session.student?.username
                : session.tutor?.username;

            return (
              <div key={session._id} className={styles.sessionCard}>
                <div className={styles.sessionContent}>
                  <strong>{session.title}</strong>
                  <span>
                    With @{counterpart || "participant"} •{" "}
                    {session.duration} min
                  </span>
                </div>

                <div className={styles.sessionMeta}>
                  <span>{new Date(session.date).toLocaleDateString()}</span>
                  <strong>
                    {new Date(session.date).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </strong>
                  <span>₹{session.price || 0}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UpcomingSessions;
