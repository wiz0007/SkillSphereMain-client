import {
  ArrowRight,
  CalendarClock,
  Clock3,
  IndianRupee,
  Layers3,
  Sparkles,
} from "lucide-react";
import styles from "./CourseDetails.module.scss";

const CourseSidebar = ({ course, onOpen }: any) => {
  return (
    <aside className={styles.right}>
      <div className={styles.previewCard}>
        <span className={styles.sidebarKicker}>Course snapshot</span>
        <h3>{course.category || "Personalized learning"}</h3>
        <p>
          Book a live session to turn the course material into a
          focused working plan with direct tutor guidance.
        </p>

        <div className={styles.previewTags}>
          <span>{course.level || "All levels"}</span>
          <span>{course.duration || "Flexible pace"}</span>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.priceBlock}>
          <span className={styles.priceLabel}>Session rate</span>
          <strong className={styles.price}>
            <IndianRupee size={22} />
            {course.price ?? 0}
          </strong>
          <p className={styles.priceNote}>
            Estimated for a 60-minute live session.
          </p>
        </div>

        <button
          type="button"
          className={styles.requestButton}
          onClick={onOpen}
        >
          Request session
          <ArrowRight size={16} />
        </button>

        <div className={styles.sidebarList}>
          <div className={styles.sidebarItem}>
            <CalendarClock size={18} />
            <div>
              <strong>Flexible scheduling</strong>
              <span>Choose a date and time that fits your plan.</span>
            </div>
          </div>

          <div className={styles.sidebarItem}>
            <Layers3 size={18} />
            <div>
              <strong>Focused guidance</strong>
              <span>Use the session to clarify lessons and next steps.</span>
            </div>
          </div>

          <div className={styles.sidebarItem}>
            <Clock3 size={18} />
            <div>
              <strong>30 to 90 minute blocks</strong>
              <span>Right-sized time slots for quick help or deep work.</span>
            </div>
          </div>

          <div className={styles.sidebarItem}>
            <Sparkles size={18} />
            <div>
              <strong>Personalized follow-through</strong>
              <span>Send context up front so the tutor can prepare well.</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default CourseSidebar;
