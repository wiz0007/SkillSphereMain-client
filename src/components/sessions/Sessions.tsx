import { useEffect, useMemo, useState } from "react";
import styles from "./Sessions.module.scss";
import SessionCard from "./SessionCard";
import { getMySessions } from "../../services/session.service";
import { useAuth } from "../../context/AuthContext";

interface SessionParticipant {
  _id?: string;
  username?: string;
  name?: string;
}

interface Session {
  _id: string;
  title: string;
  date: string;
  status: "pending" | "accepted" | "completed" | "cancelled";
  tutor: SessionParticipant | string;
  student: SessionParticipant | string;
}

type SessionTab =
  | "upcoming"
  | "completed"
  | "sent"
  | "received";

const tabLabels: Array<{ key: SessionTab; label: string }> = [
  { key: "upcoming", label: "Upcoming" },
  { key: "completed", label: "Completed" },
  { key: "sent", label: "Sent Requests" },
  { key: "received", label: "Received Requests" },
];

const Sessions = () => {
  const { user, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<SessionTab>("upcoming");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?._id) return;

    const fetchSessions = async () => {
      try {
        const data = await getMySessions();
        setSessions(data);
      } catch (error) {
        console.error("Failed to fetch sessions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [user]);

  const mappedSessions = useMemo(() => {
    const userId = String(user?._id || "");

    return sessions.map((session) => {
      const tutorId = String(
        (session.tutor as SessionParticipant)?._id || session.tutor
      );
      const studentId = String(
        (session.student as SessionParticipant)?._id ||
          session.student
      );

      const isTutor = tutorId === userId;
      const isStudent = studentId === userId;

      let type: SessionTab | null = null;

      if (session.status === "pending") {
        if (isTutor) type = "received";
        if (isStudent) type = "sent";
      } else if (session.status === "accepted") {
        type = "upcoming";
      } else if (
        ["completed", "cancelled"].includes(session.status)
      ) {
        type = "completed";
      }

      return {
        ...session,
        type,
        isTutor,
        isStudent,
      };
    });
  }, [sessions, user?._id]);

  const filtered = mappedSessions.filter(
    (session) => session.type === tab
  );

  const counts = useMemo(
    () =>
      tabLabels.reduce<Record<SessionTab, number>>(
        (accumulator, item) => {
          accumulator[item.key] = mappedSessions.filter(
            (session) => session.type === item.key
          ).length;
          return accumulator;
        },
        {
          upcoming: 0,
          completed: 0,
          sent: 0,
          received: 0,
        }
      ),
    [mappedSessions]
  );

  const handleUpdate = (
    sessionId: string,
    status: Session["status"]
  ) => {
    setSessions((previous) =>
      previous.map((session) =>
        session._id === sessionId
          ? { ...session, status }
          : session
      )
    );
  };

  if (authLoading || !user) {
    return (
      <div className={styles.loadingPanel}>
        Loading sessions...
      </div>
    );
  }

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <div>
          <span className={styles.kicker}>Sessions</span>
          <h1>Your session timeline</h1>
          <p>
            Review incoming requests, upcoming meetings, and
            completed sessions from one organized queue.
          </p>
        </div>

        <div className={styles.snapshot}>
          <span className={styles.snapshotLabel}>At a glance</span>
          <strong>{counts.upcoming} upcoming sessions</strong>
          <span className={styles.snapshotHint}>
            {counts.received
              ? `${counts.received} requests need your response`
              : "No pending actions right now"}
          </span>
        </div>
      </div>

      <div className={styles.tabs}>
        {tabLabels.map((item) => (
          <button
            key={item.key}
            type="button"
            className={tab === item.key ? styles.active : ""}
            onClick={() => setTab(item.key)}
          >
            <span>{item.label}</span>
            <strong>{counts[item.key]}</strong>
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.loadingPanel}>
          Loading sessions...
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <strong>No sessions in this view</strong>
          <span>
            When activity lands in this category, it will show up
            here automatically.
          </span>
        </div>
      ) : (
        <div className={styles.grid}>
          {filtered.map((session) => (
            <SessionCard
              key={session._id}
              session={session}
              onUpdate={handleUpdate}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default Sessions;
