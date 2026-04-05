import React, { useState } from "react";
import styles from "./CourseCard.module.scss";
import { type Course, rateCourse } from "../../services/courses.service";
import { useNavigate } from "react-router-dom";

interface Props {
  course: Course;
}

const CourseCard: React.FC<Props> = ({ course }) => {
  const navigate = useNavigate();

  const [hover, setHover] = useState(0);
  const [rating, setRating] = useState(course.averageRating || 0);
  const [total, setTotal] = useState(course.totalRatings || 0);
  const [saved, setSaved] = useState(false);
  const [loading] = useState(false);
  const [userRating, setUserRating] = useState(0);

  /* ⭐ HANDLE RATING */
  const handleRate = async (value: number) => {
    try {
      setUserRating(value); // 🔥 immediate UI feedback

      const res = await rateCourse(course._id, value);

      setRating(res.averageRating);
      setTotal(res.totalRatings);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={styles.card}>
      {/* IMAGE */}
      <div className={styles.image}>
        <img src="/course-placeholder.jpg" alt={course.title} />
      </div>

      {/* CONTENT */}
      <div className={styles.content}>
        {/* TOP */}
        <div className={styles.top}>
          <h3>{course.title}</h3>

          <button className={styles.save} onClick={() => setSaved(!saved)}>
            {saved ? "❤️" : "🤍"}
          </button>
        </div>

        {/* DESCRIPTION */}
        <p className={styles.desc}>{course.description?.slice(0, 120)}...</p>

        {/* META */}
        <div className={styles.meta}>
          <span>{course.category}</span>
          <span>{course.level}</span>
          <span>{course.duration}</span>
        </div>

        {/* ⭐ RATING */}
        <div className={styles.ratingRow}>
          <div className={styles.stars}>
            {[1, 2, 3, 4, 5].map((star) => {
              const activeValue = hover || userRating || Math.round(rating);

              return (
                <span
                  key={star}
                  onClick={() => handleRate(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  className={star <= activeValue ? styles.active : ""}
                >
                  ★
                </span>
              );
            })}
          </div>

          <span className={styles.ratingText}>
            {rating.toFixed(1)} ({total})
          </span>

          {loading && <span className={styles.loading}>...</span>}
        </div>

        {/* BOTTOM */}
        <div className={styles.bottom}>
          <button
            className={styles.cta}
            onClick={() => navigate(`/course/${course._id}`)}
          >
            Request Session
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
