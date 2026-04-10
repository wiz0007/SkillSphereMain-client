import styles from "./TutorCourseCard.module.scss";
import type { Course } from "../../services/courses.service";

interface Props {
  course: Course;

  selectable?: boolean;
  selected?: boolean;

  onSelect?: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (course: Course) => void;
}

const TutorCourseCard: React.FC<Props> = ({
  course,
  selectable = false,
  selected = false,
  onSelect,
  onDelete,
  onEdit,
}) => {
  return (
    <div
      className={`${styles.card} ${
        selected ? styles.selected : ""
      }`}
    >
      {/* SELECT */}
      {selectable && (
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => {
            e.stopPropagation();
            if (onSelect) onSelect(course._id);
          }}
        />
      )}

      {/* CATEGORY */}
      <span className={styles.category}>
        {course.category || "General"}
      </span>

      {/* TITLE */}
      <h3>{course.title || "Untitled Course"}</h3>

      {/* META */}
      <div className={styles.meta}>
        <span>{course.level || "All Levels"}</span>
        <span>₹{course.price ?? 0}/hr</span>
      </div>

      {/* ACTIONS */}
      <div className={styles.actions}>
        <button
          className={styles.edit}
          onClick={() => onEdit(course)}
        >
          Edit
        </button>

        <button
          className={styles.delete}
          onClick={() => {
            const confirmDelete = window.confirm(
              "Delete this course?"
            );
            if (confirmDelete) onDelete(course._id);
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default TutorCourseCard;