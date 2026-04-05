import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./CourseCard.module.scss";
import type { Course } from "../../services/courses.service";

interface Props {
  course: Course;
}

const CourseCard: React.FC<Props> = ({ course }) => {
  // Mock values (until backend supports it)
  const rating = (4 + Math.random()).toFixed(1);
  const students = Math.floor(Math.random() * 500 + 50);

  const navigate = useNavigate();

  return (
    <div className={styles.card}>
      <div className={styles.thumbnail}>
        <img src="/course-placeholder.jpg" alt={course.title} />
      </div>

      <div className={styles.content}>
        <h3 className={styles.title}>{course.title}</h3>

        <span className={styles.category}>{course.category}</span>

        <div className={styles.meta}>
          <span>{course.level}</span>
          <span>⭐ {rating}</span>
        </div>

        <p className={styles.students}>{students} students</p>

        <button
  className={styles.cta}
  onClick={() => navigate(`/course/${course._id}`)}
>
  Request Session
</button>
      </div>
    </div>
  );
};

export default CourseCard;
