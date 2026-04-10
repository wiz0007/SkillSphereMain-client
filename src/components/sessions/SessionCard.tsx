import styles from "./Sessions.module.scss";
import { api } from "../../api/api";

const SessionCard = ({ session, onUpdate }: any) => {
  const updateStatus = async (status: string) => {
    try {
      await api.patch(`/sessions/${session._id}`, { status });

      // ✅ update UI without reload
      onUpdate(session._id, status);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Error updating");
    }
  };

  const formattedDate = new Date(session.date).toLocaleString();

  return (
    <div className={styles.card}>
      <h3>{session.title}</h3>

      <p>
        {session.isTutor
          ? `Student: ${session.student?.name}`
          : `Tutor: ${session.tutor?.name}`}
      </p>

      <p className={styles.time}>🕒 {formattedDate}</p>

      <span className={styles.status}>{session.status}</span>

      <div className={styles.actions}>
        {session.type === "received" && session.isTutor && (
          <>
            <button
              className={styles.primary}
              onClick={() => updateStatus("accepted")}
            >
              Accept
            </button>

            <button
              className={styles.danger}
              onClick={() => updateStatus("cancelled")}
            >
              Reject
            </button>
          </>
        )}

        {session.type === "sent" && (
          <button disabled className={styles.waiting}>
            Waiting for Approval
          </button>
        )}

        {session.type === "upcoming" && (
          <>
            <button className={styles.primary}>Join</button>

            <button
              className={styles.danger}
              onClick={() => updateStatus("cancelled")}
            >
              Cancel
            </button>
          </>
        )}

        {session.type === "completed" && (
          <span className={styles.completed}>
            {session.status === "completed"
              ? "Session Completed"
              : "Session Cancelled"}
          </span>
        )}
      </div>
    </div>
  );
};

export default SessionCard;