import styles from "./TutorCourseCard.module.scss";

/* ================= TYPES ================= */
interface Course {
  _id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  price: number;
}

interface Props {
  course: Course;

  selectable?: boolean;
  selected?: boolean;

  onSelect?: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (course: Course) => void;
}

/* ================= COMPONENT ================= */
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
          onChange={() => onSelect?.(course._id)}
        />
      )}

      {/* CATEGORY */}
      <span className={styles.category}>
        {course.category}
      </span>

      {/* TITLE */}
      <h3>{course.title}</h3>

      {/* LEVEL + PRICE */}
      <div className={styles.meta}>
        <span>{course.level}</span>
        <span>₹{course.price}/hr</span>
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
          onClick={() => onDelete(course._id)}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default TutorCourseCard;