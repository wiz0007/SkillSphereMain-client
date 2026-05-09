import { CalendarDays, CircleDollarSign, Clock3 } from "lucide-react";
import styles from "./Sessions.module.scss";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  confirmSessionCompletion,
  hideSession,
  updateSessionStatus,
} from "../../services/session.service";

const SessionCard = ({ session, onUpdate, onHide }: any) => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const updateStatus = async (
    status: "accepted" | "completed" | "cancelled"
  ) => {
    try {
      await updateSessionStatus(session._id, status);
      await refreshUser();
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
  const canHide = session.isExpired || session.status === "cancelled";
  const statusClass = session.isExpired
    ? styles.expired
    : styles[session.status];
  const statusLabel = session.isExpired
    ? "expired"
    : session.status;
  const skillCoinLabel =
    session.coinStatus === "settled"
      ? "settled"
      : session.coinStatus === "released"
        ? "released"
        : "locked";

  const handleHide = async () => {
    try {
      await hideSession(session._id);
      onHide(session._id);
    } catch (error: any) {
      alert(
        error?.response?.data?.message ||
          "Could not remove this session from view"
      );
    }
  };

  const handleConfirmCompletion = async () => {
    try {
      await confirmSessionCompletion(session._id);
      await refreshUser();
      onUpdate(session._id, "completed", {
        studentConfirmedCompletionAt: new Date().toISOString(),
        coinStatus: "settled",
      });
    } catch (error: any) {
      alert(
        error?.response?.data?.message ||
          "Could not confirm this session yet"
      );
    }
  };

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
            statusClass
          }`}
        >
          {statusLabel}
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
        <div className={styles.infoRow}>
          <CircleDollarSign size={16} />
          <span>
            {session.skillCoinAmount} SC {skillCoinLabel}
          </span>
        </div>
      </div>

      <div className={styles.actions}>
        {session.type === "received" &&
        session.isTutor &&
        !session.isExpired ? (
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

        {session.type === "sent" && !session.isExpired ? (
          <button disabled className={styles.waiting}>
            Waiting for approval
          </button>
        ) : null}

        {session.type === "sent" && session.isExpired ? (
          <button disabled className={styles.waiting}>
            Request expired
          </button>
        ) : null}

        {session.type === "received" && session.isExpired ? (
          <button disabled className={styles.waiting}>
            Request expired
          </button>
        ) : null}

        {session.type === "upcoming" ? (
          <>
            <button type="button" className={styles.primary}>
              Join
            </button>

            {session.isTutor ? (
              <button
                type="button"
                className={styles.secondary}
                onClick={() => updateStatus("completed")}
              >
                Mark completed
              </button>
            ) : (
              <button
                type="button"
                className={styles.danger}
                onClick={() => updateStatus("cancelled")}
              >
                Cancel
              </button>
            )}
          </>
        ) : null}

        {counterpartId &&
        ["accepted", "completed"].includes(session.status) ? (
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
            {session.isTutor ? "Message student" : "Message tutor"}
          </button>
        ) : null}

        {session.type === "completed" ? (
          <span className={styles.completedLabel}>
            {session.status === "accepted"
              ? session.isTutor
                ? "Session time passed. Mark it completed when done."
                : "Waiting for tutor to mark this session completed"
              : session.status === "completed"
              ? session.studentConfirmedCompletionAt
                ? "Session completed and SkillCoin settled"
                : session.isTutor
                  ? "Waiting for student confirmation"
                  : "Confirm completion to release SkillCoin"
              : "Session cancelled"}
          </span>
        ) : null}

        {session.type === "completed" &&
        session.isTutor &&
        session.status === "accepted" ? (
          <button
            type="button"
            className={styles.secondary}
            onClick={() => updateStatus("completed")}
          >
            Mark completed
          </button>
        ) : null}

        {session.type === "completed" &&
        !session.isTutor &&
        session.status === "completed" &&
        !session.studentConfirmedCompletionAt ? (
          <button
            type="button"
            className={styles.primary}
            onClick={() => void handleConfirmCompletion()}
          >
            Confirm completion
          </button>
        ) : null}

        {canHide ? (
          <button
            type="button"
            className={styles.ghost}
            onClick={() => void handleHide()}
          >
            Remove from view
          </button>
        ) : null}
      </div>
    </article>
  );
};

export default SessionCard;
