import styles from "./Sessions.module.scss";

const SessionCard = ({ session }: any) => {
  return (
    <div className={styles.card}>
      <h3>{session.title}</h3>

      <p>
        {session.role === "tutor"
          ? `Student: ${session.with}`
          : `Tutor: ${session.with}`}
      </p>

      <p>{new Date(session.date).toLocaleString()}</p>

      <span className={styles.status}>{session.status}</span>

      {/* ACTIONS */}
      <div className={styles.actions}>
        {session.status === "upcoming" && (
          <>
            <button className={styles.primary}>Join</button>
            <button className={styles.danger}>Cancel</button>
          </>
        )}

        {session.status === "requests" && (
          <>
            <button className={styles.primary}>Accept</button>
            <button className={styles.danger}>Reject</button>
          </>
        )}
      </div>
    </div>
  );
};

export default SessionCard;