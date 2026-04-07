import styles from "./CourseDetails.module.scss";

const CourseSidebar = ({ course, onOpen }: any) => {
  return (
    <div className={styles.right}>
      <div className={styles.video}>
        <iframe
          src="https://www.youtube.com/embed/ysz5S6PUM-U"
          allowFullScreen
        />
      </div>

      <div className={styles.card}>
        <h3>₹ {course.price}</h3>

        <button onClick={onOpen}>Request Session</button>

        <ul>
          <li>✔ 1-on-1 mentorship</li>
          <li>✔ Flexible timing</li>
          <li>✔ Real-world projects</li>
        </ul>
      </div>
    </div>
  );
};

export default CourseSidebar;