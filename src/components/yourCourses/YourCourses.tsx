import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, Clock3, MessageCircleMore } from "lucide-react";
import styles from "./YourCourses.module.scss";
import { useAuth } from "../../context/AuthContext";
import { getMySessions } from "../../services/session.service";

interface SessionParticipant {
  _id?: string;
  username?: string;
  name?: string;
}

interface SessionItem {
  _id: string;
  title: string;
  date: string;
  duration: number;
  status: "pending" | "accepted" | "completed" | "cancelled";
  tutor: SessionParticipant | string;
  student: SessionParticipant | string;
}

type CourseTab = "ongoing" | "past";

const tabs: Array<{ key: CourseTab; label: string }> = [
  { key: "ongoing", label: "Ongoing" },
  { key: "past", label: "Past" },
];

const YourCourses = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<CourseTab>("ongoing");

  useEffect(() => {
    if (authLoading || !user?._id) return;

    const fetchSessions = async () => {
      try {
        setLoading(true);
        const data = await getMySessions();
        setSessions(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch confirmed courses:", error);
        setSessions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [authLoading, user?._id]);

  const now = Date.now();

  const confirmedSessions = useMemo(
    () =>
      sessions.filter((session) =>
        ["accepted", "completed"].includes(session.status)
      ),
    [sessions]
  );

  const ongoingCourses = useMemo(
    () =>
      confirmedSessions.filter(
        (session) =>
          session.status === "accepted" &&
          new Date(session.date).getTime() >= now
      ),
    [confirmedSessions, now]
  );

  const pastCourses = useMemo(
    () =>
      confirmedSessions.filter(
        (session) =>
          session.status === "completed" ||
          (session.status === "accepted" &&
            new Date(session.date).getTime() < now)
      ),
    [confirmedSessions, now]
  );

  const visibleCourses = tab === "ongoing" ? ongoingCourses : pastCourses;

  const counts = {
    ongoing: ongoingCourses.length,
    past: pastCourses.length,
  };

  const getTutor = (session: SessionItem) =>
    (session.tutor as SessionParticipant) || {};

  if (authLoading || !user) {
    return <div className={styles.loading}>Loading courses...</div>;
  }

  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <div>
          <span className={styles.kicker}>Your Courses</span>
          <h1>See only the courses that were actually confirmed</h1>
          <p>
            Pending requests stay out of this view. You only see accepted
            and finished course bookings here.
          </p>
        </div>

        <div className={styles.snapshot}>
          <span className={styles.snapshotLabel}>Confirmed</span>
          <strong>{ongoingCourses.length} ongoing course bookings</strong>
          <span className={styles.snapshotHint}>
            {pastCourses.length
              ? `${pastCourses.length} completed course${
                  pastCourses.length > 1 ? "s" : ""
                } in your history`
              : "Your accepted history will show up here"}
          </span>
        </div>
      </div>

      <div className={styles.topBar}>
        <div className={styles.tabs}>
          {tabs.map((item) => (
            <button
              key={item.key}
              type="button"
              className={tab === item.key ? styles.activeTab : ""}
              onClick={() => setTab(item.key)}
            >
              <span>{item.label}</span>
              <strong>{counts[item.key]}</strong>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading courses...</div>
      ) : visibleCourses.length === 0 ? (
        <div className={styles.emptyPanel}>
          <strong>
            {tab === "ongoing"
              ? "No ongoing confirmed courses"
              : "No past confirmed courses"}
          </strong>
          <span>
            {tab === "ongoing"
              ? "Courses appear here only after the tutor accepts your booking."
              : "Completed accepted bookings will appear here once they finish."}
          </span>
        </div>
      ) : (
        <div className={styles.grid}>
          {visibleCourses.map((session) => {
            const tutor = getTutor(session);
            const tutorId = tutor._id || "";
            const tutorName = tutor.username || tutor.name || "tutor";
            const canMessageTutor = !!tutorId;

            return (
              <article key={session._id} className={styles.courseCard}>
                <div className={styles.cardTop}>
                  <div>
                    <span className={styles.statusPill}>
                      {tab === "ongoing" ? "Accepted" : "Past"}
                    </span>
                    <h3>{session.title}</h3>
                    <p className={styles.metaText}>Tutor: @{tutorName}</p>
                  </div>
                </div>

                <div className={styles.infoRows}>
                  <div className={styles.infoRow}>
                    <CalendarDays size={16} />
                    <span>
                      {new Date(session.date).toLocaleDateString()}
                    </span>
                  </div>

                  <div className={styles.infoRow}>
                    <Clock3 size={16} />
                    <span>
                      {new Date(session.date).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      | {session.duration} min
                    </span>
                  </div>
                </div>

                {canMessageTutor ? (
                  <div className={styles.cardActions}>
                    <button
                      type="button"
                      className={styles.secondaryButton}
                      onClick={() =>
                        navigate(
                          `/messages?userId=${tutorId}&username=${tutorName}`
                        )
                      }
                    >
                      <MessageCircleMore size={16} />
                      Message Tutor
                    </button>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default YourCourses;
