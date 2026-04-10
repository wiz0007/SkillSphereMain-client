import { useEffect, useState } from "react";
import styles from "./Sessions.module.scss";
import SessionCard from "./SessionCard";
import { getMySessions } from "../../services/session.service";
import { useAuth } from "../../context/AuthContext";

interface Session {
  _id: string;
  title: string;
  date: string;
  status: "pending" | "accepted" | "completed" | "cancelled";
  tutor: any;
  student: any;
}

const Sessions = () => {
  const { user, loading: authLoading } = useAuth();

  const [tab, setTab] = useState("upcoming");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?._id) return;

    const fetchSessions = async () => {
      try {
        const data = await getMySessions();
        setSessions(data);
      } catch (err) {
        console.error("Failed to fetch sessions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [user]);

  if (authLoading || !user) {
    return <p>Loading...</p>;
  }

  const userId = String(user._id);

  /* 🔥 FINAL MAPPING */
  const mapped = sessions.map((s) => {
    const tutorId = String(s.tutor?._id || s.tutor);
    const studentId = String(s.student?._id || s.student);

    const isTutor = tutorId === userId;
    const isStudent = studentId === userId;

    let type: "sent" | "received" | "upcoming" | "completed" | null = null;

    if (s.status === "pending") {
      if (isTutor) type = "received";
      else if (isStudent) type = "sent";
    } else if (s.status === "accepted") {
      type = "upcoming";
    } else if (["completed", "cancelled"].includes(s.status)) {
      type = "completed";
    }

    return {
      ...s,
      type,
      isTutor,
      isStudent,
    };
  });

  const filtered = mapped.filter((s) => s.type === tab);

  return (
    <div className={styles.container}>
      <h1>📅 Your Sessions</h1>

      <div className={styles.tabs}>
        {[
          { key: "upcoming", label: "Upcoming" },
          { key: "completed", label: "Completed" },
          { key: "sent", label: "Sent Requests" },
          { key: "received", label: "Received Requests" },
        ].map((t) => (
          <button
            key={t.key}
            className={tab === t.key ? styles.active : ""}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className={styles.grid}>
        {loading ? (
          <p>Loading...</p>
        ) : filtered.length === 0 ? (
          <p>No sessions found</p>
        ) : (
          filtered.map((s) => (
            <SessionCard key={s._id} session={s} />
          ))
        )}
      </div>
    </div>
  );
};

export default Sessions;