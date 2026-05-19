import {
  BadgeCheck,
  Bookmark,
  BookmarkCheck,
  MessageSquareText,
  ShieldCheck,
  Star,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import styles from "./CourseDetails.module.scss";

const getDemoVideoEmbed = (demoVideoUrl?: string) => {
  if (!demoVideoUrl?.trim()) {
    return null;
  }

  try {
    const url = new URL(demoVideoUrl.trim());
    const hostname = url.hostname.toLowerCase();

    if (hostname === "youtu.be") {
      const videoId = url.pathname.replaceAll("/", "");
      return videoId
        ? {
            type: "iframe" as const,
            src: `https://www.youtube.com/embed/${videoId}`,
          }
        : null;
    }

    if (hostname === "youtube.com" || hostname === "www.youtube.com") {
      const videoId =
        url.searchParams.get("v") ||
        url.pathname.split("/").filter(Boolean).at(-1) ||
        "";

      return videoId
        ? {
            type: "iframe" as const,
            src: `https://www.youtube.com/embed/${videoId}`,
          }
        : null;
    }

    if (hostname === "drive.google.com") {
      const fileMatch =
        url.pathname.match(/\/file\/d\/([^/]+)/)?.[1] ||
        url.searchParams.get("id");

      return fileMatch
        ? {
            type: "iframe" as const,
            src: `https://drive.google.com/file/d/${fileMatch}/preview`,
          }
        : null;
    }

    const isDirectVideo = /\.(mp4|webm|ogg)(\?|#|$)/i.test(url.pathname);
    const isCloudinaryVideo =
      hostname === "res.cloudinary.com" && url.pathname.includes("/video/");

    if (isDirectVideo || isCloudinaryVideo) {
      return {
        type: "video" as const,
        src: demoVideoUrl.trim(),
      };
    }

    return {
      type: "link" as const,
      src: demoVideoUrl.trim(),
    };
  } catch {
    return null;
  }
};

const CourseHero = ({
  course,
  hover,
  setHover,
  userRating,
  handleRate,
  saved,
  onSave,
  isOwnCourse = false,
}: any) => {
  const navigate = useNavigate();
  const isVerifiedTutor =
    !!course.tutor?.isAdmin ||
    ["identity", "tutor"].includes(course.tutor?.verifiedBadgeLevel || "none");
  const isTuition = course.type === "tuition";
  const tuitionScheduleLabel = isTuition
    ? `${
        course.tuitionSchedule?.days?.length
          ? course.tuitionSchedule.days.join(", ")
          : "Weekly timetable"
      }${
        course.tuitionSchedule?.startTime
          ? ` at ${course.tuitionSchedule.startTime}`
          : ""
      }`
    : "";

  const avg = course.averageRating || 0;
  const total = course.totalRatings || 0;
  const active = hover || userRating || Math.round(avg);
  const reviewCount = course.reviews?.length || 0;
  const tutorName = course.tutor?.username || "Tutor";
  const tutorAvatar =
    course.tutor?.profilePhoto ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(tutorName)}`;
  const demoVideo = getDemoVideoEmbed(course.demoVideoUrl);

  return (
    <article className={styles.left}>
      <div className={styles.heroTop}>
        <span className={styles.kicker}>Course details</span>

        {!isOwnCourse ? (
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
        ) : null}
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
          <strong className={styles.identityRow}>
            <span>@{tutorName}</span>
            {isVerifiedTutor ? (
              <span
                className={`${styles.verifiedTick} ${
                  course.tutor?.isAdmin ? styles.adminTick : ""
                }`}
                aria-label={course.tutor?.isAdmin ? "Admin" : "Verified tutor"}
                title={course.tutor?.isAdmin ? "Admin" : "Verified tutor"}
              >
                <BadgeCheck size={16} />
              </span>
            ) : null}
          </strong>
          <span>View tutor profile</span>
        </div>
      </button>

      <div className={styles.badges}>
        <span>
          {course.type === "recorded"
            ? "Recorded"
            : course.type === "tuition"
              ? "Recurring tuition"
              : "Live"}
        </span>
        <span>{course.category || "General"}</span>
        <span>{course.level || "All levels"}</span>
        <span>
          {isTuition ? tuitionScheduleLabel || "Monthly schedule" : course.duration || "Flexible pace"}
        </span>
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

      {demoVideo ? (
        <section className={styles.demoSection}>
          <div className={styles.demoHeader}>
            <span className={styles.kicker}>Watch demo</span>
            <strong>Preview how this tutor teaches</strong>
          </div>

          <div className={styles.demoFrame}>
            {demoVideo.type === "iframe" ? (
              <iframe
                src={demoVideo.src}
                title={`${course.title} demo video`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : demoVideo.type === "video" ? (
              <video controls preload="metadata">
                <source src={demoVideo.src} />
                Your browser does not support inline video playback.
              </video>
            ) : (
              <div className={styles.demoFallback}>
                <p>
                  This demo is available on an external platform. Open it in a
                  new tab to preview the tutor.
                </p>
                <a href={demoVideo.src} target="_blank" rel="noreferrer">
                  Watch demo
                </a>
              </div>
            )}
          </div>
        </section>
      ) : null}

      <div className={styles.ratePanel}>
        <div>
          <span className={styles.rateLabel}>
            {isOwnCourse ? "Course sentiment" : "Rate this course"}
          </span>
          <p className={styles.rateCopy}>
            {isOwnCourse
              ? "This owner view shows how learners currently rate the course."
              : "Share a quick signal to help other learners judge the fit."}
          </p>
        </div>

        <div className={styles.ratingStars}>
          {[1, 2, 3, 4, 5].map((star) =>
            isOwnCourse ? (
              <span
                key={star}
                className={`${styles.starButton} ${
                  star <= active ? styles.activeStar : ""
                }`}
              >
                <Star size={17} fill="currentColor" />
              </span>
            ) : (
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
            )
          )}
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
