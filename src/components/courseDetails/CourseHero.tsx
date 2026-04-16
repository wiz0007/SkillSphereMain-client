import { useState } from "react";
import styles from "./CourseDetails.module.scss";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const CourseHero = ({
  course,
  hover,
  setHover,
  userRating,
  handleRate,
  saved,
  onSave,
}: any) => {
  const navigate = useNavigate();

  const avg = course.averageRating || 0;
  const total = course.totalRatings || 0;
  const active = hover || userRating || Math.round(avg);

  const [animate, setAnimate] = useState(false);

  const triggerAnimation = () => {
    setAnimate(true);
    setTimeout(() => setAnimate(false), 300);
  };

  return (
    <div className={styles.left}>
      <h1>{course.title}</h1>

      {/* 🔥 TUTOR INFO (NEW) */}
      <div
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
        <span>@{course.tutor?.username}</span>
      </div>

      <p className={styles.desc}>{course.description}</p>

      {/* ⭐ STARS */}
      <div className={styles.ratingRow}>
        <div className={styles.stars}>
          {[1, 2, 3, 4, 5].map((s) => (
            <span
              key={s}
              onClick={() => handleRate(s)}
              onMouseEnter={() => setHover(s)}
              onMouseLeave={() => setHover(0)}
              className={s <= active ? styles.active : ""}
            >
              ★
            </span>
          ))}
        </div>

        <span className={styles.ratingText}>
          {avg.toFixed(1)} ({total})
        </span>
      </div>

      {/* BADGES */}
      <div className={styles.badges}>
        <span>{course.category}</span>
        <span>{course.level}</span>
        <span>{course.duration}</span>
      </div>

      {/* SAVE */}
      <button
        className={`${styles.saveBtn} ${saved ? styles.saved : ""} ${
          animate ? styles.animate : ""
        }`}
        onClick={() => {
          onSave();
          triggerAnimation();
        }}
      >
        {saved ? <FaHeart /> : <FaRegHeart />}
      </button>
    </div>
  );
};

export default CourseHero;