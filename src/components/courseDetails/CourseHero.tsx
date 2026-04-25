import {
  Bookmark,
  BookmarkCheck,
  MessageSquareText,
  ShieldCheck,
  Star,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import styles from "./CourseDetails.module.scss";

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
  const reviewCount = course.reviews?.length || 0;
  const tutorName = course.tutor?.username || "Tutor";
  const tutorAvatar =
    course.tutor?.profilePhoto ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(tutorName)}`;

  return (
    <article className={styles.left}>
      <div className={styles.heroTop}>
        <span className={styles.kicker}>Course details</span>

        <button
          type="button"
          className={`${styles.saveButton} ${
            saved ? styles.saved : ""
          }`}
          onClick={onSave}
        >
          {saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
          {saved ? "Saved" : "Save course"}
        </button>
      </div>

      <h1>{course.title}</h1>
      <p className={styles.desc}>
        {course.description?.trim() ||
          "A focused learning experience built around practical progress."}
      </p>

      <button
        type="button"
        className={styles.tutor}
        onClick={() => {
          if (course.tutor?._id) {
            navigate(`/public-profile/${course.tutor._id}`);
          }
        }}
      >
        <img src={tutorAvatar} alt={tutorName} />
        <div className={styles.tutorText}>
          <strong>@{tutorName}</strong>
          <span>View tutor profile</span>
        </div>
      </button>

      <div className={styles.badges}>
        <span>{course.category || "General"}</span>
        <span>{course.level || "All levels"}</span>
        <span>{course.duration || "Flexible pace"}</span>
      </div>

      <div className={styles.metricRow}>
        <div className={styles.metricCard}>
          <ShieldCheck size={18} />
          <span className={styles.metricLabel}>Average rating</span>
          <strong className={styles.metricValue}>
            {avg ? avg.toFixed(1) : "New"}
          </strong>
        </div>
        <div className={styles.metricCard}>
          <Star size={18} />
          <span className={styles.metricLabel}>Ratings submitted</span>
          <strong className={styles.metricValue}>{total}</strong>
        </div>
        <div className={styles.metricCard}>
          <MessageSquareText size={18} />
          <span className={styles.metricLabel}>Written reviews</span>
          <strong className={styles.metricValue}>
            {reviewCount}
          </strong>
        </div>
      </div>

      <div className={styles.ratePanel}>
        <div>
          <span className={styles.rateLabel}>Rate this course</span>
          <p className={styles.rateCopy}>
            Share a quick signal to help other learners judge the fit.
          </p>
        </div>

        <div className={styles.ratingStars}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className={`${styles.starButton} ${
                star <= active ? styles.activeStar : ""
              }`}
              onClick={() => handleRate(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              aria-label={`Rate ${star} out of 5`}
            >
              <Star size={17} fill="currentColor" />
            </button>
          ))}
        </div>

        <span className={styles.ratingText}>
          {avg ? avg.toFixed(1) : "New"} average from {total} ratings
        </span>
      </div>

      {course.skills?.length ? (
        <div className={styles.skillsSection}>
          <span className={styles.skillsLabel}>Covered topics</span>
          <div className={styles.skills}>
            {course.skills.map((skill: string) => (
              <span key={skill}>{skill}</span>
            ))}
          </div>
        </div>
      ) : null}
    </article>
  );
};

export default CourseHero;
