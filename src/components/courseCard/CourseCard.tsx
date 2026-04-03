import styles from "./CourseCard.module.scss";

const CourseCard = ({
  course,
  mode = "public",
  onDelete,
  onEdit,
  selectable = false,
  selected = false,
  onSelect,
}: any) => {
  return (
    <div className={styles.card}>
      
      {selectable && (
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onSelect?.(course._id)}
          className={styles.checkbox}
        />
      )}

      {/* HEADER */}
      <div className={styles.header}>
        <span className={styles.category}>
          {course.category || "General"}
        </span>
      </div>

      {/* TITLE */}
      <h3 className={styles.title}>{course.title}</h3>

      {/* AUTHOR */}
      <p className={styles.author}>by You</p>

      {/* SKILLS */}
      <div className={styles.skills}>
        {course.skills?.map((s: string, i: number) => (
          <span key={i}>{s}</span>
        ))}
      </div>

      {/* META */}
      <div className={styles.meta}>
        <span className={styles.level}>{course.level}</span>
        <span>⭐ {course.rating || 4.5}</span>
        <span>👥 {course.students || 0}</span>
      </div>

      {/* PRICE */}
      <div className={styles.price}>
        ₹{course.price || 0}/hr
      </div>

      {/* ACTIONS */}
      {mode === "public" && (
        <button className={styles.primaryBtn}>
          Request Session
        </button>
      )}

      {mode === "tutor" && (
        <div className={styles.actions}>
          <button
            className={styles.editBtn}
            onClick={() => onEdit?.(course)}
          >
            Edit
          </button>

          <button
            className={styles.deleteBtn}
            onClick={() => {
              if (confirm("Are you sure?")) {
                onDelete?.(course._id);
              }
            }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default CourseCard;