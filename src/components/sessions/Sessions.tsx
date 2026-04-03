import { useState } from "react";
import styles from "./Sessions.module.scss";
import SessionCard from "./SessionCard";

const dummySessions = [
  {
    _id: "1",
    title: "React Basics",
    with: "John Carter",
    role: "tutor",
    date: "2026-04-05T10:00:00",
    status: "upcoming",
  },
  {
    _id: "2",
    title: "UI Design",
    with: "Sarah Lee",
    role: "student",
    date: "2026-04-03T15:00:00",
    status: "completed",
  },
];

const Sessions = () => {
  const [tab, setTab] = useState("upcoming");

  const filtered = dummySessions.filter((s) => s.status === tab);

  return (
    <div className={styles.container}>
      <h1>📅 Your Sessions</h1>

      {/* TABS */}
      <div className={styles.tabs}>
        {["upcoming", "completed", "requests"].map((t) => (
          <button
            key={t}
            className={tab === t ? styles.active : ""}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* LIST */}
      <div className={styles.grid}>
        {filtered.length === 0 ? (
          <p>No sessions found</p>
        ) : (
          filtered.map((s) => <SessionCard key={s._id} session={s} />)
        )}
      </div>
    </div>
  );
};

export default Sessions;
