import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import styles from "./CourseDetails.module.scss";

import {
  addReview,
  getCourseById,
  rateCourse,
  type Course,
} from "../../services/courses.service";

/* TYPE GUARD */
const isUserObject = (user: any): user is { name: string } => {
  return typeof user === "object" && user !== null && "name" in user;
};

const CourseDetails = () => {
  const { id } = useParams();

  const [course, setCourse] = useState<Course | null>(null);
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  /* ⭐ RATING STATES */
  const [hover, setHover] = useState(0);
  const [userRating, setUserRating] = useState(0);

  /* ✍️ REVIEW STATES */
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;

    getCourseById(id).then((data) => {
      setCourse(data);
    });
  }, [id]);

  /* ⭐ HANDLE RATE */
  const handleRate = async (value: number) => {
    if (!id || !course) return;

    try {
      setUserRating(value);

      const res = await rateCourse(id, value);

      setCourse((prev) =>
        prev
          ? {
              ...prev,
              averageRating: res.averageRating,
              totalRatings: res.totalRatings,
            }
          : prev
      );
    } catch (err) {
      console.error(err);
    }
  };

  /* ✍️ SUBMIT REVIEW */
  const handleReviewSubmit = async () => {
    if (!id || !course) return;

    if (!reviewRating) {
      setError("Please select a rating ⭐");
      return;
    }

    if (!reviewText.trim()) {
      setError("Please write a review ✍️");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const updatedReviews = await addReview(
        id,
        reviewRating,
        reviewText
      );

      setCourse((prev) =>
        prev ? { ...prev, reviews: updatedReviews } : prev
      );

      setReviewText("");
      setReviewRating(0);
    } catch (err) {
      console.error(err);
      setError("Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  if (!course) return <div className={styles.center}>Loading...</div>;

  const avg = course.averageRating || 0;
  const total = course.totalRatings || 0;
  const activeValue = hover || userRating || Math.round(avg);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* HERO */}
        <div className={styles.hero}>
          {/* LEFT */}
          <div className={styles.left}>
            <h1>{course.title}</h1>

            <p className={styles.desc}>{course.description}</p>

            {/* ⭐ RATING */}
            <div className={styles.ratingRow}>
              <div className={styles.stars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    onClick={() => handleRate(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    className={star <= activeValue ? styles.active : ""}
                  >
                    ★
                  </span>
                ))}
              </div>

              <span className={styles.ratingText}>
                {avg.toFixed(1)} ({total} ratings)
              </span>
            </div>

            {/* BADGES */}
            <div className={styles.badges}>
              <span>{course.category}</span>
              <span>{course.level}</span>
              <span>{course.duration}</span>
            </div>

            {/* SKILLS */}
            <div className={styles.skills}>
              {course.skills?.map((s, i) => (
                <span key={i}>{s}</span>
              ))}
            </div>

            {/* SAVE */}
            <button
              className={styles.save}
              onClick={() => setSaved(!saved)}
            >
              {saved ? "❤️ Saved" : "🤍 Save Course"}
            </button>
          </div>

          {/* RIGHT */}
          <div className={styles.right}>
            <div className={styles.video}>
              <iframe
                src="https://www.youtube.com/embed/ysz5S6PUM-U"
                title="preview"
                allowFullScreen
              />
            </div>

            <div className={styles.card}>
              <h3>₹ {course.price}</h3>

              <button onClick={() => setOpen(true)}>
                Request Session
              </button>

              <ul>
                <li>✔ 1-on-1 mentorship</li>
                <li>✔ Flexible timing</li>
                <li>✔ Real-world projects</li>
              </ul>
            </div>
          </div>
        </div>

        {/* ⭐ REVIEWS SECTION */}
        <div className={styles.section}>
          <h2>Student Reviews</h2>

          {/* SUMMARY */}
          <div className={styles.summary}>
            <div className={styles.avg}>
              <h1>{avg.toFixed(1)}</h1>

              <div className={styles.stars}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <span
                    key={s}
                    className={
                      s <= Math.round(avg) ? styles.active : ""
                    }
                  >
                    ★
                  </span>
                ))}
              </div>

              <p>{total} ratings</p>
            </div>

            {/* BREAKDOWN */}
            <div className={styles.breakdown}>
              {[5, 4, 3, 2, 1].map((star) => {
                const count =
                  course.reviews?.filter(
                    (r) => r.rating === star
                  ).length || 0;

                const percent = total
                  ? (count / total) * 100
                  : 0;

                return (
                  <div key={star} className={styles.barRow}>
                    <span className={styles.starLabel}>
                      {star}★
                    </span>

                    <div className={styles.bar}>
                      <div
                        className={styles.fill}
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <span className={styles.count}>
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ADD REVIEW */}
          <div className={styles.addReview}>
            <h3>Write a review</h3>

            <div className={styles.stars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  onClick={() => setReviewRating(star)}
                  className={
                    star <= reviewRating ? styles.active : ""
                  }
                >
                  ★
                </span>
              ))}
            </div>

            <textarea
              placeholder="Share your experience..."
              value={reviewText}
              onChange={(e) =>
                setReviewText(e.target.value)
              }
            />

            {error && (
              <p className={styles.error}>{error}</p>
            )}

            <button
              onClick={handleReviewSubmit}
              disabled={
                loading ||
                !reviewRating ||
                !reviewText.trim()
              }
            >
              {loading ? "Submitting..." : "Submit Review"}
            </button>
          </div>

          {/* REVIEW LIST */}
          <div className={styles.reviewList}>
            {course.reviews?.length === 0 ? (
              <p className={styles.empty}>
                No reviews yet
              </p>
            ) : (
              course.reviews?.map((rev, i) => (
                <div key={i} className={styles.review}>
                  <div className={styles.reviewTop}>
                    <strong>
                      {isUserObject(rev.user)
                        ? rev.user.name
                        : "User"}
                    </strong>

                    <span className={styles.reviewStars}>
                      {"★".repeat(rev.rating)}
                      {"☆".repeat(5 - rev.rating)}
                    </span>
                  </div>

                  <p>{rev.comment}</p>

                  <span className={styles.time}>
                    {new Date(
                      rev.createdAt
                    ).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* MOBILE CTA */}
      <div className={styles.mobileBar}>
        <button onClick={() => setOpen(true)}>
          Request Session • ₹ {course.price}
        </button>
      </div>

      {/* MODAL */}
      {open && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Book Session</h3>

            <input type="date" />
            <input type="time" />

            <button>Confirm Booking</button>
            <span onClick={() => setOpen(false)}>
              Close
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetails;