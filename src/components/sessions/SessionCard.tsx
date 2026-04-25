import { CalendarDays, Clock3 } from "lucide-react";
import styles from "./Sessions.module.scss";
import { api } from "../../api/api";
import { useNavigate } from "react-router-dom";

const SessionCard = ({ session, onUpdate }: any) => {
  const navigate = useNavigate();

  const updateStatus = async (status: string) => {
    try {
      await api.patch(`/sessions/${session._id}`, { status });
      onUpdate(session._id, status);
    } catch (error: any) {
      alert(error?.response?.data?.message || "Error updating");
    }
  };

  const counterpart = session.isTutor
    ? session.student?.username || session.student?.name
    : session.tutor?.username || session.tutor?.name;
  const counterpartId = session.isTutor
    ? session.student?._id || session.student
    : session.tutor?._id || session.tutor;

  return (
    <article className={styles.card}>
      <div className={styles.cardTop}>
        <div>
          <h3>{session.title}</h3>
          <p className={styles.personLine}>
            {session.isTutor ? "Student" : "Tutor"}:{" "}
            @{counterpart || "participant"}
          </p>
        </div>

        <span
          className={`${styles.status} ${
            styles[session.status]
          }`}
        >
          {session.status}
        </span>
      </div>

      <div className={styles.infoRows}>
        <div className={styles.infoRow}>
          <CalendarDays size={16} />
          <span>{new Date(session.date).toLocaleDateString()}</span>
        </div>
        <div className={styles.infoRow}>
          <Clock3 size={16} />
          <span>
            {new Date(session.date).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>

      <div className={styles.actions}>
        {session.type === "received" && session.isTutor ? (
          <>
            <button
              type="button"
              className={styles.primary}
              onClick={() => updateStatus("accepted")}
            >
              Accept
            </button>

            <button
              type="button"
              className={styles.danger}
              onClick={() => updateStatus("cancelled")}
            >
              Reject
            </button>
          </>
        ) : null}

        {session.type === "sent" ? (
          <button disabled className={styles.waiting}>
            Waiting for approval
          </button>
        ) : null}

        {session.type === "upcoming" ? (
          <>
            <button type="button" className={styles.primary}>
              Join
            </button>

            <button
              type="button"
              className={styles.danger}
              onClick={() => updateStatus("cancelled")}
            >
              Cancel
            </button>
          </>
        ) : null}

        {counterpartId ? (
          <button
            type="button"
            className={styles.secondary}
            onClick={() =>
              navigate(
                `/messages?userId=${counterpartId}&username=${
                  counterpart || "participant"
                }`
              )
            }
          >
            Message
          </button>
        ) : null}

        {session.type === "completed" ? (
          <span className={styles.completedLabel}>
            {session.status === "completed"
              ? "Session completed"
              : "Session cancelled"}
          </span>
        ) : null}
      </div>
    </article>
  );
};

export default SessionCard;
