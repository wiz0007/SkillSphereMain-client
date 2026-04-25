import React, { useState } from "react";
import {
  Bookmark,
  BookmarkCheck,
  Clock3,
  IndianRupee,
  Layers3,
  Star,
} from "lucide-react";
import styles from "./CourseCard.module.scss";
import {
  type Course,
  rateCourse,
} from "../../services/courses.service";
import { useNavigate } from "react-router-dom";
import { useSaveCourse } from "../courseDetails/useSaveCourse";

interface Props {
  course: Course;
}

const CourseCard: React.FC<Props> = ({ course }) => {
  const navigate = useNavigate();
  const { isSaved, handleSave } = useSaveCourse();

  const [hover, setHover] = useState(0);
  const [rating, setRating] = useState(course.averageRating || 0);
  const [total, setTotal] = useState(course.totalRatings || 0);
  const [userRating, setUserRating] = useState(0);

  const handleRate = async (value: number) => {
    try {
      setUserRating(value);
      const res = await rateCourse(course._id, value);

      setRating(res.averageRating);
      setTotal(res.totalRatings);
    } catch (error) {
      console.error(error);
    }
  };

  const activeValue =
    hover || userRating || Math.round(rating || 0);
  const visibleSkills =
    course.skills?.filter(Boolean).slice(0, 3) || [];

  return (
    <article className={styles.card}>
      <div className={styles.image}>
        <img
          src="/course-placeholder.jpg"
          alt={course.title}
        />

        <button
          type="button"
          className={styles.save}
          onClick={() => handleSave(course._id)}
        >
          {isSaved(course._id) ? (
            <BookmarkCheck size={18} />
          ) : (
            <Bookmark size={18} />
          )}
        </button>
      </div>

      <div className={styles.content}>
        <div className={styles.top}>
          <span className={styles.category}>
            {course.category || "General"}
          </span>
          <span className={styles.level}>
            {course.level || "All levels"}
          </span>
        </div>

        <div className={styles.titleBlock}>
          <h3>{course.title}</h3>
          <p className={styles.desc}>
            {course.description?.trim() ||
              "Explore a practical learning path designed around real outcomes."}
          </p>
        </div>

        <button
          type="button"
          className={styles.tutor}
          onClick={() =>
            navigate(`/public-profile/${course.tutor?._id}`)
          }
        >
          <img
            src={
              course.tutor?.profilePhoto ||
              `https://ui-avatars.com/api/?name=${course.tutor?.username}`
            }
            alt={course.tutor?.username}
          />
          <span>@{course.tutor?.username || "tutor"}</span>
        </button>

        <div className={styles.metrics}>
          <div className={styles.metric}>
            <IndianRupee size={15} />
            <span>{course.price ?? 0}/hr</span>
          </div>
          <div className={styles.metric}>
            <Clock3 size={15} />
            <span>{course.duration || "Flexible"}</span>
          </div>
          <div className={styles.metric}>
            <Layers3 size={15} />
            <span>{course.level || "All levels"}</span>
          </div>
        </div>

        {visibleSkills.length ? (
          <div className={styles.tags}>
            {visibleSkills.map((skill) => (
              <span key={skill}>{skill}</span>
            ))}
          </div>
        ) : null}

        <div className={styles.ratingRow}>
          <div className={styles.stars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleRate(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                className={
                  star <= activeValue ? styles.active : ""
                }
              >
                <Star size={15} />
              </button>
            ))}
          </div>

          <span className={styles.ratingText}>
            {rating ? rating.toFixed(1) : "New"} ({total})
          </span>
        </div>

        <button
          type="button"
          className={styles.cta}
          onClick={() => navigate(`/course/${course._id}`)}
        >
          View course
        </button>
      </div>
    </article>
  );
};

export default CourseCard;
