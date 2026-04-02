import styles from "../dashboard/Dashboard.module.scss";

const TutorSection = ({ sessions }: any) => {
  const teachingSessions = sessions.filter(
    (s: any) => s.role === "tutor"
  );

  return (
    <div className={styles.tutorSection}>
      <h2>🧑‍🏫 Teaching Overview</h2>

      {!teachingSessions.length ? (
        <div className={styles.panel}>
          You haven’t hosted any sessions yet
        </div>
      ) : (
        <div className={styles.panel}>
          {teachingSessions.slice(0, 5).map((s: any) => (
            <div key={s._id} className={styles.sessionItem}>
              <span>{s.title}</span>
              <span>{new Date(s.date).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TutorSection;