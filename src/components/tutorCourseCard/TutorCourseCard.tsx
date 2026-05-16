import {
  Clock3,
  IndianRupee,
  Layers3,
  PencilLine,
  Star,
  Trash2,
} from "lucide-react";
import styles from "./TutorCourseCard.module.scss";
import type { Course } from "../../services/courses.service";

interface Props {
  course: Course;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (course: Course) => void;
  onView: (id: string) => void;
}

const TutorCourseCard: React.FC<Props> = ({
  course,
  selectable = false,
  selected = false,
  onSelect,
  onDelete,
  onEdit,
  onView,
}) => {
  const description =
    course.description?.trim() ||
    "Add a short outcome-focused description so learners can quickly understand the value of this course.";

  const visibleSkills =
    course.skills?.filter(Boolean).slice(0, 3) || [];
  const isTuition = course.type === "tuition";
  const scheduleLabel = isTuition
    ? `${
        course.tuitionSchedule?.days?.length
          ? course.tuitionSchedule.days.join(", ")
          : "Weekly tuition"
      }${
        course.tuitionSchedule?.startTime
          ? ` at ${course.tuitionSchedule.startTime}`
          : ""
      }`
    : "";

  const rating = course.totalRatings
    ? `${(course.averageRating || 0).toFixed(1)} / 5`
    : "New";

  return (
    <div
      className={`${styles.card} ${
        selected ? styles.selected : ""
      }`}
    >
      <div className={styles.header}>
        <div className={styles.categoryRow}>
          <span className={styles.category}>
            {course.category || "General"}
          </span>
          <span className={styles.category}>
            {course.type === "recorded"
              ? "Recorded"
              : course.type === "tuition"
                ? "Tuition"
                : "Live"}
          </span>

          {selectable ? (
            <label className={styles.selector}>
              <input
                type="checkbox"
                checked={selected}
                onChange={() => onSelect?.(course._id)}
              />
              <span>{selected ? "Selected" : "Select"}</span>
            </label>
          ) : null}
        </div>

        <button
          type="button"
          className={styles.previewTrigger}
          onClick={() => onView(course._id)}
        >
          <h3>{course.title || "Untitled Course"}</h3>
          <p className={styles.description}>{description}</p>
        </button>
      </div>

      <button
        type="button"
        className={styles.previewPanel}
        onClick={() => onView(course._id)}
      >
        <div className={styles.metrics}>
        <div className={styles.metric}>
          <Layers3 size={16} className={styles.metricIcon} />
          <div>
            <span>Level</span>
            <strong>{course.level || "All levels"}</strong>
          </div>
        </div>

        <div className={styles.metric}>
          <IndianRupee
            size={16}
            className={styles.metricIcon}
          />
          <div>
            <span>Rate</span>
            <strong>
              {course.price ?? 0}
              {course.type === "recorded"
                ? " SC"
                : course.type === "tuition"
                  ? "/month"
                  : "/hr"}
            </strong>
          </div>
        </div>

        <div className={styles.metric}>
          <Clock3 size={16} className={styles.metricIcon} />
          <div>
            <span>Duration</span>
            <strong>
              {isTuition
                ? scheduleLabel || "Recurring timetable"
                : course.duration || "Flexible"}
            </strong>
          </div>
        </div>

        <div className={styles.metric}>
          <Star size={16} className={styles.metricIcon} />
          <div>
            <span>Rating</span>
            <strong>{rating}</strong>
          </div>
        </div>
        </div>

        {visibleSkills.length ? (
          <div className={styles.tags}>
            {visibleSkills.map((skill) => (
              <span key={skill} className={styles.tag}>
                {skill}
              </span>
            ))}
          </div>
        ) : null}
      </button>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.secondaryAction}
          onClick={() => onEdit(course)}
        >
          <PencilLine size={16} />
          Edit
        </button>

        <button
          type="button"
          className={styles.dangerAction}
          onClick={() => onDelete(course._id)}
        >
          <Trash2 size={16} />
          Delete
        </button>
      </div>
    </div>
  );
};

export default TutorCourseCard;
