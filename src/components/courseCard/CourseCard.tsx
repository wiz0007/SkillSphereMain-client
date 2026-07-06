import { useState } from "react";
import {
  BadgeCheck,
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

/* CATEGORY IMAGES */
import designImg from "../../assets/design.png";
import marketingImg from "../../assets/marketing.png";
import programmingImg from "../../assets/programming.png";
import sportImg from "../../assets/sport.png";
import othersImg from "../../assets/others.png";

interface Props {
  course: Course;
}

const isVerifiedTutor = (tutor?: Course["tutor"]) =>
  !!tutor?.isAdmin ||
  ["identity", "tutor"].includes(tutor?.verifiedBadgeLevel || "none");

/* CATEGORY IMAGE MAPPER */
const getCategoryImage = (category?: string) => {
  const normalized = category?.toLowerCase() || "";

  if (
    normalized.includes("programming") ||
    normalized.includes("development") ||
    normalized.includes("coding")
  ) {
    return programmingImg;
  }

  if (
    normalized.includes("design") ||
    normalized.includes("ui") ||
    normalized.includes("ux")
  ) {
    return designImg;
  }

  if (
    normalized.includes("marketing") ||
    normalized.includes("business")
  ) {
    return marketingImg;
  }

  if (
    normalized.includes("sport") ||
    normalized.includes("fitness")
  ) {
    return sportImg;
  }

  return othersImg;
};

const CourseCard = ({ course }: Props) => {
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

  const isTuition = course.type === "tuition";
  const coursePath = `/courses/${course.slug || course._id}`;

  const typeLabel =
    course.type === "recorded"
      ? "Recorded unlock"
      : isTuition
        ? "Weekly tuition"
        : "Live session";

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

  return (
    <article className={styles.card} onClick={() => navigate(coursePath)}>
      <div className={styles.image}>
        <img
          src={getCategoryImage(course.category)}
          alt={course.category || course.title}
        />

        <span className={styles.typePill}>{typeLabel}</span>

        <button
          type="button"
          className={styles.save}
          onClick={(event) => {
            event.stopPropagation();
            handleSave(course._id);
          }}
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
          onClick={(event) => {
            event.stopPropagation();
            navigate(`/tutors/${course.tutor?._id}`);
          }}
        >
          <img
            src={
              course.tutor?.profilePhoto ||
              `https://ui-avatars.com/api/?name=${course.tutor?.username}`
            }
            alt={course.tutor?.username}
          />

          <span className={styles.identityRow}>
            <span>@{course.tutor?.username || "tutor"}</span>

            {isVerifiedTutor(course.tutor) ? (
              <span
                className={`${styles.verifiedTick} ${
                  course.tutor?.isAdmin ? styles.adminTick : ""
                }`}
                aria-label={
                  course.tutor?.isAdmin
                    ? "Admin"
                    : "Verified tutor"
                }
                title={
                  course.tutor?.isAdmin
                    ? "Admin"
                    : "Verified tutor"
                }
              >
                <BadgeCheck size={15} />
              </span>
            ) : null}
          </span>
        </button>

        <div className={styles.metrics}>
          <div className={styles.metric}>
            <IndianRupee size={15} />

            <span>
              {course.price ?? 0}

              {course.type === "recorded"
                ? " SC unlock"
                : isTuition
                  ? "/month"
                  : "/hr"}
            </span>
          </div>

          <div className={styles.metric}>
            <Clock3 size={15} />

            <span>
              {isTuition
                ? scheduleLabel || "Recurring timetable"
                : course.duration || "Flexible"}
            </span>
          </div>

          <div className={styles.metric}>
            <Layers3 size={15} />

            <span>
              {isTuition
                ? course.duration || "Per class"
                : course.level || "All levels"}
            </span>
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
                onClick={(event) => {
                  event.stopPropagation();
                  handleRate(star);
                }}
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



